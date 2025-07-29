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
import type { StartWalletFundingResponse } from "@/lib/types" // Import the new type
import { useToast } from "@/components/ui/use-toast"
import { z } from "zod"
import type { Transaction } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

export default function WalletPage() {
  const [amount, setAmount] = useState<number | string>("")
  const { toast } = useToast()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isFundDialogOpen, setIsFundDialogOpen] = useState(false)

  // Fetch wallet balance using useQuery
  const { data: walletBalanceData = { data: { balance: 0 } }, isLoading: isLoadingBalance } = useQuery({
    queryKey: ["walletBalance"],
    queryFn: () => api.getWalletBalance(),
  })

  const walletBalance = walletBalanceData?.data?.balance || 0

  // Fetch wallet transactions using useQuery
  const { data: transactionsData = { data: [] }, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["walletTransactions"],
    queryFn: () => api.getWalletTransactions(),
  })

  const transactions: Transaction[] = transactionsData?.data || []

  // Mutation for starting wallet funding
  const startFundingMutation = useMutation({
    mutationFn: async (fundAmount: number) => {
      // Cast the return type to ensure TypeScript knows the structure
      return api.startWalletFunding({ amount: fundAmount }) as Promise<StartWalletFundingResponse>
    },
    onSuccess: (data: StartWalletFundingResponse) => {
      console.log("Frontend: startFundingMutation onSuccess data:", data)
      // Add explicit checks for data and data.data
      if (data && data.data && data.data.payment_url) {
        // Redirect to external payment gateway
        toast({
          title: "Payment Initiated",
          description: "Redirecting to payment gateway...",
        })
        window.location.href = data.data.payment_url
      } else {
        // This block will be hit if data or data.data are missing,
        // or if payment_url is not present within data.data
        console.warn("Frontend: No payment_url found in response data. Full response:", data)
        toast({
          title: "Funding Initiated",
          description:
            "Wallet funding initiated, but no redirect URL was provided. Please check your wallet balance or try again.",
          variant: "default",
        })
        setAmount("")
        queryClient.invalidateQueries({ queryKey: ["walletBalance"] }) // Invalidate to refetch balance
      }
    },
    onError: (err: any) => {
      console.error("Frontend: startFundingMutation onError:", err) // Log the full error
      toast({
        title: "Error",
        description: err.message || "Failed to initiate funding.",
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
        description: validation.error.errors[0].message,
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
      await startFundingMutation.mutateAsync(fundAmount)
    } catch (err) {
      // Error handled by mutation's onError
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
                          className={`font-semibold ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}
                        >
                          {transaction.type === "credit" ? "+" : "-"}
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
