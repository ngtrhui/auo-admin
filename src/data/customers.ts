import type { Customer, CustomerStatus } from "@/components/modules/customer/user.types";

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "KH-00128",
    userId: "US-00128",
    name: "Nguyễn Minh Anh",
    email: "minhanh.nguyen@gmail.com",
    phone: "090 123 4567",
    gender: "Nữ",
    dateOfBirth: "12/03/1995",
    address: {
      province: "TP. Hồ Chí Minh",
      district: "Quận 1",
      ward: "Phường Bến Nghé",
      detail: "18 Nguyễn Huệ",
    },
    createdAt: "12/03/2025",
    updatedAt: "18/10/2026",
    status: "active",
  },
  {
    id: "KH-00127",
    userId: "US-00127",
    name: "Trần Hoàng Nam",
    email: "nam.tran@example.com",
    phone: "091 234 5678",
    gender: "Nam",
    dateOfBirth: "08/11/1990",
    address: {
      province: "TP. Hồ Chí Minh",
      district: "Quận 3",
      ward: "Phường Võ Thị Sáu",
      detail: "42 Lý Chính Thắng",
    },
    createdAt: "08/11/2025",
    updatedAt: "16/10/2026",
    status: "active",
  },
  {
    id: "KH-00126",
    userId: "US-00126",
    name: "Lê Thu Hà",
    email: "thuha.le@example.com",
    phone: "093 345 6789",
    gender: "Nữ",
    dateOfBirth: "21/06/1998",
    address: {
      province: "Hà Nội",
      district: "Cầu Giấy",
      ward: "Phường Dịch Vọng",
      detail: "25 Trần Thái Tông",
    },
    createdAt: "21/06/2025",
    updatedAt: "12/10/2026",
    status: "active",
  },
  {
    id: "KH-00125",
    userId: "US-00125",
    name: "Phạm Quốc Bảo",
    email: "quocbao.pham@example.com",
    phone: "098 456 7890",
    gender: "Nam",
    dateOfBirth: "17/01/1987",
    address: {
      province: "Đà Nẵng",
      district: "Hải Châu",
      ward: "Phường Hải Châu I",
      detail: "76 Bạch Đằng",
    },
    createdAt: "17/01/2025",
    updatedAt: "04/09/2026",
    status: "inactive",
  },
  {
    id: "KH-00124",
    userId: "US-00124",
    name: "Võ Ngọc Mai",
    email: "ngocmai.vo@example.com",
    phone: "097 567 8901",
    gender: "Nữ",
    dateOfBirth: "04/09/1993",
    address: {
      province: "TP. Hồ Chí Minh",
      district: "Thành phố Thủ Đức",
      ward: "Phường Thảo Điền",
      detail: "15 Quốc Hương",
    },
    createdAt: "04/09/2025",
    updatedAt: "19/10/2026",
    status: "active",
  },
  {
    id: "KH-00123",
    userId: "US-00123",
    name: "Đặng Gia Huy",
    email: "giahuy.dang@example.com",
    phone: "096 678 9012",
    gender: "Nam",
    dateOfBirth: "15/04/1992",
    address: {
      province: "Hà Nội",
      district: "Đống Đa",
      ward: "Phường Láng Hạ",
      detail: "10 Huỳnh Thúc Kháng",
    },
    createdAt: "15/04/2025",
    updatedAt: "02/08/2026",
    status: "inactive",
  },
];

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  active: "Đang hoạt động",
  inactive: "Đã vô hiệu hóa",
};

export function getCustomerInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function getCustomerAddress(address: Customer["address"]) {
  return [
    address.detail,
    address.ward,
    address.district,
    address.province,
  ]
    .filter(Boolean)
    .join(", ");
}
