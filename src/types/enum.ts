export const OpenWorkStatus = {
  READY_TO_WORK: 'READY_TO_WORK',
  OPEN_TO_NEW_OPPORTUNITIES: 'OPEN_TO_NEW_OPPORTUNITIES',
  NOT_LOOKING_FOR_A_CHANGE: 'NOT_LOOKING_FOR_A_CHANGE',
} as const;
export type OpenWorkStatus = (typeof OpenWorkStatus)[keyof typeof OpenWorkStatus];

export const OPEN_WORK_STATUS_VALUES: ReadonlyArray<OpenWorkStatus> = [
  OpenWorkStatus.READY_TO_WORK,
  OpenWorkStatus.OPEN_TO_NEW_OPPORTUNITIES,
  OpenWorkStatus.NOT_LOOKING_FOR_A_CHANGE,
] as const;

export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

/** Giới tính yêu cầu khi đăng tin — `NONE` = không yêu cầu. */
export type RequiredGender = Gender | 'NONE';

export const REQUIRED_GENDER_VALUES: ReadonlyArray<RequiredGender> = [
  'NONE',
  Gender.MALE,
  Gender.FEMALE,
];

export const MarriedStatus = {
  SINGLE: 'SINGLE',
  MARRIED: 'MARRIED',
} as const;
export type MarriedStatus = (typeof MarriedStatus)[keyof typeof MarriedStatus];

export const EducationLevel = {
  HIGH_SCHOOL: 0,
  COLLEGE: 1,
  UNIVERSITY: 2,
} as const;

export type EducationLevel = (typeof EducationLevel)[keyof typeof EducationLevel];

export const LanguageProficiency = {
  BASIC: 'BASIC',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
} as const;
export type LanguageProficiency = (typeof LanguageProficiency)[keyof typeof LanguageProficiency];

export const WorkingType = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  REMOTE: 'REMOTE',
  HYBRID: 'HYBRID',
} as const;

export type WorkingType = (typeof WorkingType)[keyof typeof WorkingType];

export const AdvancedFeature = {
  AUTO_REFRESH_PER_DAY: 'AUTO_REFRESH_PER_DAY',
  DISPLAY_HOT_JOB: 'DISPLAY_HOT_JOB',
  PIN_TOP_FOR_ONE_DAY: 'PIN_TOP_FOR_ONE_DAY',
  CAN_START_IMMEDIATELY: 'CAN_START_IMMEDIATELY',
  SERIOUS_JOB: 'SERIOUS_JOB',
} as const;
export type AdvancedFeature = (typeof AdvancedFeature)[keyof typeof AdvancedFeature];

export const PaymentMethod = {
  WALLET: 'WALLET',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const ExperienceLevel = {
  NO_EXPERIENCE: 'no_experience',
  UNDER_ONE_YEAR: 'under_1_year',
  ONE_YEAR: '1_year',
  TWO_YEARS: '2_years',
  THREE_YEARS: '3_years',
  FOUR_YEARS: '4_years',
  FIVE_YEARS: '5_years',
} as const;

export type ExperienceLevel = (typeof ExperienceLevel)[keyof typeof ExperienceLevel];

export const Benefit = {
  COMPETITIVE_SALARY: 'COMPETITIVE_SALARY',
  FREE_SNACKS: 'FREE_SNACKS',
  INTERNATIONAL_COMMUNICATION: 'INTERNATIONAL_COMMUNICATION',
  PAID_SICK_LEAVE: 'PAID_SICK_LEAVE',
  HOLIDAY_BONUS: 'HOLIDAY_BONUS',
  BONUS: 'BONUS',
  CASUAL_DRESS_CODE: 'CASUAL_DRESS_CODE',
  FREE_LUNCH: 'FREE_LUNCH',
  HEALTH_INSURANCE: 'HEALTH_INSURANCE',
  SOCIAL_INSURANCE: 'SOCIAL_INSURANCE',
  TRAINING: 'TRAINING',
  OTHERS: 'OTHERS',
} as const;
export type Benefit = (typeof Benefit)[keyof typeof Benefit];

export const EXPERIENCE_LEVEL_ORDER = [
  ExperienceLevel.NO_EXPERIENCE,
  ExperienceLevel.UNDER_ONE_YEAR,
  ExperienceLevel.ONE_YEAR,
  ExperienceLevel.TWO_YEARS,
  ExperienceLevel.THREE_YEARS,
  ExperienceLevel.FOUR_YEARS,
  ExperienceLevel.FIVE_YEARS,
] as const;

export const JOB_CONTENT_TYPE = {
  JOB_DESCRIPTION: 'JOB_DESCRIPTION',
  JOB_REQUIREMENTS: 'JOB_REQUIREMENTS',
  BENEFITS: 'BENEFITS',
} as const;
export type JOB_CONTENT_TYPE = (typeof JOB_CONTENT_TYPE)[keyof typeof JOB_CONTENT_TYPE];

export const ACTIVITY_TYPE = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CREATE_JOB: 'CREATE_JOB',
  UPDATE_JOB: 'UPDATE_JOB',
  DELETE_JOB: 'DELETE_JOB',
  SAVE_CANDIDATE: 'SAVE_CANDIDATE',
  OPEN_CONTACT: 'OPEN_CONTACT',
  SEND_CONNECTION: 'SEND_CONNECTION',
  APPLY_JOB: 'APPLY_JOB',
  GENERATE_JOB_AI: 'GENERATE_JOB_AI',
} as const;
export type ACTIVITY_TYPE = (typeof ACTIVITY_TYPE)[keyof typeof ACTIVITY_TYPE];

export const EMPLOYER_CANDIDATE_STATUS = {
  APPLIED: 'APPLIED',
  VIEWED: 'VIEWED',
  MATCHED: 'MATCHED',
  CONTACTED: 'CONTACTED',
  INTERVIEWED: 'INTERVIEWED',
  OFFER_SENT: 'OFFER_SENT',
  SUCCESSFUL: 'SUCCESSFUL',
  REJECTED: 'REJECTED',
} as const;

export type EmployerCandidateStatus =
  (typeof EMPLOYER_CANDIDATE_STATUS)[keyof typeof EMPLOYER_CANDIDATE_STATUS];

export const EMPLOYER_CANDIDATE_STATUS_VALUES: ReadonlyArray<EmployerCandidateStatus> = [
  EMPLOYER_CANDIDATE_STATUS.APPLIED,
  EMPLOYER_CANDIDATE_STATUS.VIEWED,
  EMPLOYER_CANDIDATE_STATUS.MATCHED,
  EMPLOYER_CANDIDATE_STATUS.CONTACTED,
  EMPLOYER_CANDIDATE_STATUS.INTERVIEWED,
  EMPLOYER_CANDIDATE_STATUS.OFFER_SENT,
  EMPLOYER_CANDIDATE_STATUS.SUCCESSFUL,
  EMPLOYER_CANDIDATE_STATUS.REJECTED,
] as const;

export const GENDER_VALUES: ReadonlyArray<Gender> = [Gender.FEMALE, Gender.MALE];

export const MARITAL_STATUS_VALUES: ReadonlyArray<MarriedStatus> = [
  MarriedStatus.SINGLE,
  MarriedStatus.MARRIED,
];

export const EDUCATION_LEVEL_OPTIONS: ReadonlyArray<{
  value: EducationLevel;
  key: 'HIGH_SCHOOL' | 'COLLEGE' | 'UNIVERSITY';
}> = [
  {
    value: EducationLevel.HIGH_SCHOOL,
    key: 'HIGH_SCHOOL',
  },
  { value: EducationLevel.COLLEGE, key: 'COLLEGE' },
  { value: EducationLevel.UNIVERSITY, key: 'UNIVERSITY' },
];

export const LANGUAGE_PROFICIENCY_OPTIONS: ReadonlyArray<{
  value: LanguageProficiency;
  key: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
}> = [
  { value: LanguageProficiency.BASIC, key: 'BASIC' },
  { value: LanguageProficiency.INTERMEDIATE, key: 'INTERMEDIATE' },
  { value: LanguageProficiency.ADVANCED, key: 'ADVANCED' },
];

export const WORKING_TYPE_ORDER = [
  WorkingType.FULL_TIME,
  WorkingType.PART_TIME,
  WorkingType.REMOTE,
  WorkingType.HYBRID,
] as const;

export const RecruitmentPipelineStatus = {
  REJECTED: 'REJECTED',
  HIRED: 'HIRED',
  CV_VIEWED: 'CV_VIEWED',
  INTERVIEWED: 'INTERVIEWED',
} as const;
export type RecruitmentPipelineStatus =
  (typeof RecruitmentPipelineStatus)[keyof typeof RecruitmentPipelineStatus];

export const AppliedJobStatus = {
  APPLIED: 'APPLIED',
  VIEWED: 'VIEWED',
  MATCHED: 'MATCHED',
  CONTACTED: 'CONTACTED',
  INTERVIEWED: 'INTERVIEWED',
  OFFER_SENT: 'OFFER_SENT',
  SUCCESSFUL: 'SUCCESSFUL',
  REJECTED: 'REJECTED',
} as const;
export type AppliedJobStatus = (typeof AppliedJobStatus)[keyof typeof AppliedJobStatus];

export const CompaniesStatus = {
  APPROVED: 'APPROVED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
} as const;
export type CompaniesStatus = (typeof CompaniesStatus)[keyof typeof CompaniesStatus];

// ------------------- Fit Rate Recommend/Candidate Filter-------------------
export const FitRateLevel = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  VERY_HIGH: 'VERY_HIGH',
} as const;
export type FitRateLevel = (typeof FitRateLevel)[keyof typeof FitRateLevel];

export const FIT_RATE_LEVEL_RANGE: Record<FitRateLevel, { min: number; max: number }> = {
  [FitRateLevel.LOW]: { min: 0, max: 39 },
  [FitRateLevel.MEDIUM]: { min: 40, max: 69 },
  [FitRateLevel.HIGH]: { min: 70, max: 84 },
  [FitRateLevel.VERY_HIGH]: { min: 85, max: 100 },
};

export const CandidateFilterPeriod = {
  ALL: 'ALL',
  LAST_7_DAYS: 'LAST_7_DAYS',
  LAST_30_DAYS: 'LAST_30_DAYS',
} as const;
export type CandidateFilterPeriod =
  (typeof CandidateFilterPeriod)[keyof typeof CandidateFilterPeriod];

export const CANDIDATE_FILTER_PERIOD_VALUES: ReadonlyArray<CandidateFilterPeriod> = [
  CandidateFilterPeriod.ALL,
  CandidateFilterPeriod.LAST_7_DAYS,
  CandidateFilterPeriod.LAST_30_DAYS,
] as const;

export const CANDIDATE_FILTER_PERIOD_DAYS: Record<CandidateFilterPeriod, number | null> = {
  [CandidateFilterPeriod.ALL]: null,
  [CandidateFilterPeriod.LAST_7_DAYS]: 7,
  [CandidateFilterPeriod.LAST_30_DAYS]: 30,
};

/** Khoảng thời gian thống kê dashboard — giá trị gửi API analytics. */
export const StatisticsPeriod = {
  TODAY: 'today',
  SEVEN_DAYS: '7_days',
  THIRTY_DAYS: '30_days',
  CUSTOM: 'custom',
} as const;
export type StatisticsPeriod = (typeof StatisticsPeriod)[keyof typeof StatisticsPeriod];

export const STATISTICS_PERIOD_VALUES: ReadonlyArray<StatisticsPeriod> = [
  StatisticsPeriod.TODAY,
  StatisticsPeriod.SEVEN_DAYS,
  StatisticsPeriod.THIRTY_DAYS,
  StatisticsPeriod.CUSTOM,
] as const;

export const SORT_FIND_CANDIDATE_PROFILE_BY_OPTIONS = {
  SUITABLE: 'suitable',
  NEWEST: 'newest',
  EXPERIENCE: 'experience',
  SALARY: 'salary',
} as const;

export type SortFindCandidateProfileBy =
  (typeof SORT_FIND_CANDIDATE_PROFILE_BY_OPTIONS)[keyof typeof SORT_FIND_CANDIDATE_PROFILE_BY_OPTIONS];

export const SupportStatus = {
  PENDING: 'PENDING',
  RESOLVED: 'RESOLVED',
} as const;

export type SupportStatus = (typeof SupportStatus)[keyof typeof SupportStatus];

export const SUPPORT_STATUS_VALUES: ReadonlyArray<SupportStatus> = [
  SupportStatus.PENDING,
  SupportStatus.RESOLVED,
] as const;

export const SupportType = {
  GENERAL: 'GENERAL',
  RECRUITMENT_CONSULTATION: 'RECRUITMENT_CONSULTATION',
} as const;

export type SupportType = (typeof SupportType)[keyof typeof SupportType];

/** Trạng thái giao dịch nạp tiền (wallet deposit). */
export const PaymentTransactionStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
} as const;

export type PaymentTransactionStatus =
  (typeof PaymentTransactionStatus)[keyof typeof PaymentTransactionStatus];

export const PAYMENT_TRANSACTION_STATUS_VALUES: ReadonlyArray<PaymentTransactionStatus> = [
  PaymentTransactionStatus.PENDING,
  PaymentTransactionStatus.PAID,
  PaymentTransactionStatus.EXPIRED,
  PaymentTransactionStatus.CANCELLED,
  PaymentTransactionStatus.FAILED,
] as const;

export const CompanySize = {
  RANGE_1_10: '1-10',
  RANGE_11_50: '11-50',
  RANGE_51_200: '51-200',
  RANGE_201_500: '201-500',
  RANGE_501_1000: '501-1000',
  RANGE_1001_5000: '1001-5000',
  RANGE_5001_PLUS: '5001+',
} as const;

export type CompanySize = (typeof CompanySize)[keyof typeof CompanySize];

export const Currency = {
  VND: 'VND',
  USD: 'USD',
} as const;
export type Currency = (typeof Currency)[keyof typeof Currency];
