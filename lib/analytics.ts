import type { Sale, User } from "./types"
import { dummySales } from "./dummy-data/dummy-sales"
import { mockInventoryData } from "./dummy-data/mock-inventory"
import { canViewAllData } from "./auth"

export interface SalesAnalytics {
  totalSales: number
  totalRevenue: number
  averageOrderValue: number
  topSellingProducts: Array<{
    productId: string
    productName: string
    quantitySold: number
    revenue: number
  }>
  salesByDay: Array<{
    date: string
    sales: number
    revenue: number
  }>
  salesByPaymentMethod: Array<{
    method: string
    count: number
    revenue: number
  }>
  recentSales: Sale[]
}

export function getSalesAnalytics(user: User): SalesAnalytics {
  const canSeeAll = canViewAllData(user.role)

  // Filter sales based on user role
  const filteredSales = canSeeAll ? dummySales : dummySales.filter((sale) => sale.salesPersonId === user.id)

  const totalSales = filteredSales.length
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
  const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0

  // Calculate top selling products
  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>()

  filteredSales.forEach((sale) => {
    sale.items.forEach((item) => {
      const product = mockInventoryData.find((p) => p.id === item.inventoryItemId)
      if (product) {
        const existing = productSales.get(item.inventoryItemId) || {
          name: product.name,
          quantity: 0,
          revenue: 0,
        }
        productSales.set(item.inventoryItemId, {
          name: product.name,
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + item.total,
        })
      }
    })
  })

  const topSellingProducts = Array.from(productSales.entries())
    .map(([productId, data]) => ({
      productId,
      productName: data.name,
      quantitySold: data.quantity,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 5)

  // Generate sales by day (last 7 days)
  const salesByDay = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]

    const daySales = filteredSales.filter((sale) => sale.createdAt.toISOString().split("T")[0] === dateStr)

    salesByDay.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      sales: daySales.length,
      revenue: daySales.reduce((sum, sale) => sum + sale.total, 0),
    })
  }

  // Sales by payment method
  const paymentMethods = new Map<string, { count: number; revenue: number }>()

  filteredSales.forEach((sale) => {
    const existing = paymentMethods.get(sale.paymentMethod) || { count: 0, revenue: 0 }
    paymentMethods.set(sale.paymentMethod, {
      count: existing.count + 1,
      revenue: existing.revenue + sale.total,
    })
  })

  const salesByPaymentMethod = Array.from(paymentMethods.entries()).map(([method, data]) => ({
    method: method.charAt(0).toUpperCase() + method.slice(1),
    count: data.count,
    revenue: data.revenue,
  }))

  return {
    totalSales,
    totalRevenue,
    averageOrderValue,
    topSellingProducts,
    salesByDay,
    salesByPaymentMethod,
    recentSales: filteredSales.slice(0, 5),
  }
}

export function getInventoryAnalytics() {
  const totalProducts = mockInventoryData.length
  const lowStockItems = mockInventoryData.filter((item) => item.quantity < 10)
  const totalValue = mockInventoryData.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const categoryBreakdown = mockInventoryData.reduce(
    (acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return {
    totalProducts,
    lowStockCount: lowStockItems.length,
    totalValue,
    lowStockItems: lowStockItems.slice(0, 5),
    categoryBreakdown: Object.entries(categoryBreakdown).map(([category, count]) => ({
      category,
      count,
    })),
  }
}
