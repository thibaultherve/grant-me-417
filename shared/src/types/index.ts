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
  PostcodeEligibility,
  PostcodeDirectoryEntry,
  PostcodeHistoryEntry,
  PostcodeDirectoryQuery,
  Suburb,
  SuburbWithPostcode,
  PaginatedDirectoryQuery,
  PaginatedDirectoryItem,
  PaginatedDirectoryResponse,
  PostcodeDetailResponse,
  GlobalChangesQuery,
  GlobalChangeEntry,
  GlobalChangesResponse,
  LastUpdateResponse,
} from '../schemas/postcode.js';

export type {
  ToggleFavoritePostcodeInput,
  FavoritePostcodeResponse,
} from '../schemas/favorite.js';
