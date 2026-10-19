import type { StaffForm, StaffMember, StaffStatus } from "./staff.types";

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: "NV-00124",
    name: "Nguyễn Minh Anh",
    email: "minhanh.nguyen@auo.vn",
    phone: "090 123 4567",
    department: "Nhân sự",
    position: "Trưởng phòng nhân sự",
    role: "Quản lý",
    status: "active",
    joinedAt: "12/03/2022",
    location: "TP. Hồ Chí Minh",
  },
  {
    id: "NV-00123",
    name: "Trần Hoàng Nam",
    email: "nam.tran@auo.vn",
    phone: "091 234 5678",
    department: "Công nghệ",
    position: "Lập trình viên",
    role: "Nhân viên",
    status: "active",
    joinedAt: "08/11/2023",
    location: "TP. Hồ Chí Minh",
  },
  {
    id: "NV-00122",
    name: "Lê Thu Hà",
    email: "ha.le@auo.vn",
    phone: "093 345 6789",
    department: "Kinh doanh",
    position: "Chuyên viên kinh doanh",
    role: "Nhân viên",
    status: "active",
    joinedAt: "21/06/2024",
    location: "Hà Nội",
  },
  {
    id: "NV-00121",
    name: "Phạm Quốc Bảo",
    email: "bao.pham@auo.vn",
    phone: "098 456 7890",
    department: "Vận hành",
    position: "Điều phối viên",
    role: "Nhân viên",
    status: "inactive",
    joinedAt: "17/01/2021",
    location: "Đà Nẵng",
  },
  {
    id: "NV-00120",
    name: "Võ Ngọc Mai",
    email: "mai.vo@auo.vn",
    phone: "097 567 8901",
    department: "Công nghệ",
    position: "Quản lý sản phẩm",
    role: "Quản lý",
    status: "active",
    joinedAt: "04/09/2022",
    location: "TP. Hồ Chí Minh",
  },
  {
    id: "NV-00119",
    name: "Đặng Gia Huy",
    email: "huy.dang@auo.vn",
    phone: "096 678 9012",
    department: "Tài chính",
    position: "Kế toán tổng hợp",
    role: "Nhân viên",
    status: "inactive",
    joinedAt: "15/04/2020",
    location: "Hà Nội",
  },
];

export const EMPTY_STAFF_FORM: StaffForm = {
  name: "",
  email: "",
  phone: "",
  department: "Công nghệ",
  position: "",
  role: "Nhân viên",
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

export function getTodayLabel() {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
}
