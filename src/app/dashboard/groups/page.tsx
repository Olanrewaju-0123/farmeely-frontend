"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient  } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { GroupCard } from "@/components/groups/group-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, LineChart, Plus, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { JoinGroupModal } from "@/components/groups/join-group-modal";
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Group } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import DraftGroupsSection from "@/components/groups/draft-groups-section"

// import { unknown } from "zod"

export default function GroupsPage() {
  const [activeTab, setActiveTab] = useState("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedGroupToJoin, setSelectedGroupToJoin] = useState<Group | null>(
    null
  );

  const { token, user, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
// Fetch active groups (only groups with status: "active")
  const {
    data: activeGroups,
    isLoading: isLoadingActiveGroups,
    error: activeGroupsError,
  } = useQuery<Group[]>({
    queryKey: ["activeGroups", token],
    queryFn: () =>
      api.getActiveGroups(token as string).then((res) => res.data || []),
    enabled: !!token && !isAuthLoading,
  });

  // Fetch user's created groups (both active and pending groups created by the user)
  const {
    data: myCreatedGroups,
    isLoading: isLoadingMyCreatedGroups,
    error: myCreatedGroupsError,
  } = useQuery<Group[]>({
    queryKey: ["myCreatedGroups", token, user?.id],
    queryFn: () => api.getMyCreatedGroups(token as string).then((res) => res.data || []),
    enabled: !!token && !!user?.id && !isAuthLoading,
  })

  // Fetch groups the user has joined
  const {
    data: myJoinedGroups,
    isLoading: isLoadingMyJoinedGroups,
    error: myJoinedGroupsError,
  } = useQuery<Group[]>({
    queryKey: ["myJoinedGroups", token, user?.id],
    queryFn: () => api.getMyJoinedGroups(token as string).then((res) => res.data || []),
    enabled: !!token && !!user?.id && !isAuthLoading,
  })

  const {
    data: myGroups,
    isLoading: isLoadingMyGroups,
    error: myGroupsError,
  } = useQuery<Group[]>({
    queryKey: ["myGroups", token, user?.id],
    queryFn: () =>
      api
        .getMyGroups(token as string)
        .then(
          (res) =>
            res.data?.filter((group) => group.created_by === user?.id) || []
        ),
    enabled: !!token && !!user?.id && !isAuthLoading,
  });

  const {
    data: walletBalance,
    isLoading: isLoadingWalletBalance,
    error: walletBalanceError,
  } = useQuery<number>({
    queryKey: ["walletBalance", token],
    queryFn: () =>
      api
        .getWalletBalance(token as string)
        .then((res) => res.data?.balance || 0),
    enabled: !!token && !isAuthLoading,
  });
  // console.log("balance", walletBalance);

  // Delete draft mutation
  const deleteDraftMutation = useMutation({
    mutationFn: (groupId: string) => api.deleteGroup(groupId, token as string),
    onSuccess: () => {
      // Refetch the created groups data
      queryClient.invalidateQueries({ queryKey: ["myCreatedGroups"] });
      toast.success("Draft group deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete draft group");
    },
  });

  const filteredActiveGroups = Array.isArray(activeGroups)
    ? activeGroups?.filter((group: Group) =>
        group.group_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredMyGroups = Array.isArray(myGroups)
    ? myGroups?.filter((group: Group) =>
        group.group_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

    const filteredMyJoinedGroups = Array.isArray(myJoinedGroups)
    ? myJoinedGroups?.filter((group: Group) => group.group_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

    const filteredMyCreatedGroups = Array.isArray(myCreatedGroups)
    ? myCreatedGroups?.filter((group: Group) => group.group_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  const handleJoinGroupClick = (group: Group) => {
    setSelectedGroupToJoin(group);
    setIsJoinModalOpen(true);
  };

  const handleCloseJoinModal = () => {
    setIsJoinModalOpen(false);
    setSelectedGroupToJoin(null);
  };


   const handleDeleteDraft = (groupId: string) => {
    if (window.confirm("Are you sure you want to delete this draft? This action cannot be undone.")) {
      deleteDraftMutation.mutate(groupId);
    }
  };

  const pendingGroups = filteredMyCreatedGroups.filter((group) => group.status === "pending")
  const activeCreatedGroups = filteredMyCreatedGroups.filter((group) => group.status === "active")
  const completedCreatedGroups = filteredMyCreatedGroups.filter((group) => group.status === "completed")

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Loading authentication...
      </div>
    );
  }

  if (activeGroupsError || myGroupsError || walletBalanceError || myJoinedGroupsError) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        Error loading data. Please try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Livestock Groups
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Join a livestock groups and leave the remaining for us (slaughtering &
            Delivery)
          </p>
        </div>
        <Link href="/dashboard/groups/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </Link>
      </div>
      
      {/* Draft Groups Section - Show at the top if user has pending groups */}
      {myCreatedGroups && myCreatedGroups.length > 0 && (
        <DraftGroupsSection
          groups={myCreatedGroups}
          onDeleteDraft={handleDeleteDraft}
          isLoading={isLoadingMyCreatedGroups}
        />
      )}

      {/* Pending Groups Alert */}
      {pendingGroups.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="flex items-center justify-between">
              <span>
                You have {pendingGroups.length} pending group(s) awaiting payment completion. Complete payment to make
                them visible to other users.
              </span>
              <Button
                variant="outline"
                size="sm"
                className="ml-4 border-orange-300 text-orange-700 hover:bg-orange-100 bg-transparent"
                onClick={() => setActiveTab("my-created")}
              >
                View Pending Groups
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
            <LineChart className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingActiveGroups ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                activeGroups?.length ?? 0
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Available to join
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">My Created Groups</CardTitle>
            <CheckCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingMyCreatedGroups ? <Skeleton className="h-8 w-12" /> : (myCreatedGroups?.length ?? 0)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {pendingGroups.length > 0 && (
                <span className="text-orange-600">{pendingGroups.length} pending payment</span>
              )}
              {pendingGroups.length === 0 && "Groups you created"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Joined Groups</CardTitle>
            <LineChart className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingMyJoinedGroups ? <Skeleton className="h-8 w-12" /> : (myJoinedGroups?.length ?? 0)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Groups you joined</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">My Groups</CardTitle>
            <LineChart className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingMyGroups ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                myGroups?.length ?? 0
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Wallet Balance
            </CardTitle>
            <LineChart className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingWalletBalance ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                formatCurrency(walletBalance ?? 0)
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Available balance
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse Groups</TabsTrigger>
          <TabsTrigger value="my-groups">
            My Groups ({myGroups?.length ?? 0})
          </TabsTrigger>
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
              Array.from({ length: 3 }).map((_, i) => (
                <GroupCardSkeleton key={i} />
              ))
            ) : filteredActiveGroups && filteredActiveGroups.length > 0 ? (
              filteredActiveGroups.map((group: Group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onJoinClick={handleJoinGroupClick}
                  showJoinButton={true}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">
                No active groups found.
              </p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="my-groups" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingMyGroups ? (
              Array.from({ length: 3 }).map((_, i) => (
                <GroupCardSkeleton key={i} />
              ))
            ) : filteredMyGroups && filteredMyGroups.length > 0 ? (
              filteredMyGroups.map((group: Group) => (
                <GroupCard
                  key={group?.id}
                  group={group}
                  showJoinButton={false}
                  onJoinClick={() => {}}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">
                You have not joined any groups yet.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Groups</TabsTrigger>
          <TabsTrigger value="my-created" className="relative">
            My Created ({myCreatedGroups?.length ?? 0})
            {pendingGroups.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-orange-500 text-xs text-white flex items-center justify-center">
                {pendingGroups.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="my-joined">Joined ({myJoinedGroups?.length ?? 0})</TabsTrigger>
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
                <GroupCard
                  key={group.id}
                  group={group}
                  onJoinClick={handleJoinGroupClick}
                  showJoinButton={true}
                  isCreator={false}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">No active groups found.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-created" className="mt-4">
          {pendingGroups.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-orange-600">Pending Payment ({pendingGroups.length})</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Complete payment for these groups to make them visible to other users and start accepting members.
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {pendingGroups.map((group: Group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    showJoinButton={false}
                    onJoinClick={() => {}}
                    isCreator={true}
                    isPending={true}
                  />
                ))}
              </div>
            </div>
          )}

          {activeCreatedGroups.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-green-600">Active Groups ({activeCreatedGroups.length})</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeCreatedGroups.map((group: Group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    showJoinButton={false}
                    onJoinClick={() => {}}
                    isCreator={true}
                    isPending={false}
                  />
                ))}
              </div>
            </div>
          )}

          {completedCreatedGroups.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-600">
                  Completed Groups ({completedCreatedGroups.length})
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedCreatedGroups.map((group: Group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    showJoinButton={false}
                    onJoinClick={() => {}}
                    isCreator={true}
                    isPending={false}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredMyCreatedGroups.length === 0 && !isLoadingMyCreatedGroups && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't created any groups yet.</p>
              <Link href="/dashboard/groups/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Group
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-joined" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingMyJoinedGroups ? (
              Array.from({ length: 3 }).map((_, i) => <GroupCardSkeleton key={i} />)
            ) : filteredMyJoinedGroups && filteredMyJoinedGroups.length > 0 ? (
              filteredMyJoinedGroups.map((group: Group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  showJoinButton={false}
                  onJoinClick={() => {}}
                  isCreator={false}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 mb-4">You haven't joined any groups yet.</p>
                <Button onClick={() => setActiveTab("browse")} variant="outline">
                  Browse Available Groups
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {selectedGroupToJoin && (
        <JoinGroupModal
          groupId={selectedGroupToJoin?.id} // Changed from group_id to id, and ensured it's a number
          isOpen={isJoinModalOpen}
          onClose={handleCloseJoinModal}
        />
      )}
    </div>
  );
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
  );
}
