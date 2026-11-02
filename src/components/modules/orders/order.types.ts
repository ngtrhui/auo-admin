export type OrderStatus = "pending" | "approved" | "cancelled";
export type StatusFilter = "all" | OrderStatus;

export interface OrderItem {
  name: string;
  sku: string;
  category: string;
  detail: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customer: string;
  phone: string;
  email: string;
  createdAt: string;
  status: OrderStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  cancelledBy?: string | null;
  cancelledAt?: string | null;
  items: OrderItem[];
  note?: string;
}

export interface DateRange {
  from: string;
  to: string;
}
