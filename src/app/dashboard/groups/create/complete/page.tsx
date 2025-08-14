"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"

export default function CompleteGroupCreationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const {token} = useAuth()

  const [statusMessage, setStatusMessage] = useState("Processing your group creation payment...")
  const [isErrorState, setIsErrorState] = useState(false) // Use a distinct state for local errors
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "others">("wallet");

  const reference = searchParams.get("reference") // Paystack sends a 'reference' parameter
  const groupId = searchParams.get("group_id") // Assuming you pass group_id back from Paystack callback

  const completeCreationMutation = useMutation({
    mutationFn: async (payload: { groupId: string; paymentMethod: string; paymentReference: string }) => {
      return api.completeCreateGroup( payload, token as string
        // group_id: payload.group_id,
        // paymentMethod: "others", // Assuming this page is only for 'others' payment method callbacks
        // paymentReference: payload.paymentReference,
      )
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        setStatusMessage("Group created successfully! Redirecting to My Groups...")
        setIsErrorState(false)
        toast({
          title: "Group Created!",
          description: data.message || "Your group has been successfully created.",
          variant: "success",
        })
        queryClient.invalidateQueries({ queryKey: ["activeGroups"] }) // Invalidate to refetch updated groups
        queryClient.invalidateQueries({ queryKey: ["myGroups"] })
        queryClient.invalidateQueries({ queryKey: ["walletBalance"] }) // Wallet might be affected if initial contribution was from wallet
        setTimeout(() => {
          router.push("/dashboard/groups")
        }, 2000)
      } else {
        setStatusMessage(`Group creation failed: ${data.message || "Unknown error"}.`)
        setIsErrorState(true)
        toast({
          title: "Error",
          description: data.message || "Failed to finalize group creation.",
          variant: "destructive",
        })
      }
    },
    onError: (error: any) => {
      setStatusMessage(`Group creation failed: ${error.message || "An unexpected error occurred."}.`)
      setIsErrorState(true)
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    },
  })

  useEffect(() => {
    if (reference && groupId && token) {
      completeCreationMutation.mutate({ groupId: groupId, paymentMethod: paymentMethod, paymentReference: reference })
    } else {
      setStatusMessage("Missing payment reference or group ID. Please try creating your group again.")
      setIsErrorState(true)
      toast({
        title: "Error",
        description: "Missing payment reference or group ID.",
        variant: "destructive",
      })
    }
  }, [reference, groupId, completeCreationMutation, toast, token]) // Depend on reference and groupId to trigger mutation

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Group Creation Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {completeCreationMutation.isPending && (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-12 w-12 animate-spin text-green-600" />
              <p className="text-lg font-medium">{statusMessage}</p>
            </div>
          )}
          {completeCreationMutation.isSuccess && (
            <Alert className="bg-green-50 border-green-200 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <AlertDescription className="text-lg font-medium">{statusMessage}</AlertDescription>
            </Alert>
          )}
          {(completeCreationMutation.isError ||  isErrorState) && (
            <Alert variant="destructive">
              <XCircle className="h-5 w-5" />
              <AlertDescription className="text-lg font-medium">{statusMessage}</AlertDescription>
            </Alert>
          )}
          {isErrorState &&
            !completeCreationMutation.isError && ( // For cases where reference/groupId is missing
              <Alert variant="destructive">
                <XCircle className="h-5 w-5" />
                <AlertDescription className="text-lg font-medium">{statusMessage}</AlertDescription>
              </Alert>
            )}
          {(completeCreationMutation.isSuccess || completeCreationMutation.isError || isErrorState) && (
            <Button onClick={() => router.push("/dashboard/groups")} className="mt-4">
              Go to My Groups
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
