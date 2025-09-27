"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Loader2, XCircle } from "lucide-react"
import { api } from "@/lib/api"
import type { Livestock, CreateGroupPayload, StartCreateGroupPayload, CreateGroupResponse, ApiResponse, } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"

export default function CreateGroupPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    groupName: "",
    description: "",
    livestock_id: "",
    slotPrice: 0, // This will be the chosen price per slot for the group
    totalSlot: 0, // This will be calculated based on livestock price and chosen slotPrice
    // creatorInitialSlots: 1, // Default to 1 slot for the creator
    slotTaken:1,
  })
  const [selectedLivestock, setSelectedLivestock] = useState<Livestock | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { token, user, isLoading: isAuthLoading } = useAuth();
  // Fetch available livestock for the dropdown
  const {
    data: livestocks,
    isLoading: isLoadingLivestocks,
    isError: isErrorLivestocks,
    error: livestocksError,
  } = useQuery<Livestock[]>({
    queryKey: ["availableLivestocks"],
    queryFn: () => api.getLivestocks(token as string).then((res) => res.data || []),
    enabled: !!token && !isAuthLoading,
  })

  // Mutation for starting group creation (creating the draft)
  const createGroupDraftMutation = useMutation<
    ApiResponse<CreateGroupResponse>,
    Error,
    StartCreateGroupPayload
  >({
    mutationFn: async (data: StartCreateGroupPayload) => {
      console.log("Sending group creation data:", data)
      return api.startCreateGroup(data, token as string)
    },
    onSuccess: (response) => {
      console.log("Group creation response:", response)
      const groupId = response?.data?.group_id || response?.group_id
      if (response.status === "success" && response.data?.group_id && groupId) {
        toast({
          title: "Group Draft Created!",
          description: "Proceeding to finalize payment for your initial contribution.",
        })
        router.push(`/dashboard/groups/create/finalize/${response.data.group_id}`)
      } else {
        const errorMessage = response.message || "Failed to create group draft."
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    },
     onError: (error: Error) => {
      console.error("Failed to create group draft:", error)
      const errorMessage = error.message || "Failed to create group draft."
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    },
  })

  // Handle livestock selection
  const handleLivestockSelect = (livestockId: string) => {
    const foundLivestock = livestocks?.find((l) => l.livestock_id === livestockId)
    if (foundLivestock) {
      setSelectedLivestock(foundLivestock)
      // Initialize slotPrice to minimum_amount and calculate totalSlot
      const initialSlotPrice = foundLivestock.minimum_amount
      const calculatedTotalSlots = foundLivestock.price / foundLivestock.minimum_amount
      // const calculatedTotalSlots = foundLivestock.price / initialSlotPrice
      setFormData((prev) => ({
        ...prev,
        livestock_id: livestockId,
        slotPrice: initialSlotPrice,
        totalSlot: calculatedTotalSlots,
      }))
    } else {
      setSelectedLivestock(null)
      setFormData((prev) => ({
        ...prev,
        livestock_id: "",
        slotPrice: 0,
        totalSlot: 0,
      }))
    }
  }

  // Handle slot price selection from the dropdown
  const handleSlotPriceChange = (value: string) => {
    const newSlotPrice = Number.parseInt(value)
    if (selectedLivestock && !isNaN(newSlotPrice) && newSlotPrice > 0) {
      // This calculates total slots based on the NEWLY SELECTED slot price
      const calculatedTotalSlots = selectedLivestock.price / newSlotPrice
      setFormData((prev) => ({
        ...prev,
        slotPrice: newSlotPrice,
        totalSlot: calculatedTotalSlots,
      }))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value, // For groupName and description
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

if (
  !formData.groupName.trim() ||
  !formData.description.trim() ||
  !formData.livestock_id ||
  formData.slotPrice <= 0 ||
  formData.totalSlot <= 0 ||
  // formData.creatorInitialSlots <= 0 ||
  formData.slotTaken <= 0
) {
  setError("Please fill in all required fields and ensure valid slot and total values.")
  toast({
    title: "Validation Error",
    description: "Please fill in all required fields and ensure valid slot and total values.",
    variant: "destructive",
  })
      return
    }

    if (formData.slotTaken > formData.totalSlot) {
      const errorMessage = "Initial slots cannot exceed total slots"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return
    }

    try {
      const payload: StartCreateGroupPayload = {
        livestock_id: formData.livestock_id,
        groupName: formData.groupName,
        description: formData.description,
        totalSlot: formData.totalSlot,
        slotPrice: formData.slotPrice,
        slotTaken: formData.slotTaken,
        // creatorInitialSlots: formData.creatorInitialSlots
      }
      console.log("Submitting payload:", payload)
      await createGroupDraftMutation.mutateAsync(payload)
    } catch (err) {
      console.error("Error in handleSubmit:", err)
      // Error handled by mutation's onError
    }
  }

  const isLoadingPage = isLoadingLivestocks || createGroupDraftMutation.isPending

  if (isLoadingLivestocks) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
      </div>
    )
  }

  if (isErrorLivestocks) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-red-600">Error loading livestock options</h2>
        <p className="text-muted-foreground">{livestocksError?.message || "Failed to fetch livestock data."}</p>
      </div>
    )
  }

  // Generate slot price options based on selected livestock's minimum_amount and price
  // This logic ensures only valid options are presented in the dropdown
  const slotPriceOptions: number[] = []
  if (selectedLivestock) {
    for (
      let price = selectedLivestock.minimum_amount;
      price <= selectedLivestock.price;
      price += selectedLivestock.minimum_amount
    ) {
      // Ensure the price is a divisor of the total livestock price
      if (selectedLivestock.price % price === 0) {
        slotPriceOptions.push(price)
      }
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Livestock Group</h1>
        <p className="text-gray-600 mt-2">Define your group details and start attracting members.</p>
      </div>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Group Details</CardTitle>
          <CardDescription>Fill in the information for your new livestock group.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  name="groupName"
                  value={formData.groupName}
                  onChange={handleInputChange}
                  placeholder="e.g., Premium Cattle Group Q3"
                  required
                  className="col-span-1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="A brief description of your group and its goals."
                  required
                  className="col-span-1"
                />
              </div>
            </div>

            {/* Investment Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Group Details</h3>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="livestock_id">Livestock Type</Label>
                  <Select value={formData.livestock_id} onValueChange={handleLivestockSelect} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a livestock type" />
                    </SelectTrigger>
                    <SelectContent>
                      {livestocks?.map((livestock) => (
                        <SelectItem key={livestock.livestock_id} value={livestock.livestock_id}>
                          {livestock.name} (₦{livestock.price.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slotPrice">Price per Slot</Label>
                  <Select
                    value={formData.slotPrice > 0 ? formData.slotPrice.toString() : ""}
                    onValueChange={handleSlotPriceChange}
                    disabled={!selectedLivestock} // Disable until livestock is selected
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Slot Amount" />
                    </SelectTrigger>
                    <SelectContent>
                      {slotPriceOptions.length > 0 ? (
                        slotPriceOptions.map((price) => (
                          <SelectItem key={price} value={price.toString()}>
                            ₦{price.toLocaleString()}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-center text-muted-foreground">No valid slot prices</div>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total units for this group: {formData.totalSlot}
                  </p>
                </div>
              </div>
            </div>

            {/* Creator's Initial Slots */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Your Contribution</h3>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="slotTaken">Number of Slots You'd like to Take (Initial Contribution)</Label>
                <Input
                  id="slotTaken"
                  name="slotTaken"
                  type="number"
                  value={formData.slotTaken}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slotTaken: Number(e.target.value) }))}
                  min={1}
                  max={formData.totalSlot > 0 ? formData.totalSlot : 1} // Max is total slots, or 1 if totalSlot is 0
                  required
                  disabled={!selectedLivestock || formData.totalSlot === 0}
                />
                <p className="text-sm text-muted-foreground mt-1">This is your initial Slot(s) in the group.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Cost of your initial contribution:</span>
                  <span className="font-semibold">
                    ₦{(formData.slotPrice * formData.slotTaken).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-green-600 text-white hover:bg-green-700"
              disabled={
                isLoadingPage ||
                !selectedLivestock ||
                formData.slotPrice <= 0 ||
                formData.slotTaken <= 0 ||
                formData.slotTaken > formData.totalSlot
              }
            >
              {createGroupDraftMutation.isPending ? "Creating Draft..." : "Create Group Draft"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
