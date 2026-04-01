// Re-export all types inferred from Zod schemas
export type {
  AuthTokens,
  AuthUser,
  LoginInput,
  LoginResponse,
  RegisterInput,
  RegisterResponse,
} from '../schemas/auth';

export type { UpdateProfileInput, UserProfile } from '../schemas/user';

export type {
  CreateVisaInput,
  UpdateVisaInput,
  Visa,
  VisaPeriod,
  VisaSubclass,
  VisaType,
  WeeklyProgress,
} from '../schemas/visa';

export type {
  CreateEmployerInput,
  Employer,
  IndustryType,
  UpdateEmployerInput,
} from '../schemas/employer';

export type {
  DayHoursEntry,
  HoursList,
  HoursResponse,
  MonthHours,
  WeekData,
  WeeklyEmployer,
  WeeklyHoursResponse,
  WeekVisaBreakdown,
  WorkEntry,
  WorkEntryWithEmployer,
} from '../schemas/work-entry';

export type {
  ChangeDetailParam,
  ChangeDetailQuery,
  ChangeDetailResponse,
  GlobalChangeEntry,
  GlobalChangesQuery,
  GlobalChangesResponse,
  LastUpdateResponse,
  PaginatedDirectoryItem,
  PaginatedDirectoryQuery,
  PaginatedDirectoryResponse,
  Postcode,
  PostcodeBadgeData,
  PostcodeDetailResponse,
  PostcodeHistoryEntry,
  SuburbWithPostcode,
} from '../schemas/postcode';

export type {
  FavoritePostcodeResponse,
  ToggleFavoritePostcodeInput,
} from '../schemas/favorite';
