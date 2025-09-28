"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Edit, Trash2, Users, Ban } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { canManageUsers } from "@/lib/auth";
import { mockUsers } from "@/lib/dummy-data/mock-users";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function UsersPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  if (!user || !canManageUsers(user.role)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lunar-green-600">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  const filteredUsers = mockUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SuperAdmin":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Super Admin
          </Badge>
        );
      case "Manager":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Manager
          </Badge>
        );
      case "SalesPerson":
        return (
          <Badge className="bg-lunar-green-100 text-lunar-green-800 hover:bg-lunar-green-100">
            Sales Person
          </Badge>
        );
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const getShiftBadge = (shift: string) => {
    return (
      <Badge
        variant="outline"
        className={
          shift === "Morning"
            ? "border-orange-300 text-orange-700"
            : "border-purple-300 text-purple-700"
        }
      >
        {shift}
      </Badge>
    );
  };

  const activeUsers = filteredUsers.filter((u) => u.isActive).length;
  const totalUsers = filteredUsers.length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-lunar-green-800">
            User Management
          </h1>
          <p className="text-lunar-green-600 mt-1">
            Manage store users and their permissions
          </p>
        </div>
        <Button className="bg-lunar-green-600 hover:bg-lunar-green-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-lunar-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-lunar-green-700">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-lunar-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lunar-green-800">
              {totalUsers}
            </div>
            <p className="text-xs text-lunar-green-600">
              {activeUsers} active users
            </p>
          </CardContent>
        </Card>

        <Card className="border-lunar-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-lunar-green-700">
              Morning Shift
            </CardTitle>
            <Users className="h-4 w-4 text-lunar-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lunar-green-800">
              {filteredUsers.filter((u) => u.shift === "Morning").length}
            </div>
            <p className="text-xs text-lunar-green-600">
              Users on morning shift
            </p>
          </CardContent>
        </Card>

        <Card className="border-lunar-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-lunar-green-700">
              Night Shift
            </CardTitle>
            <Users className="h-4 w-4 text-lunar-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lunar-green-800">
              {filteredUsers.filter((u) => u.shift === "Night").length}
            </div>
            <p className="text-xs text-lunar-green-600">Users on night shift</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-lunar-green-200">
        <CardHeader>
          <CardTitle className="text-lunar-green-800">Users</CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-lunar-green-500" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 border-lunar-green-200 focus:border-lunar-green-400"
              />
            </div>

            <Select
              value={roleFilter}
              onValueChange={(value) => setRoleFilter(value)}
            >
              <SelectTrigger className="border-lunar-green-200 focus:border-lunar-green-400 w-40">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="SuperAdmin">Super Admin</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="SalesPerson">Sales Person</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-lunar-green-200">
                <TableHead className="text-lunar-green-700">Name</TableHead>
                <TableHead className="text-lunar-green-700">Email</TableHead>
                <TableHead className="text-lunar-green-700">Role</TableHead>
                <TableHead className="text-lunar-green-700">Shift</TableHead>
                <TableHead className="text-lunar-green-700">Status</TableHead>
                <TableHead className="text-lunar-green-700">Created</TableHead>
                <TableHead className="text-lunar-green-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id} className="border-lunar-green-100">
                  <TableCell className="font-medium text-lunar-green-800">
                    {u.name}
                  </TableCell>
                  <TableCell className="text-lunar-green-700">
                    {u.email}
                  </TableCell>
                  <TableCell>{getRoleBadge(u.role)}</TableCell>
                  <TableCell>{getShiftBadge(u.shift)}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        u.isActive
                          ? "bg-lunar-green-100 text-lunar-green-800 hover:bg-lunar-green-100"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                      }
                    >
                      {u.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-lunar-green-700">
                    {u.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-lunar-green-600 hover:bg-lunar-green-100"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-yellow-600 hover:bg-yellow-50"
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-lunar-green-600">
              No users found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
