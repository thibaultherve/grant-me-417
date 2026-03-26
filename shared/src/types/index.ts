// Re-export all types inferred from Zod schemas
export type {
  RegisterInput,
  LoginInput,
  AuthTokens,
  AuthUser,
  LoginResponse,
  RegisterResponse,
} from '../schemas/auth.js';

export type {
  UserProfile,
  UpdateProfileInput,
} from '../schemas/user.js';

export type {
  VisaType,
  CreateVisaInput,
  UpdateVisaInput,
  Visa,
  VisaResponse,
  VisaPeriod,
  WeeklyProgress,
} from '../schemas/visa.js';

export type {
  IndustryType,
  CreateEmployerInput,
  UpdateEmployerInput,
  Employer,
  EmployerResponse,
} from '../schemas/employer.js';

export type {
  WeekEntry,
  SaveWeekHoursInput,
  WorkEntry,
  WorkEntryResponse,
  WorkEntryWithEmployer,
  HoursList,
  HoursResponse,
  DayHoursEntry,
  MonthHours,
  MonthHoursResponse,
  WeeklyEmployer,
  WeekVisaBreakdown,
  WeekData,
  WeeklyHoursResponse,
} from '../schemas/work-entry.js';

export type {
  Postcode,
  PostcodeBadgeData,
  Suburb,
  SuburbWithPostcode,
} from '../schemas/postcode.js';

export type {
  ChangelogResponse,
  ChangelogsResponse,
} from '../schemas/changelog.js';
