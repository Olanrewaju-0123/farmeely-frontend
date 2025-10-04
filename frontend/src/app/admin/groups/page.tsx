"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ErrorMessage } from "@/components/error-message";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { FolderOpen, Users, Calendar, DollarSign, Eye } from "lucide-react";

interface Group {
  group_id: string;
  groupName: string;
  description: string;
  slotPrice: number;
  totalSlot: number;
  status: string;
  created_at: string;
  creator: {
    user_id: string;
    surname: string;
    othernames: string;
    email: string;
  };
  livestock: {
    livestock_id: string;
    name: string;
    price: number;
  };
}

interface GroupsResponse {
  groups: Group[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export default function AdminGroupsPage() {
  const { token } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchGroups = async (page = 1, status = "") => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await api.getAdminGroups(token, {
        page,
        limit: 10,
        status,
      });

      if (response.status === "success" && response.data) {
        setGroups(response.data.groups);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || "Failed to fetch groups");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching groups");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [token]);

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    fetchGroups(1, status);
  };

  const handlePageChange = (page: number) => {
    fetchGroups(page, statusFilter);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "completed":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "outline";
    }
  };

  if (isLoading && groups.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading groups..." />
      </div>
    );
  }

  if (error && groups.length === 0) {
    return (
      <ErrorMessage
        title="Failed to Load Groups"
        message={error}
        onRetry={() => fetchGroups()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Groups Management</h1>
        <p className="text-gray-600 mt-2">
          Monitor and manage investment groups
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Groups</CardTitle>
          <CardDescription>Filter groups by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Groups List */}
      <Card>
        <CardHeader>
          <CardTitle>Groups ({pagination.totalItems})</CardTitle>
          <CardDescription>
            Showing {groups.length} of {pagination.totalItems} groups
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner text="Loading groups..." />
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No groups found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter
                  ? "No groups match the selected filter."
                  : "No groups have been created yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <div
                  key={group.group_id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {group.groupName}
                        </h3>
                        <Badge variant={getStatusBadgeVariant(group.status)}>
                          {group.status}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        {group.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="flex items-center text-sm text-gray-500">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <span>
                            Slot Price: {formatCurrency(group.slotPrice)}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-2" />
                          <span>Total Slots: {group.totalSlot}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Created: {formatDate(group.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">Created by:</span>{" "}
                          {group.creator.surname} {group.creator.othernames}
                        </div>
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">Livestock:</span>{" "}
                          {group.livestock.name}
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement group details modal
                          console.log("View group details:", group.group_id);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1 || isLoading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={
                    pagination.currentPage === pagination.totalPages ||
                    isLoading
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
