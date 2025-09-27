"use client";

import type { Group } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { JoinGroupModal } from "@/components/groups/join-group-modal";
import { useAuth } from "@/lib/auth-context";

interface GroupDetailsPageProps {
  params: {
    groupId: string;
  };
}

export default function GroupDetailsPage({ params }: GroupDetailsPageProps) {
  const { groupId } = params;
  const { toast } = useToast();
  const { user, token } = useAuth();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const {
    data: groupDetails,
    isLoading,
    isError,
    error,
  } = useQuery<Group>({
    queryKey: ["groupDetails", groupId],
    queryFn: async () => {
      const res = await api.getGroupDetails(groupId, token as string);
      return res.data as Group;
    },
    enabled: !!groupId,
  });

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
      </div>
    );
  }

  if (isError || !groupDetails) {
    toast({
      title: "Error",
      description: error?.message || "Failed to load group details.",
      variant: "destructive",
    });
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold text-red-600">
          Group not found or an error occurred.
        </h2>
        <Button onClick={() => window.history.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const progressPercentage =
    (groupDetails.slotTaken / groupDetails.totalSlot) * 100;
  const isCompleted = groupDetails.status === "completed";
  const slotsLeft = groupDetails.totalSlotLeft;

  const handleJoinGroupClick = () => {
    setIsJoinModalOpen(true);
  };

  const handleCloseJoinModal = () => {
    setIsJoinModalOpen(false);
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {groupDetails.groupName}
        </h1>
        <p className="text-gray-600 mt-2">{groupDetails.description}</p>
      </div>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Investment Details</CardTitle>
          <CardDescription>
            Overview of this group's progress and details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {groupDetails.livestock && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                Livestock: {groupDetails.livestock.name}
              </h3>
              {groupDetails.livestock.imageUrl && (
                <img
                  src={groupDetails.livestock.imageUrl || "/placeholder.svg"}
                  alt={groupDetails.livestock.name}
                  className="w-full h-48 object-cover rounded-md"
                />
              )}
              <p className="text-muted-foreground">
                {groupDetails.livestock.description}
              </p>
              <p className="text-lg font-bold">
                Total Livestock Value: ₦
                {groupDetails.livestock.price.toLocaleString()}
              </p>
            </div>
          )}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}% funded</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                ₦{groupDetails.slotPrice.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Per Slot</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{groupDetails.totalSlot}</div>
              <div className="text-xs text-muted-foreground">Total Slots</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{groupDetails.slotTaken}</div>
              <div className="text-xs text-muted-foreground">Slots Taken</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{slotsLeft}</div>
              <div className="text-xs text-muted-foreground">Slots Left</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              Created by: {groupDetails.created_by}{" "}
              {/* You might want to fetch creator's name */}
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />₦
              {(groupDetails.finalSlotPriceTaken || 0).toLocaleString()} raised
            </div>
          </div>
          <div className="flex justify-center mt-6 gap-4">
            <Link href={`/dashboard/groups`}>
              <Button variant="outline">Back to Groups</Button>
            </Link>
            {groupDetails.totalSlotLeft > 0 &&
              groupDetails.status === "active" && (
                <Button
                  onClick={handleJoinGroupClick}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Join Group
                </Button>
              )}
          </div>
        </CardContent>
      </Card>

      {groupDetails && (
        <JoinGroupModal
          group={groupDetails}
          isOpen={isJoinModalOpen}
          onClose={handleCloseJoinModal}
          walletBalance={0}
        />
      )}
    </div>
  );
}
