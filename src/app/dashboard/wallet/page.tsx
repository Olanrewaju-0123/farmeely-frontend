"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { DollarSign, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type { WalletFundingPayload, ApiResponse, Transaction } from "@/lib/types" // Import the new type
import { useToast } from "@/components/ui/use-toast"
import { z } from "zod"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"


export default function WalletPage() {
  const [amount, setAmount] = useState<number | string>("")
  const { toast } = useToast()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isFundDialogOpen, setIsFundDialogOpen] = useState(false)
  
  const { token, user, isLoading: isAuthLoading } = useAuth();

  // Fetch wallet balance using useQuery
   const { 
    data: walletBalanceResponse, 
    isLoading: isLoadingBalance,
    error: walletBalanceError 
  } = useQuery<ApiResponse<{ balance: number }>>({
    queryKey: ["walletBalance", token],
    queryFn: () => api.getWalletBalance(token as string),
    enabled: !!token && !isAuthLoading,
  })

   const walletBalance = walletBalanceResponse?.data?.balance || 0

  // Fetch wallet transactions using useQuery
  const { 
    data: transactionsResponse, 
    isLoading: isLoadingTransactions,
    error: transactionsError 
  } = useQuery<ApiResponse<Transaction[]>>({
    queryKey: ["walletTransactions", token],
    queryFn: () => api.getWalletTransactions(token as string),
    enabled: !!token && !isAuthLoading,
  })
 const transactions: Transaction[] = transactionsResponse?.data || []

  // Mutation for starting wallet funding
  const startFundingMutation = useMutation<
    ApiResponse<WalletFundingPayload>, 
    Error, 
    { fundAmount: number; paymentMethod: string }
  >({
    mutationFn: async (variables:{fundAmount: number; paymentMethod:string}) => {
      // const token =  user?.token ||localStorage.getItem('authToken') || '';
      
     const payload= {
      amount: variables.fundAmount,
      payment_method: variables.paymentMethod
     } 
      return await api.startWalletFunding(payload, token);
  },
    onSuccess: (response: ApiResponse<WalletFundingPayload>) => {
      console.log("Frontend: startFundingMutation onSuccess response:", response)
      
      // Check if response is successful and has payment_url
      if (response.status === "success" && response.data?.data?.payment_url) {
        toast({
          title: "Payment Initiated",
          description: "Redirecting to payment gateway...",
        })
        // Redirect to external payment gateway
        window.location.href = response.data.data.payment_url
      } else if (response.status === "success") {
        // Success but no payment URL (maybe for wallet funding)
        toast({
          title: "Funding Initiated",
          description: response.message || "Wallet funding initiated successfully.",
          variant: "default",
        })
        setAmount("")
        queryClient.invalidateQueries({ queryKey: ["walletBalance"] })
      } else {
        // Response indicates error
        toast({
          title: "Error",
          description: response.message || response.error || "Failed to initiate funding.",
          variant: "destructive",
        })
      }
    },
    onError: (error: Error) => {
      console.error("Frontend: startFundingMutation onError:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to initiate funding.",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fundAmount = Number.parseFloat(amount as string)
    const fundWalletSchema = z.object({
      amount: z.coerce.number().min(100, "Amount must be at least ₦100"),
    })

    const validation = fundWalletSchema.safeParse({ amount: fundAmount })
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.issues[0].message,
        variant: "destructive",
      })
      return
    }

    if (isNaN(fundAmount) || fundAmount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid amount.",
        variant: "destructive",
      })
      return
    }
    try {
      await startFundingMutation.mutateAsync({fundAmount, paymentMethod: "wallet"})
    } catch (err) {
      // Error handled by mutation's onError
      console.error("Error in handleSubmit:", err)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Wallet</h1>
        <Button onClick={() => setIsFundDialogOpen(true)}>
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
          Fund Wallet
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wallet Balance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingBalance ? (
              <div className="h-8 w-24 animate-pulse bg-gray-200 rounded"></div>
            ) : (
              <div className="text-2xl font-bold">₦{walletBalance.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground">Available for investment</p>
          </CardContent>
        </Card>
        {/* Fund Wallet Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fund Your Wallet</CardTitle>
            <CardDescription>Add funds to your Farmeely wallet to start investing.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="e.g., 50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                />
              </div>
              {startFundingMutation.isPending && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>Processing your request...</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={startFundingMutation.isPending}>
                {startFundingMutation.isPending ? "Processing..." : "Proceed to Fund"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History Card */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your recent wallet transactions will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTransactions ? (
              <div className="h-8 w-24 animate-pulse bg-gray-200 rounded"></div>
            ) : (
              <div>
                {transactions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No transactions yet.</p>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.transaction_id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium capitalize">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div
                          className={`font-semibold ${transaction.transaction_type === "credit" ? "text-green-600" : "text-red-600"}`}
                        >
                          {transaction.transaction_type === "credit" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
