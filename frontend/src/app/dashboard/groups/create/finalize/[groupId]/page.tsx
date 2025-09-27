"use client";

import type React from "react";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, XCircle, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import type { Group } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency } from "@/lib/utils";
import { PaystackPayment } from "@/components/payments/paystack-payment";

interface FinalizeGroupCreationPageProps {
  params: Promise<{ groupId: string }>;
}

export default function FinalizeGroupCreationPage({
  params,
}: FinalizeGroupCreationPageProps) {
  const { groupId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const { toast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "others">(
    "wallet"
  );
  const [error, setError] = useState<string | null>(null);

  const {
    data: groupDetails,
    isLoading: isLoadingGroup,
    isError: isErrorGroup,
    error: groupError,
  } = useQuery<Group>({
    queryKey: ["groupDetails", groupId],
    queryFn: async () => {
      const res = await api.getGroupDetails(groupId, token as string);
      return res.data as Group;
    },
    enabled: !!groupId && !!token,
  });

  const { data: walletBalance = 0, isLoading: isLoadingWalletBalance } =
    useQuery<number>({
      queryKey: ["walletBalance"],
      queryFn: () =>
        api
          .getWalletBalance(token as string)
          .then((res) => res.data?.balance || 0),
    });

  const { mutateAsync: completeGroupMutation, isPending } = useMutation({
    mutationFn: async (payload: {
      groupId: string;
      paymentMethod: string;
      paymentReference?: string;
      amount?: string;
    }) => {
      return api.completeCreateGroup(payload, token as string);
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        toast({
          title: "Group Created!",
          description:
            data.message ||
            "Livestock group created successfully! Redirecting to My Groups...",
        });
        queryClient.invalidateQueries({ queryKey: ["activeGroups"] });
        queryClient.invalidateQueries({ queryKey: ["myGroups"] });
        queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
        setTimeout(() => {
          router.push("/dashboard/groups");
        }, 2000);
      } else if (
        "createDetails" in data &&
        (data.createDetails as any)?.paymentLink
      ) {
        window.location.href = (data.createDetails as any)?.paymentLink;
      } else {
        setError(data.message || "Failed to finalize group creation.");
        toast({
          title: "Error",
          description: data.message || "Failed to finalize group creation.",
          variant: "destructive",
        });
      }
    },
    onError: (err: any) => {
      console.error("Failed to finalize group:", err);
      setError(err.message || "Failed to finalize Livestock group.");
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!groupDetails) {
      setError("Group details not loaded. Please try again.");
      return;
    }

    const slotPrice = Number(groupDetails.slotPrice) || 0;
    const creatorSlots = Number(groupDetails.slotTaken) || 1;
    const initialContributionCost = slotPrice * creatorSlots;

    console.log("=== PAYMENT CALCULATION DEBUG ===");
    console.log("Slot Price (parsed):", slotPrice);
    console.log("Creator Slots (parsed):", creatorSlots);
    console.log("Initial Contribution Cost:", initialContributionCost);
    console.log("Wallet Balance:", walletBalance);
    console.log("================================");

    if (initialContributionCost <= 0) {
      setError("Invalid contribution amount. Please try again.");
      return;
    }

    if (paymentMethod === "wallet" && walletBalance < initialContributionCost) {
      setError(
        "Insufficient wallet balance for your initial contribution. Please fund your wallet or choose card payment."
      );
      toast({
        title: "Insufficient Balance",
        description:
          "Insufficient wallet balance for your initial contribution.",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "wallet") {
      try {
        await completeGroupMutation({
          groupId: groupId,
          paymentMethod: paymentMethod,
          amount: initialContributionCost.toString(),
        });
      } catch (err) {
        // Error handled by mutation's onError
      }
    }
  };

  const handlePaystackSuccess = async (reference: any) => {
    console.log(
      "Paystack payment successful, completing group creation:",
      reference
    );

    try {
      const slotPrice = Number(groupDetails?.slotPrice) || 0;
      const creatorSlots = Number(groupDetails?.slotTaken) || 1;
      const initialContributionCost = slotPrice * creatorSlots;

      await completeGroupMutation({
        groupId: groupId,
        paymentMethod: "others",
        paymentReference: reference.reference,
        amount: initialContributionCost.toString(),
      });
    } catch (err) {
      console.error("Error completing group creation after payment:", err);
    }
  };

  const handlePaystackClose = () => {
    console.log("Paystack payment dialog closed");
    toast({
      title: "Payment Cancelled",
      description: "Payment was cancelled. You can try again.",
      variant: "destructive",
    });
  };

  const isLoadingPage = isLoadingGroup || isLoadingWalletBalance || isPending;

  if (isLoadingPage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
      </div>
    );
  }

  if (isErrorGroup || !groupDetails) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-red-600">
          Error loading group details
        </h2>
        <p className="text-muted-foreground">
          {groupError?.message || "Failed to fetch group data."}
        </p>
        <Button
          onClick={() => router.push("/dashboard/groups/create")}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go back to Create Group
        </Button>
      </div>
    );
  }

  const slotPrice = Number(groupDetails.slotPrice) || 0;
  const creatorSlots = Number(groupDetails.slotTaken) || 1;
  const initialContributionCost = slotPrice * creatorSlots;
  const canAffordWithWallet = walletBalance >= initialContributionCost;

  // Get the group name consistently - prioritize groupName over group_name
  const groupName =
    groupDetails.groupName || groupDetails.group_name || "Unnamed Group";

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          Finalize Group Creation
        </h1>
        <p className="text-gray-600 mt-2">
          Complete your initial contribution to activate "{groupName}".
        </p>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Payment for Initial Contribution</CardTitle>
          <CardDescription>
            You are about to make the initial contribution for your group.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Group Name:</span>
                <span className="font-semibold">{groupName}</span>
              </div>
              <div className="flex justify-between">
                <span>Your Initial Slots:</span>
                <span className="font-semibold">{creatorSlots}</span>
              </div>
              <div className="flex justify-between">
                <span>Price per Slot:</span>
                <span className="font-semibold">
                  {formatCurrency(slotPrice)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount Due:</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(initialContributionCost)}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Select Payment Method</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value: "wallet" | "others") =>
                  setPaymentMethod(value)
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="wallet" id="wallet" />
                  <Label htmlFor="wallet" className="flex-1">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span>Wallet Balance</span>
                        {!canAffordWithWallet &&
                          initialContributionCost > 0 && (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto text-blue-600 hover:text-blue-800 text-xs mt-1"
                              onClick={() => router.push("/dashboard/wallet")}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Fund Wallet
                            </Button>
                          )}
                      </div>
                      <span
                        className={
                          canAffordWithWallet && initialContributionCost > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {formatCurrency(walletBalance)}
                      </span>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="others" id="others" />
                  <Label htmlFor="others">Card/Bank Transfer</Label>
                </div>
              </RadioGroup>
            </div>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {paymentMethod === "wallet" ? (
              <Button
                type="submit"
                className="w-full bg-green-600 text-white hover:bg-green-700"
                disabled={
                  isPending ||
                  !canAffordWithWallet ||
                  initialContributionCost <= 0
                }
              >
                {isPending ? "Processing Payment..." : "Pay with Wallet"}
              </Button>
            ) : (
              <PaystackPayment
                amount={initialContributionCost}
                reference={`group_${groupId}_${Date.now()}`}
                onSuccess={handlePaystackSuccess}
                onClose={handlePaystackClose}
                disabled={isPending || initialContributionCost <= 0}
                metadata={{
                  groupId: groupId,
                  groupName: groupName,
                  paymentType: "group_creation",
                  slots: creatorSlots,
                }}
                className={`w-full text-white transition-colors duration-200 ${
                  paymentMethod === "others" &&
                  !isPending &&
                  initialContributionCost > 0
                    ? "bg-green-500 hover:bg-green-600 cursor-pointer"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {isPending ? "Processing Payment..." : "Pay with Card"}
              </PaystackPayment>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
