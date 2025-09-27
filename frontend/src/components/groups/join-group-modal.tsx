"use client";

import { useState, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import type { Group } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface JoinGroupModalProps {
  group?: Group | null;
  groupId?: string | number;
  isOpen: boolean;
  onClose: () => void;
  onJoin?: (
    groupId: string,
    slots: number,
    paymentMethod: "wallet" | "others"
  ) => void;
  walletBalance?: number;
}

const formSchema = z.object({
  slots_taken: z.number().min(1, "Please enter at least 1 slot."),
  payment_method: z.enum(["wallet", "others"]),
});

type FormData = z.infer<typeof formSchema>;

export function JoinGroupModal({
  group,
  groupId,
  isOpen,
  onClose,
  onJoin,
  walletBalance = 0,
}: JoinGroupModalProps) {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [groupDetails, setGroupDetails] = useState<Group | null>(null);
  const [isLoadingGroup, setIsLoadingGroup] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slots, setSlots] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "others">(
    "wallet"
  );

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slots_taken: 1,
      payment_method: "wallet",
    },
  });

  // Determine which group to use
  const targetGroup = group || groupDetails;
  const targetGroupId = group?.group_id || groupId?.toString();

  if (!targetGroup && !targetGroupId) return null;

  const totalCost = slots * (groupDetails?.slotPrice || 0);
  const canAffordWithWallet = walletBalance >= totalCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onJoin?.(targetGroupId || "", slots, paymentMethod);
    onClose();
  };

  useEffect(() => {
    if (isOpen && targetGroup && token) {
      setIsLoadingGroup(true);
      api
        .getGroupById(targetGroupId || "", token) // API expects string ID
        .then((res) => {
          if (res.status === "success" && res.data) {
            setGroupDetails(res.data);
            form.setValue("slots_taken", 1); // Reset slots when group changes
          } else {
            toast({
              title: "Error",
              description: res.message || "Failed to load group details.",
              variant: "destructive",
            });
            onClose();
          }
        })
        .catch((error) => {
          console.error("Error fetching group details:", error);
          toast({
            title: "Error",
            description: "Network error while fetching group details.",
            variant: "destructive",
          });
          onClose();
        })
        .finally(() => {
          setIsLoadingGroup(false);
        });
    }
  }, [isOpen, targetGroup, token, toast, onClose, form, targetGroupId]);

  // const onSubmit = async (values: z.infer<typeof formSchema>) => {
  const onSubmit: SubmitHandler<FormData> = async (values) => {
    if (!user || !token || !groupDetails) {
      toast({
        title: "Error",
        description: "User not authenticated or group details missing.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const amount_paid = values.slots_taken * (groupDetails.slotPrice || 0);
      const payload = {
        group_id: groupDetails.group_id,
        user_id: user.id,
        slots: values.slots_taken,
        payment_method: values.payment_method,
        amount_paid: amount_paid,
      };

      const response = await api.joinGroup(targetGroupId || "", payload, token);

      if (response.status === "success") {
        toast({
          title: "Success",
          description: response.message || "Successfully joined the group!",
          variant: "default",
        });
        onClose();
        router.push("/dashboard/groups"); // Redirect to groups page to refresh data
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to join group.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error joining group:", error);
      toast({
        title: "Error",
        description: error.message || "Network error while joining group.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableSlots = groupDetails
    ? groupDetails.totalSlot - groupDetails.slotTaken
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join Group</DialogTitle>
          <DialogDescription>
            {groupDetails
              ? `Joining: ${groupDetails.group_name}`
              : "Loading group details..."}
          </DialogDescription>
        </DialogHeader>
        {isLoadingGroup ? (
          <div className="py-8 text-center">Loading group details...</div>
        ) : !groupDetails ? (
          <div className="py-8 text-center text-red-500">
            Group details not found.
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-4 py-4"
            >
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="slots_taken" className="text-right">
                  Slots
                </Label>
                <FormField
                  control={form.control}
                  name="slots_taken"
                  render={({ field }) => (
                    <FormItem className="col-span-3">
                      <FormControl>
                        <Input
                          id="slots_taken"
                          type="number"
                          min={1}
                          max={availableSlots}
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number.parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Price per slot</Label>
                <span className="col-span-3 font-medium">
                  {groupDetails.slotPrice
                    ? `$${groupDetails.slotPrice.toFixed(2)}`
                    : "N/A"}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Total Amount</Label>
                <span className="col-span-3 font-bold text-lg">
                  $
                  {(
                    form.watch("slots_taken") * (groupDetails.slotPrice || 0)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Available Slots</Label>
                <span className="col-span-3 font-medium">{availableSlots}</span>
              </div>
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Payment Method</FormLabel>
                    <FormControl className="col-span-3">
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="wallet" />
                          </FormControl>
                          <FormLabel className="font-normal">Wallet</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="others" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            External Payment
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="col-start-2 col-span-3" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || availableSlots === 0}
              >
                {isSubmitting ? "Joining..." : "Confirm Join"}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );

  // return (
  //   <Dialog open={isOpen} onOpenChange={onClose}>
  //     <DialogContent className="sm:max-w-md">
  //       <DialogHeader>
  //         <DialogTitle>Join {group.groupName}</DialogTitle>
  //         <DialogDescription>Choose how many slots you want to purchase in this group.</DialogDescription>
  //       </DialogHeader>

  //       <form onSubmit={handleSubmit} className="space-y-4">
  //         <div className="space-y-2">
  //           <Label htmlFor="slots">Number of Slots</Label>
  //           <Input
  //             id="slots"
  //             type="number"
  //             min={1}
  //             max={group.totalSlotLeft}
  //             value={slots}
  //             onChange={(e) => setSlots(Number(e.target.value))}
  //             required
  //           />
  //           <p className="text-sm text-muted-foreground">Available slots: {group.totalSlotLeft}</p>
  //         </div>

  //         <div className="bg-gray-50 p-3 rounded-lg">
  //           <div className="flex justify-between">
  //             <span>Total Cost:</span>
  //             <span className="font-semibold">{formatCurrency(totalCost)}</span>
  //           </div>
  //         </div>

  //         <div className="space-y-3">
  //           <Label>Payment Method</Label>
  //           <RadioGroup value={paymentMethod} onValueChange={(value: "wallet" | "others") => setPaymentMethod(value)}>
  //             <div className="flex items-center space-x-2">
  //               <RadioGroupItem value="wallet" id="wallet" />
  //               <Label htmlFor="wallet" className="flex-1">
  //                 <div className="flex justify-between">
  //                   <span>Wallet Balance</span>
  //                   <span className={canAffordWithWallet ? "text-green-600" : "text-red-600"}>
  //                     {formatCurrency(walletBalance)}
  //                   </span>
  //                 </div>
  //               </Label>
  //             </div>
  //             <div className="flex items-center space-x-2">
  //               <RadioGroupItem value="others" id="others" />
  //               <Label htmlFor="others">Card/Bank Transfer</Label>
  //             </div>
  //           </RadioGroup>
  //         </div>

  //         <div className="flex gap-2">
  //           <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
  //             Cancel
  //           </Button>
  //           <Button type="submit" className="flex-1" disabled={paymentMethod === "wallet" && !canAffordWithWallet}>
  //             Join Group
  //           </Button>
  //         </div>
  //       </form>
  //     </DialogContent>
  //   </Dialog>
  // )
}
