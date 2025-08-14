"use client";
import { useAuth } from "@/lib/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Wallet,
  Users,
  TrendingUp,
  Plus,
  Clock,
  DollarSign,
  Link2,
} from "lucide-react"; // Added DollarSign for consistency
import Link from "next/link";
import { api } from "@/lib/api";
import type { ApiResponse, Group, JoinGroupPayload } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { GroupCard } from "@/components/groups/group-card";
import { JoinGroupModal } from "@/components/groups/join-group-modal";
import { link } from "fs";


// interface AuthUser {
//   id?: string;
//   email?: string;
//   othernames?: string;
//   // Add other fields as needed
// }

export default function DashboardPage() {
  const { user, token } = useAuth()
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedGroupToJoin, setSelectedGroupToJoin] = useState<Group | null>(null)


  // Fetch wallet balance
  const { data: walletBalance = 0, isLoading: isLoadingWalletBalance } =
    useQuery<number>({
      queryKey: ["walletBalance"],
      queryFn: () =>
        api
          .getWalletBalance(token ?? "")
          .then((data: ApiResponse<{ balance: number }>) => data?.data?.balance || 0),
      enabled: !!token, // Only fetch if token exists
    });

  // Fetch active groups
  const { data: activeGroupsData = [], isLoading: isLoadingActiveGroups } =
    useQuery<Group[]>({
      queryKey: ["activeGroups"],
      queryFn: () => api.getActiveGroups(token ?? "").then((res) => res.data || []),
      enabled: !!token,
    });

    

  // Fetch user's groups - FIXED: Use the correct endpoint
  const { data: myGroupsData = [], isLoading: isLoadingMyGroups } = useQuery<Group[]>({
    queryKey: ["myJoinedGroups"],
    queryFn: () => api.getMyJoinedGroups(token ?? "").then((res) => res.data || []),
    enabled: !!token,
  })
  console.log('myGroupsData:', myGroupsData);
// console.log('Sample participation:', myGroupsData?.[0]);
  const isLoading =
    isLoadingWalletBalance || isLoadingActiveGroups || isLoadingMyGroups;

  // Calculate derived stats - FIXED: Handle the data structure properly
  const totalGroup = Array.isArray(myGroupsData)
    ? myGroupsData.reduce((sum, group) => {
        const slotPrice = group?.slotPrice || 0
        const userSlots = group?.userSlots || 0
        return sum + slotPrice * userSlots
      }, 0)
    : 0

  const totalReturns = 0; // This would come from completed, keeping as 0 for now

  const recentGroups = Array.isArray(activeGroupsData)
    ? activeGroupsData.slice(0, 3)
    : [];
  const myRecentGroups = Array.isArray(myGroupsData)
    ? myGroupsData.slice(0, 3)
    : [];
  const handleJoinGroupClick = (group: Group) => {
    setSelectedGroupToJoin(group)
    setIsJoinModalOpen(true)
  }

  const handleCloseJoinModal = () => {
    setIsJoinModalOpen(false)
    setSelectedGroupToJoin(null)
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {(user as any).othernames}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's your livestock overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-green-50 shadow-md">
          {" "}
          {/* Updated Card styling */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Wallet Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-green-600" /> {/* Icon color */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{walletBalance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Available fund
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 shadow-md">
          {" "}
          {/* Updated Card styling */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Investment
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" /> {/* Icon color */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{totalGroup.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across all groups</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 shadow-md">
          {" "}
          {/* Updated Card styling */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
            <Users className="h-4 w-4 text-green-600" /> {/* Icon color */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myGroupsData.length}</div>
            <p className="text-xs text-muted-foreground">
              groups joined
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 shadow-md">
          {" "}
          {/* Updated Card styling */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Track Progress
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />{" "}
            {/* Changed icon to DollarSign for returns */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{totalReturns.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From completed Operations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-green-50 shadow-md">
          {" "}
          {/* Updated Card styling */}
          <CardHeader>
            <CardTitle className="text-lg">Fund Wallet</CardTitle>
            <CardDescription>Add money to start Group Purchase</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/wallet">
              <Button className="w-full bg-green-600 text-white hover:bg-green-700">
                {" "}
                {/* Updated button color */}
                <Plus className="mr-2 h-4 w-4" />
                Fund Wallet
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 shadow-md">
          {" "}
          {/* Updated Card styling */}
          <CardHeader>
            <CardTitle className="text-lg">Browse Groups</CardTitle>
            <CardDescription>Find Group opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/groups">
              <Button
                variant="outline"
                className="w-full border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
              >
                {" "}
                {/* Updated button color */}
                <Users className="mr-2 h-4 w-4" />
                Browse Groups
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="bg-green-50 shadow-md">
          {" "}
          {/* Updated Card styling */}
          <CardHeader>
            <CardTitle className="text-lg">Create Group</CardTitle>
            <CardDescription>Start your own  group</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/groups/create">
              <Button className="w-full bg-green-600 text-white hover:bg-green-700">
                {" "}
                {/* Updated button color */}
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Groups & My Investments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Groups */}
        <Card className="shadow-md">
          {" "}
          {/* Added shadow */}
          <CardHeader>
            <CardTitle>Trending Groups</CardTitle>
            <CardDescription>Popular groups with high activity - Click to join!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentGroups.map((group) => (
              <GroupCard
                key={group.group_id || group.id || `group-${Math.random()}`}
                group={group}
                onJoin={handleJoinGroupClick}
                showJoinButton={true}
              />
              // const progress = (group.slotTaken / group.totalSlot) * 100;
              // return (
              //   <div
              //     // key={group.id}
              //     key={group.group_id }
              //     className="border rounded-lg p-4 bg-white"
              //   >
              //     {" "}
              //     {/* Added bg-white */}
              //     <div className="flex justify-between items-start mb-2">
              //       <h4 className="font-medium">{group.group_name}</h4>
              //       <span className="text-sm text-green-600">
              //         ₦{group.slotPrice.toLocaleString()}/slot
              //       </span>
              //     </div>
              //     <div className="space-y-2">
              //       <div className="flex justify-between text-sm">
              //         <span>{Math.round(progress)}% funded</span>
              //         <span>{group.totalSlot - group.slotTaken} slots left</span>
              //       </div>
              //       <Progress value={progress} className="h-2" />
              //     </div>
              //   </div>
              // );
            ))}
            {recentGroups.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No active groups available
              </p>
            )}
          </CardContent>
        </Card>

        {/* My Recent Investments */}
        <Card className="shadow-md">
          {" "}
          {/* Added shadow */}
          <CardHeader>
            <CardTitle>My Recent Groups</CardTitle>
            <CardDescription>Your latest group participations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {myRecentGroups.map((group) => (
              <div
                key={group.group_id || group.id || `my-group-${Math.random()}`}
                className="border rounded-lg p-4 bg-white"
              >
                {" "}
                {/* Added bg-white */}
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">
                    {group.group_name || group.groupName}
                  </h4>
                  <span className="text-sm text-blue-600">
                    {group.userSlots || 0} slots
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    Investment: ₦
                    {(
                      (group.slotPrice || 0) *
                      group.userSlots!
                    ).toLocaleString()}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {group.joinedAt? new Date(group.joinedAt).toLocaleDateString(): "N/A"}
                  </span>
                </div>
              </div>
            ))}
            {myRecentGroups.length === 0 && (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-2">No group yet</p>
                <Link href="/dashboard/groups">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
                  >
                    {" "}
                    {/* Updated button color */}
                    Start Group Buying
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {selectedGroupToJoin && (
        <JoinGroupModal
          group={selectedGroupToJoin}
          isOpen={isJoinModalOpen}
          onClose={handleCloseJoinModal}
        />
      )}
    </div>
  );
}
