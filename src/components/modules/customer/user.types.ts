export type CustomerStatus = "active" | "inactive";
export type CustomerStatusFilter = "all" | CustomerStatus;

export type Customer = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  address: {
    province: string;
    district: string;
    ward: string;
    detail: string;
  };
  createdAt: string;
  updatedAt: string;
  status: CustomerStatus;
};
