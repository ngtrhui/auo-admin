export type DashboardSummaryRequest = {
  startDate?: string;
  endDate?: string;
};

export type DashboardSummary = {
  total: number;
  change: number;
  unit: 'percentage';
};

export type DashboardOverview = {
  totalUsers: DashboardSummary;
  totalCvs: DashboardSummary;
  totalApplications: DashboardSummary;
  totalRevenue: DashboardSummary;
};

export type DashboardChartItem = {
  label: string;
  users: number;
  cvs: number;
  applications: number;
};

export interface DashboardResponse {
  summary: DashboardOverview;
  chart: DashboardChartItem[];
}
