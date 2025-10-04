"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ErrorMessage } from "@/components/error-message";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  Users,
  FolderOpen,
  CreditCard,
  TrendingUp,
  UserPlus,
  Activity,
  DollarSign,
  BarChart3,
} from "lucide-react";

interface DashboardStats {
  users: {
    total: number;
    recent: number;
  };
  groups: {
    total: number;
    active: number;
    completed: number;
  };
  transactions: {
    total: number;
    recent: number;
    totalVolume: number;
    recentVolume: number;
  };
  livestock: {
    total: number;
  };
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await api.request(
          "/admin/dashboard/stats",
          "GET",
          undefined,
          undefined,
          token
        );

        if (response.status === "success" && response.data) {
          setStats(response.data);
        } else {
          setError(response.message || "Failed to fetch dashboard statistics");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to Load Dashboard"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!stats) {
    return (
      <ErrorMessage
        title="No Data Available"
        message="Unable to load dashboard statistics"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your Farmeely platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.users.recent} new this month
            </p>
          </CardContent>
        </Card>

        {/* Total Groups */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.groups.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.groups.active} active, {stats.groups.completed} completed
            </p>
          </CardContent>
        </Card>

        {/* Total Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.transactions.total}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.transactions.recent} this month
            </p>
          </CardContent>
        </Card>

        {/* Total Volume */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.transactions.totalVolume)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.transactions.recentVolume)} this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Groups */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.groups.active}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently accepting members
            </p>
          </CardContent>
        </Card>

        {/* Completed Groups */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Groups
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.groups.completed}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>

        {/* Total Livestock */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Livestock Types
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.livestock.total}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for investment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/admin/users"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Manage Users</p>
                <p className="text-sm text-gray-600">
                  View and manage user accounts
                </p>
              </div>
            </a>

            <a
              href="/admin/groups"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FolderOpen className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Manage Groups</p>
                <p className="text-sm text-gray-600">
                  Oversee investment groups
                </p>
              </div>
            </a>

            <a
              href="/admin/transactions"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CreditCard className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">View Transactions</p>
                <p className="text-sm text-gray-600">
                  Monitor all transactions
                </p>
              </div>
            </a>

            <a
              href="/admin/analytics"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium">Analytics</p>
                <p className="text-sm text-gray-600">View detailed analytics</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
