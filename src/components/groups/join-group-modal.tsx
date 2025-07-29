"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import type { Group } from "@/lib/types"

interface JoinGroupModalProps {
  groupId: number // Expecting a number here
  isOpen: boolean
  onClose: () => void
}

const formSchema = z.object({
  slots_taken: z.coerce.number().min(1, "Please enter at least 1 slot."),
  payment_method: z.enum(["wallet", "external"], {
    required_error: "Please select a payment method.",
  }),
})

export function JoinGroupModal({ groupId, isOpen, onClose }: JoinGroupModalProps) {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [groupDetails, setGroupDetails] = useState<Group | null>(null)
  const [isLoadingGroup, setIsLoadingGroup] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slots_taken: 1,
      payment_method: "wallet",
    },
  })

  useEffect(() => {
    if (isOpen && groupId && token) {
      setIsLoadingGroup(true)
      api
        .getGroupById(groupId.toString(), token) // API expects string ID
        .then((res) => {
          if (res.status === "success" && res.data) {
            setGroupDetails(res.data)
            form.setValue("slots_taken", 1) // Reset slots when group changes
          } else {
            toast({
              title: "Error",
              description: res.message || "Failed to load group details.",
              variant: "destructive",
            })
            onClose()
          }
        })
        .catch((error) => {
          console.error("Error fetching group details:", error)
          toast({
            title: "Error",
            description: "Network error while fetching group details.",
            variant: "destructive",
          })
          onClose()
        })
        .finally(() => {
          setIsLoadingGroup(false)
        })
    }
  }, [isOpen, groupId, token, toast, onClose, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user || !token || !groupDetails) {
      toast({
        title: "Error",
        description: "User not authenticated or group details missing.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const amount_paid = values.slots_taken * groupDetails.price_per_slot
      const payload = {
        group_id: groupDetails.id,
        user_id: user.id,
        slots_taken: values.slots_taken,
        payment_method: values.payment_method,
        amount_paid: amount_paid,
      }

      const response = await api.joinGroup(payload, token)

      if (response.status === "success") {
        toast({
          title: "Success",
          description: response.message || "Successfully joined the group!",
          variant: "default",
        })
        onClose()
        router.push("/dashboard/groups") // Redirect to groups page to refresh data
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to join group.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error joining group:", error)
      toast({
        title: "Error",
        description: error.message || "Network error while joining group.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableSlots = groupDetails ? groupDetails.total_slots - groupDetails.slots_taken : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join Group</DialogTitle>
          <DialogDescription>
            {groupDetails ? `Joining: ${groupDetails.group_name}` : "Loading group details..."}
          </DialogDescription>
        </DialogHeader>
        {isLoadingGroup ? (
          <div className="py-8 text-center">Loading group details...</div>
        ) : !groupDetails ? (
          <div className="py-8 text-center text-red-500">Group details not found.</div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
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
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
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
                  {groupDetails.price_per_slot ? `$${groupDetails.price_per_slot.toFixed(2)}` : "N/A"}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Total Amount</Label>
                <span className="col-span-3 font-bold text-lg">
                  ${(form.watch("slots_taken") * (groupDetails.price_per_slot || 0)).toFixed(2)}
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
                            <RadioGroupItem value="external" />
                          </FormControl>
                          <FormLabel className="font-normal">External Payment</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="col-start-2 col-span-3" />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting || availableSlots === 0}>
                {isSubmitting ? "Joining..." : "Confirm Join"}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
