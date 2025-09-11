import type { User } from "../types"

export const mockUsers: User[] = [
  {
    id: "1",
    name: "John Admin",
    email: "admin@store.com",
    role: "SuperAdmin",
    shift: "Morning",
    createdAt: new Date("2024-01-01"),
    isActive: true,
  },
  {
    id: "2",
    name: "Sarah Manager",
    email: "manager@store.com",
    role: "Manager",
    shift: "Morning",
    createdAt: new Date("2024-01-15"),
    isActive: true,
  },
  {
    id: "3",
    name: "Mike Sales",
    email: "mike@store.com",
    role: "SalesPerson",
    shift: "Morning",
    createdAt: new Date("2024-02-01"),
    isActive: true,
  },
  {
    id: "4",
    name: "Lisa Sales",
    email: "lisa@store.com",
    role: "SalesPerson",
    shift: "Night",
    createdAt: new Date("2024-02-10"),
    isActive: true,
  },
  {
    id: "5",
    name: "Tom Evening",
    email: "tom@store.com",
    role: "SalesPerson",
    shift: "Night",
    createdAt: new Date("2024-02-15"),
    isActive: true,
  },
]

// Current user for demo purposes
export const currentUser: User = mockUsers[0] // SuperAdmin by default
