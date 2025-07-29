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

export default function CompleteWalletFundingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [statusMessage, setStatusMessage] = useState("Processing your payment...")
  const [isErrorState, setIsErrorState] = useState(false) // Use a distinct state for local errors

  const reference = searchParams.get("reference") // Assuming payment gateway sends a 'reference' parameter

  const completeFundingMutation = useMutation({
    mutationFn: async (ref: string) => {
      return api.completeWalletFunding(ref)
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        setStatusMessage("Wallet funded successfully! Redirecting...")
        setIsErrorState(false)
        toast({
          title: "Wallet Funded!",
          description: data.message || "Your wallet has been successfully funded.",
          variant: "success",
        })
        queryClient.invalidateQueries({ queryKey: ["walletBalance"] }) // Invalidate to refetch updated balance
        setTimeout(() => {
          router.push("/dashboard/wallet")
        }, 2000)
      } else {
        setStatusMessage(`Payment failed: ${data.message || "Unknown error"}.`)
        setIsErrorState(true)
        toast({
          title: "Error",
          description: data.message || "Failed to complete wallet funding.",
          variant: "destructive",
        })
      }
    },
    onError: (error: any) => {
      setStatusMessage(`Payment failed: ${error.message || "An unexpected error occurred."}.`)
      setIsErrorState(true)
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    },
  })

  useEffect(() => {
    if (reference) {
      completeFundingMutation.mutate(reference)
    } else {
      setStatusMessage("No payment reference found. Please try funding your wallet again.")
      setIsErrorState(true)
      toast({
        title: "Error",
        description: "No payment reference found.",
        variant: "destructive",
      })
    }
  }, [reference, completeFundingMutation, toast]) // Depend on reference to trigger mutation

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Wallet Funding Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {completeFundingMutation.isPending && (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-12 w-12 animate-spin text-green-600" />
              <p className="text-lg font-medium">{statusMessage}</p>
            </div>
          )}
          {completeFundingMutation.isSuccess && (
            <Alert className="bg-green-50 border-green-200 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <AlertDescription className="text-lg font-medium">{statusMessage}</AlertDescription>
            </Alert>
          )}
          {completeFundingMutation.isError && (
            <Alert variant="destructive">
              <XCircle className="h-5 w-5" />
              <AlertDescription className="text-lg font-medium">{statusMessage}</AlertDescription>
            </Alert>
          )}
          {isErrorState &&
            !completeFundingMutation.isError && ( // For cases where reference is missing
              <Alert variant="destructive">
                <XCircle className="h-5 w-5" />
                <AlertDescription className="text-lg font-medium">{statusMessage}</AlertDescription>
              </Alert>
            )}
          {(completeFundingMutation.isSuccess || completeFundingMutation.isError || isErrorState) && (
            <Button onClick={() => router.push("/dashboard/wallet")} className="mt-4">
              Go to Wallet
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
