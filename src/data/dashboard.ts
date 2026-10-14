
type DashboardRequest = {
  startDate: string;
  endDate: string;
};

// Tạm thời chưa gọi API
export const MOCK_DASHBOARD_SUMMARY = {
  totalUsers: {
    total: 1250,
    change: 12.5,
  },
  totalCvs: {
    total: 860,
    change: 8.2,
  },
  totalApplications: {
    total: 540,
    change: -3.4,
  },
  totalRevenue: {
    total: 125000000,
    change: 15.6,
  },
};

// Dữ liệu biểu đồ mẫu
export const MOCK_DASHBOARD_CHART = [
  { date: '2026-10-08', total: 120 },
  { date: '2026-10-09', total: 150 },
  { date: '2026-10-10', total: 135 },
  { date: '2026-10-11', total: 180 },
  { date: '2026-10-12', total: 165 },
  { date: '2026-10-13', total: 210 },
  { date: '2026-10-14', total: 240 },
];

// Giữ kiểu này nếu cần dùng request để lọc mock sau này.
export const getMockDashboardData = (
  _request: DashboardRequest,
) => ({
  summary: MOCK_DASHBOARD_SUMMARY,
  chart: MOCK_DASHBOARD_CHART,
});