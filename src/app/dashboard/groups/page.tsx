"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { GroupCard } from "@/components/groups/group-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, LineChart, Plus } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { JoinGroupModal } from "@/components/groups/join-group-modal"
import type { Group } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"

export default function GroupsPage() {
  const [activeTab, setActiveTab] = useState("browse")
  const [searchQuery, setSearchQuery] = useState("")
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [selectedGroupToJoin, setSelectedGroupToJoin] = useState<Group | null>(null)

  const { token, user, isLoading: isAuthLoading } = useAuth()

  const {
    data: activeGroups,
    isLoading: isLoadingActiveGroups,
    error: activeGroupsError,
  } = useQuery<Group[]>({
    queryKey: ["activeGroups", token],
    queryFn: () => api.getGroups(token as string).then((res) => res.data || []),
    enabled: !!token && !isAuthLoading,
  })

  const {
    data: myGroups,
    isLoading: isLoadingMyGroups,
    error: myGroupsError,
  } = useQuery<Group[]>({
    queryKey: ["myGroups", token, user?.id],
    queryFn: () =>
      api.getGroups(token as string).then((res) => res.data?.filter((group) => group.created_by === user?.id) || []),
    enabled: !!token && !!user?.id && !isAuthLoading,
  })

  const {
    data: walletBalance,
    isLoading: isLoadingWalletBalance,
    error: walletBalanceError,
  } = useQuery<number>({
    queryKey: ["walletBalance", token],
    queryFn: () => api.getWalletBalance(token as string).then((data: any) => data.balance),
    enabled: !!token && !isAuthLoading,
  })

  const filteredActiveGroups = Array.isArray(activeGroups)
    ? activeGroups?.filter((group: Group) => group.group_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  const filteredMyGroups = Array.isArray(myGroups)
    ? myGroups?.filter((group: Group) => group.group_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  const handleJoinGroupClick = (group: Group) => {
    setSelectedGroupToJoin(group)
    setIsJoinModalOpen(true)
  }

  const handleCloseJoinModal = () => {
    setIsJoinModalOpen(false)
    setSelectedGroupToJoin(null)
  }

  if (isAuthLoading) {
    return <div className="flex items-center justify-center h-full text-gray-500">Loading authentication...</div>
  }

  if (activeGroupsError || myGroupsError || walletBalanceError) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">Error loading data. Please try again.</div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Livestock Groups</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Join livestock groups and leave the remaining for us (slaughtering & Delivery)
          </p>
        </div>
        <Link href="/dashboard/groups/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
            <LineChart className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingActiveGroups ? <Skeleton className="h-8 w-12" /> : (activeGroups?.length ?? 0)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">My Groups</CardTitle>
            <LineChart className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingMyGroups ? <Skeleton className="h-8 w-12" /> : (myGroups?.length ?? 0)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <LineChart className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingWalletBalance ? <Skeleton className="h-8 w-24" /> : formatCurrency(walletBalance ?? 0)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">+19% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse Groups</TabsTrigger>
          <TabsTrigger value="my-groups">My Groups ({myGroups?.length ?? 0})</TabsTrigger>
        </TabsList>
        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            type="search"
            placeholder="Search investment groups..."
            className="w-full rounded-lg bg-background pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <TabsContent value="browse" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingActiveGroups ? (
              Array.from({ length: 3 }).map((_, i) => <GroupCardSkeleton key={i} />)
            ) : filteredActiveGroups && filteredActiveGroups.length > 0 ? (
              filteredActiveGroups.map((group: Group) => (
                <GroupCard key={group.id} group={group} onJoinClick={handleJoinGroupClick} showJoinButton={true} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">No active groups found.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="my-groups" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingMyGroups ? (
              Array.from({ length: 3 }).map((_, i) => <GroupCardSkeleton key={i} />)
            ) : filteredMyGroups && filteredMyGroups.length > 0 ? (
              filteredMyGroups.map((group: Group) => (
                <GroupCard key={group.id} group={group} showJoinButton={false} onJoinClick={() => {}} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">You have not joined any groups yet.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {selectedGroupToJoin && (
        <JoinGroupModal
          groupId={selectedGroupToJoin.id} // Changed from group_id to id, and ensured it's a number
          isOpen={isJoinModalOpen}
          onClose={handleCloseJoinModal}
        />
      )}
    </div>
  )
}

function GroupCardSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="grid gap-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}
