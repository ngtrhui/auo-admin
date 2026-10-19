import type { StaffForm, StaffMember, StaffStatus } from "@/types/staff";

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 124,
    userId: 124,
    employeeCode: "NV-00124",
    fullName: "Nguyễn Minh Anh",
    email: "minhanh.nguyen@auo.vn",
    phone: "090 123 4567",
    gender: "Nữ",
    dateOfBirth: "1995-03-12",
    role: "ADMIN",
    status: "active",
    position: "Trưởng phòng nhân sự",
    hireDate: "2022-03-12",
    resignationDate: null,
    createdAt: "2022-03-12",
    updatedAt: "2026-10-18",
  },
  {
    id: 123,
    userId: 123,
    employeeCode: "NV-00123",
    fullName: "Trần Hoàng Nam",
    email: "nam.tran@auo.vn",
    phone: "091 234 5678",
    gender: "Nam",
    dateOfBirth: "1990-11-08",
    role: "ADMIN",
    status: "active",
    position: "Lập trình viên",
    hireDate: "2023-11-08",
    resignationDate: null,
    createdAt: "2023-11-08",
    updatedAt: "2026-10-16",
  },
  {
    id: 122,
    userId: 122,
    employeeCode: "NV-00122",
    fullName: "Lê Thu Hà",
    email: "ha.le@auo.vn",
    phone: "093 345 6789",
    gender: "Nữ",
    dateOfBirth: "1998-06-21",
    role: "ADMIN",
    status: "active",
    position: "Chuyên viên kinh doanh",
    hireDate: "2024-06-21",
    resignationDate: null,
    createdAt: "2024-06-21",
    updatedAt: "2026-10-12",
  },
  {
    id: 121,
    userId: 121,
    employeeCode: "NV-00121",
    fullName: "Phạm Quốc Bảo",
    email: "bao.pham@auo.vn",
    phone: "098 456 7890",
    gender: "Nam",
    dateOfBirth: "1987-01-17",
    role: "ADMIN",
    status: "inactive",
    position: "Điều phối viên",
    hireDate: "2021-01-17",
    resignationDate: "2025-12-31",
    createdAt: "2021-01-17",
    updatedAt: "2025-12-31",
  },
  {
    id: 120,
    userId: 120,
    employeeCode: "NV-00120",
    fullName: "Võ Ngọc Mai",
    email: "mai.vo@auo.vn",
    phone: "097 567 8901",
    gender: "Nữ",
    dateOfBirth: "1993-09-04",
    role: "ADMIN",
    status: "active",
    position: "Quản lý sản phẩm",
    hireDate: "2022-09-04",
    resignationDate: null,
    createdAt: "2022-09-04",
    updatedAt: "2026-10-19",
  },
  {
    id: 119,
    userId: 119,
    employeeCode: "NV-00119",
    fullName: "Đặng Gia Huy",
    email: "huy.dang@auo.vn",
    phone: "096 678 9012",
    gender: "Nam",
    dateOfBirth: "1992-04-15",
    role: "ADMIN",
    status: "inactive",
    position: "Kế toán tổng hợp",
    hireDate: "2020-04-15",
    resignationDate: "2024-08-30",
    createdAt: "2020-04-15",
    updatedAt: "2024-08-30",
  },
];

export const EMPTY_STAFF_FORM: StaffForm = {
  employeeCode: "",
  fullName: "",
  email: "",
  password: "",
  phone: "",
  gender: "",
  dateOfBirth: "",
  role: "ADMIN",
  position: "",
  hireDate: "",
};

export const STAFF_STATUS_LABELS: Record<StaffStatus, string> = {
  active: "Đang hoạt động",
  inactive: "Đã vô hiệu hóa",
};

export function getStaffInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function formatStaffDate(date: string | null) {
  if (!date) return "—";

  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
}

export function getTodayDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;
}
