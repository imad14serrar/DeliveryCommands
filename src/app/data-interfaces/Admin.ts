import { ShipmentStatus } from './Shipment';

export interface LoginResponse {
  token: string;
  expiresAt: string;
  username: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: Record<ShipmentStatus, number>;
  productCount: number;
  lowStockProducts: { id: number; name: string; stock: number }[];
}
