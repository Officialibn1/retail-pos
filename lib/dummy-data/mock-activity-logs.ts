import type { ActivityLog } from "../types";

export const mockActivityLogs: ActivityLog[] = [
  {
    id: "1",
    userId: "3",
    action: "Sale Created",
    details: "Created sale SAL-2024-001 for ₦2,337.77",
    timestamp: new Date("2024-03-01T10:30:00"),
    ipAddress: "192.168.1.100",
  },
  {
    id: "2",
    userId: "2",
    action: "Inventory Updated",
    details:
      "Updated quantity for Wireless Bluetooth Headphones (SKU: WBH-001)",
    timestamp: new Date("2024-03-01T11:15:00"),
    ipAddress: "192.168.1.101",
  },
  {
    id: "3",
    userId: "4",
    action: "Sale Created",
    details: "Created sale SAL-2024-002 for ₦32,234.99",
    timestamp: new Date("2024-03-01T14:15:00"),
    ipAddress: "192.168.1.102",
  },
  {
    id: "4",
    userId: "1",
    action: "User Login",
    details: "SuperAdmin logged into the system",
    timestamp: new Date("2024-03-02T08:00:00"),
    ipAddress: "192.168.1.103",
  },
  {
    id: "5",
    userId: "3",
    action: "Sale Created",
    details: "Created sale SAL-2024-003 for ₦76,912.36",
    timestamp: new Date("2024-03-02T09:45:00"),
    ipAddress: "192.168.1.100",
  },
];
