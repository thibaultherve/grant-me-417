/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { VisaProgressService } from '../visa-progress.service';
import { PrismaService } from '../../prisma/prisma.service';

// Real constants from shared — needed for hoursToEligibleDays
jest.mock('@regranted/shared', () => ({
  HOUR_TO_DAY_THRESHOLDS: [
    { minHours: 30, eligibleDays: 7 },
    { minHours: 24, eligibleDays: 4 },
    { minHours: 18, eligibleDays: 3 },
    { minHours: 12, eligibleDays: 2 },
    { minHours: 6, eligibleDays: 1 },
  ],
  getDaysRequired: (visaType: string) => {
    const map: Record<string, number> = {
      first_whv: 88,
      second_whv: 179,
      third_whv: 0,
    };
    return map[visaType] ?? 0;
  },
}));

const mockPrisma = {
  userVisa: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  workEntry: {
    findMany: jest.fn(),
  },
  visaWeeklyProgress: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    createMany: jest.fn(),
    deleteMany: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  $executeRaw: jest.fn(),
};

describe('VisaProgressService', () => {
  let service: VisaProgressService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VisaProgressService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<VisaProgressService>(VisaProgressService);
  });

  // ─── hoursToEligibleDays (pure computation) ─────────────────────────────

  describe('hoursToEligibleDays', () => {
    it('should return 7 days for 30+ hours', () => {
      expect(service.hoursToEligibleDays(30)).toBe(7);
      expect(service.hoursToEligibleDays(40)).toBe(7);
      expect(service.hoursToEligibleDays(35.5)).toBe(7);
    });

    it('should return 4 days for 24-29 hours', () => {
      expect(service.hoursToEligibleDays(24)).toBe(4);
      expect(service.hoursToEligibleDays(29.99)).toBe(4);
    });

    it('should return 3 days for 18-23 hours', () => {
      expect(service.hoursToEligibleDays(18)).toBe(3);
      expect(service.hoursToEligibleDays(23.99)).toBe(3);
    });

    it('should return 2 days for 12-17 hours', () => {
      expect(service.hoursToEligibleDays(12)).toBe(2);
      expect(service.hoursToEligibleDays(17.99)).toBe(2);
    });

    it('should return 1 day for 6-11 hours', () => {
      expect(service.hoursToEligibleDays(6)).toBe(1);
      expect(service.hoursToEligibleDays(11.99)).toBe(1);
    });

    it('should return 0 days for less than 6 hours', () => {
      expect(service.hoursToEligibleDays(5.99)).toBe(0);
      expect(service.hoursToEligibleDays(0)).toBe(0);
    });

    it('should handle exact threshold boundaries', () => {
      expect(service.hoursToEligibleDays(6)).toBe(1);
      expect(service.hoursToEligibleDays(12)).toBe(2);
      expect(service.hoursToEligibleDays(18)).toBe(3);
      expect(service.hoursToEligibleDays(24)).toBe(4);
      expect(service.hoursToEligibleDays(30)).toBe(7);
    });
  });

  // ─── calculateWeeklyProgress ────────────────────────────────────────────

  describe('calculateWeeklyProgress', () => {
    const visaId = 'visa-1';
    const weekStart = new Date('2025-01-06'); // Monday
    const weekEnd = new Date('2025-01-12'); // Sunday

    it('should return zeros if visa not found', async () => {
      mockPrisma.userVisa.findUnique.mockResolvedValue(null);

      const result = await service.calculateWeeklyProgress(
        visaId,
        weekStart,
        weekEnd,
      );

      expect(result).toEqual({
        hours: 0,
        eligibleHours: 0,
        eligibleDays: 0,
        daysWorked: 0,
      });
    });

    it('should return zeros if week is outside visa period', async () => {
      mockPrisma.userVisa.findUnique.mockResolvedValue({
        id: visaId,
        userId: 'user-1',
        arrivalDate: new Date('2025-02-01'), // visa starts after this week
        expiryDate: new Date('2026-02-01'),
      });

      const result = await service.calculateWeeklyProgress(
        visaId,
        weekStart,
        weekEnd,
      );

      expect(result).toEqual({
        hours: 0,
        eligibleHours: 0,
        eligibleDays: 0,
        daysWorked: 0,
      });
    });

    it('should sum hours and separate eligible from total', async () => {
      mockPrisma.userVisa.findUnique.mockResolvedValue({
        id: visaId,
        userId: 'user-1',
        arrivalDate: new Date('2025-01-01'),
        expiryDate: new Date('2026-01-01'),
      });

      mockPrisma.workEntry.findMany.mockResolvedValue([
        {
          hours: 8,
          workDate: new Date('2025-01-06'),
          employer: { isEligible: true },
        },
        {
          hours: 6,
          workDate: new Date('2025-01-07'),
          employer: { isEligible: true },
        },
        {
          hours: 4,
          workDate: new Date('2025-01-08'),
          employer: { isEligible: false },
        },
      ]);

      const result = await service.calculateWeeklyProgress(
        visaId,
        weekStart,
        weekEnd,
      );

      expect(result.hours).toBe(18);
      expect(result.eligibleHours).toBe(14); // 8 + 6 from eligible employers
      expect(result.eligibleDays).toBe(2); // 14 hours → 2 days (12-17 bracket)
      expect(result.daysWorked).toBe(3); // 3 unique dates
    });

    it('should count unique worked days (not entries)', async () => {
      mockPrisma.userVisa.findUnique.mockResolvedValue({
        id: visaId,
        userId: 'user-1',
        arrivalDate: new Date('2025-01-01'),
        expiryDate: new Date('2026-01-01'),
      });

      // Two entries on the same day (different employers)
      mockPrisma.workEntry.findMany.mockResolvedValue([
        {
          hours: 4,
          workDate: new Date('2025-01-06'),
          employer: { isEligible: true },
        },
        {
          hours: 4,
          workDate: new Date('2025-01-06'),
          employer: { isEligible: true },
        },
      ]);

      const result = await service.calculateWeeklyProgress(
        visaId,
        weekStart,
        weekEnd,
      );

      expect(result.daysWorked).toBe(1); // same date = 1 day
      expect(result.hours).toBe(8);
      expect(result.eligibleHours).toBe(8);
    });
  });

  // ─── calculateVisaProgress ──────────────────────────────────────────────

  describe('calculateVisaProgress', () => {
    it('should do nothing if visa not found', async () => {
      mockPrisma.userVisa.findUnique.mockResolvedValue(null);

      await service.calculateVisaProgress('visa-1');

      expect(mockPrisma.userVisa.update).not.toHaveBeenCalled();
    });

    it('should aggregate weekly rows and update visa', async () => {
      mockPrisma.userVisa.findUnique.mockResolvedValue({
        id: 'visa-1',
        daysRequired: 88,
      });

      mockPrisma.visaWeeklyProgress.findMany.mockResolvedValue([
        { eligibleDays: 7, daysWorked: 5 },
        { eligibleDays: 4, daysWorked: 3 },
        { eligibleDays: 3, daysWorked: 2 },
      ]);

      await service.calculateVisaProgress('visa-1');

      expect(mockPrisma.userVisa.update).toHaveBeenCalledWith({
        where: { id: 'visa-1' },
        data: {
          eligibleDays: 14,
          daysWorked: 10,
          daysRemaining: 74, // 88 - 14
          progressPercentage: 15.91, // (14/88)*100 rounded to 2 decimals
          isEligible: false,
        },
      });
    });

    it('should set isEligible true when days met', async () => {
      mockPrisma.userVisa.findUnique.mockResolvedValue({
        id: 'visa-1',
        daysRequired: 10,
      });

      mockPrisma.visaWeeklyProgress.findMany.mockResolvedValue([
        { eligibleDays: 7, daysWorked: 5 },
        { eligibleDays: 4, daysWorked: 3 },
      ]);

      await service.calculateVisaProgress('visa-1');

      expect(mockPrisma.userVisa.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isEligible: true,
            daysRemaining: 0,
          }),
        }),
      );
    });

    it('should handle zero daysRequired gracefully', async () => {
      mockPrisma.userVisa.findUnique.mockResolvedValue({
        id: 'visa-1',
        daysRequired: 0,
      });

      mockPrisma.visaWeeklyProgress.findMany.mockResolvedValue([]);

      await service.calculateVisaProgress('visa-1');

      expect(mockPrisma.userVisa.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            progressPercentage: 0,
            isEligible: true, // 0 >= 0
          }),
        }),
      );
    });
  });

  // ─── generateWeeklyRows ────────────────────────────────────────────────

  describe('generateWeeklyRows', () => {
    it('should do nothing if visa not found', async () => {
      mockPrisma.userVisa.findUnique.mockResolvedValue(null);

      await service.generateWeeklyRows('visa-1');

      expect(mockPrisma.visaWeeklyProgress.deleteMany).not.toHaveBeenCalled();
      expect(mockPrisma.visaWeeklyProgress.createMany).not.toHaveBeenCalled();
    });

    it('should do nothing if visa has no expiry date', async () => {
      mockPrisma.userVisa.findUnique.mockResolvedValue({
        id: 'visa-1',
        arrivalDate: new Date('2025-01-01'),
        expiryDate: null,
      });

      await service.generateWeeklyRows('visa-1');

      expect(mockPrisma.visaWeeklyProgress.deleteMany).not.toHaveBeenCalled();
    });

    it('should delete old rows and create new ones for visa period', async () => {
      mockPrisma.userVisa.findUnique.mockResolvedValue({
        id: 'visa-1',
        arrivalDate: new Date('2025-01-06'), // Monday
        expiryDate: new Date('2025-01-19'), // Sunday (2 full weeks)
      });

      await service.generateWeeklyRows('visa-1');

      expect(mockPrisma.visaWeeklyProgress.deleteMany).toHaveBeenCalledWith({
        where: { userVisaId: 'visa-1' },
      });

      expect(mockPrisma.visaWeeklyProgress.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            userVisaId: 'visa-1',
            hours: 0,
            eligibleHours: 0,
            eligibleDays: 0,
            daysWorked: 0,
          }),
        ]),
      });

      // Should create 2 weeks of rows
      const createCall = mockPrisma.visaWeeklyProgress.createMany.mock.calls[0];
      expect(createCall[0].data.length).toBe(2);
    });
  });

  // ─── getDaysRequired ────────────────────────────────────────────────────

  describe('getDaysRequired', () => {
    it('should return correct days for known visa types', () => {
      expect(service.getDaysRequired('first_whv')).toBe(88);
      expect(service.getDaysRequired('second_whv')).toBe(179);
      expect(service.getDaysRequired('third_whv')).toBe(0);
    });

    it('should return 0 for unknown visa type', () => {
      expect(service.getDaysRequired('unknown')).toBe(0);
    });
  });
});
