import type { UserRole } from "./user";

export type StaffStatus = "active" | "inactive";
export type StatusFilter = "all" | StaffStatus;

export type StaffMember = {
  id: number;
  userId: number;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  role: UserRole;
  status: StaffStatus;
  position: string;
  hireDate: string;
  resignationDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StaffForm = Pick<
  StaffMember,
  | "employeeCode"
  | "fullName"
  | "email"
  | "phone"
  | "gender"
  | "dateOfBirth"
  | "role"
  | "position"
  | "hireDate"
>;
