export type StaffStatus = "active" | "inactive";
export type StaffRole = "Quản trị viên" | "Quản lý" | "Nhân viên";
export type StatusFilter = "all" | StaffStatus;

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  role: StaffRole;
  status: StaffStatus;
  joinedAt: string;
  location: string;
};

export type StaffForm = Pick<
  StaffMember,
  "name" | "email" | "phone" | "department" | "position" | "role"
>;
