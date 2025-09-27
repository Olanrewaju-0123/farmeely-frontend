"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PaystackPayment } from "@/components/payments/paystack-payment"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"

export function WalletFundingPaystack() {
  const [amount, setAmount] = useState<number>(0)
  const { toast } = useToast()
  const { token } = useAuth()
  const queryClient = useQueryClient()

  const completeFundingMutation = useMutation({
    mutationFn: async (payload: { amount: number; paymentReference: string }) => {
      return api.completeWalletFunding(payload.paymentReference, token as string)
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        toast({
          title: "Wallet Funded!",
          description: `Your wallet has been funded with ${formatCurrency(amount)}`,
        })
        queryClient.invalidateQueries({ queryKey: ["walletBalance"] })
        setAmount(0)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to complete wallet funding.",
          variant: "destructive",
        })
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete wallet funding.",
        variant: "destructive",
      })
    },
  })

  const handlePaystackSuccess = async (reference: any) => {
    console.log("Wallet funding payment successful:", reference)

    try {
      await completeFundingMutation.mutateAsync({
        amount: amount,
        paymentReference: reference.reference,
      })
    } catch (err) {
      console.error("[v0] Error completing wallet funding:", err)
    }
  }

  const handlePaystackClose = () => {
    console.log("Wallet funding payment cancelled")
    toast({
      title: "Payment Cancelled",
      description: "Wallet funding was cancelled.",
      variant: "destructive",
    })
  }

  const isValidAmount = amount > 0 && amount >= 100 // Minimum 100 naira

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fund Wallet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="amount">Amount (₦)</Label>
          <Input
            id="amount"
            type="number"
            min="100"
            step="1"
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Enter amount to fund"
          />
          {amount > 0 && <p className="text-sm text-muted-foreground mt-1">You will pay: {formatCurrency(amount)}</p>}
        </div>

        <PaystackPayment
          amount={amount}
          reference={`wallet_funding_${Date.now()}`}
          onSuccess={handlePaystackSuccess}
          onClose={handlePaystackClose}
          disabled={!isValidAmount || completeFundingMutation.isPending}
          metadata={{
            paymentType: "wallet_funding",
            fundingAmount: amount,
          }}
          className="w-full"
        >
          {completeFundingMutation.isPending ? "Processing..." : `Fund Wallet with ${formatCurrency(amount)}`}
        </PaystackPayment>
      </CardContent>
    </Card>
    )
}
