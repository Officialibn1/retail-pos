export type UserRole = "SuperAdmin" | "Manager" | "SalesPerson"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  shift: "Morning" | "Night"
  createdAt: Date
  isActive: boolean
}

export interface InventoryItem {
  id: string
  name: string
  description: string
  sku: string
  price: number
  cost: number
  quantity: number
  category: string
  barcode?: string
  createdAt: Date
  updatedAt: Date
}

export interface SaleItem {
  id: string
  inventoryItemId: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

export interface Sale {
  id: string
  saleNumber: string
  items: SaleItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: "cash" | "card" | "digital"
  salesPersonId: string
  customerId?: string
  createdAt: Date
  status: "pending" | "completed" | "cancelled" | "refunded"
}

export interface ActivityLog {
  id: string
  userId: string
  action: string
  details: string
  timestamp: Date
  ipAddress?: string
}

export interface DashboardStats {
  totalSales: number
  todaySales: number
  totalOrders: number
  todayOrders: number
  lowStockItems: number
  activeUsers: number
}
