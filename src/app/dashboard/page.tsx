"use client"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Wallet, Users, TrendingUp, Plus, Clock, DollarSign } from "lucide-react" // Added DollarSign for consistency
import Link from "next/link"
import { api } from "@/lib/api"
import type { InvestmentGroup, UserGroupParticipation } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"

export default function DashboardPage() {
  const { user } = useAuth()

  // Fetch wallet balance
  const { data: walletBalance = 0, isLoading: isLoadingWalletBalance } = useQuery<number>({
    queryKey: ["walletBalance"],
    queryFn: () => api.getWalletBalance().then((data) => data.balance || 0),
  })

  // Fetch active groups
  const { data: activeGroupsData = [], isLoading: isLoadingActiveGroups } = useQuery<InvestmentGroup[]>({
    queryKey: ["activeGroups"],
    queryFn: () => api.getActiveGroups().then((res) => res.data || []),
  })

  // Fetch user's groups
  const { data: myGroupsData = [], isLoading: isLoadingMyGroups } = useQuery<UserGroupParticipation[]>({
    queryKey: ["myGroups"],
    queryFn: () => api.getMyGroups().then((res) => res.data || []),
  })

  const isLoading = isLoadingWalletBalance || isLoadingActiveGroups || isLoadingMyGroups

  // Calculate derived stats
  const totalInvestment = Array.isArray(myGroupsData)
    ? myGroupsData.reduce((sum, participation) => sum + (participation.group?.slotPrice || 0) * participation.slots, 0)
    : 0
  const totalReturns = 0 // This would come from completed investments, keeping as 0 for now

  const recentGroups = Array.isArray(activeGroupsData) ? activeGroupsData.slice(0, 3) : []
  const myRecentInvestments = Array.isArray(myGroupsData) ? myGroupsData.slice(0, 3) : []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.othernames}!</h1>
        <p className="text-gray-600 mt-2">Here's your livestock investment overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-green-50 shadow-md">
          {" "}
          {/* Updated Card styling */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-green-600" /> {/* Icon color */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{walletBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Available for investment</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 shadow-md">
          {" "}
          {/* Updated Card styling */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" /> {/* Icon color */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalInvestment.toLocaleString()}</div>
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
            <p className="text-xs text-muted-foreground">Investment groups joined</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 shadow-md">
          {" "}
          {/* Updated Card styling */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Returns</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" /> {/* Changed icon to DollarSign for returns */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalReturns.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From completed investments</p>
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
            <CardDescription>Add money to start investing</CardDescription>
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
            <CardDescription>Find investment opportunities</CardDescription>
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
            <CardDescription>Start your own investment group</CardDescription>
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
            <CardTitle>Trending Investment Groups</CardTitle>
            <CardDescription>Popular groups with high activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentGroups.map((group) => {
              const progress = (group.slotTaken / group.totalSlot) * 100
              return (
                <div key={group.group_id} className="border rounded-lg p-4 bg-white">
                  {" "}
                  {/* Added bg-white */}
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{group.groupName}</h4>
                    <span className="text-sm text-green-600">₦{group.slotPrice.toLocaleString()}/slot</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{Math.round(progress)}% funded</span>
                      <span>{group.totalSlotLeft} slots left</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              )
            })}
            {recentGroups.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No active groups available</p>
            )}
          </CardContent>
        </Card>

        {/* My Recent Investments */}
        <Card className="shadow-md">
          {" "}
          {/* Added shadow */}
          <CardHeader>
            <CardTitle>My Recent Investments</CardTitle>
            <CardDescription>Your latest group participations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {myRecentInvestments.map((participation) => (
              <div key={participation.group_id} className="border rounded-lg p-4 bg-white">
                {" "}
                {/* Added bg-white */}
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{participation.group?.groupName}</h4>
                  <span className="text-sm text-blue-600">{participation.slots} slots</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    Investment: ₦{((participation.group?.slotPrice || 0) * participation.slots).toLocaleString()}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(participation.joined_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {myRecentInvestments.length === 0 && (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-2">No investments yet</p>
                <Link href="/dashboard/groups">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
                  >
                    {" "}
                    {/* Updated button color */}
                    Start Investing
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
