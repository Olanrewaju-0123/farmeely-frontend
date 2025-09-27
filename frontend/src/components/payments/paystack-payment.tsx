"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import Paystack from "@paystack/inline-js";

interface PaystackPaymentProps {
  amount: number; // Amount in naira
  email?: string;
  reference?: string;
  onSuccess: (reference: any) => void;
  onClose: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  metadata?: Record<string, any>;
  className?: string;
}

export function PaystackPayment({
  amount,
  email,
  reference,
  onSuccess,
  onClose,
  disabled = false,
  children,
  metadata = {},
  className = "",
}: PaystackPaymentProps) {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

  const handlePayment = async () => {
    const userEmail = email || user?.email || "";

    if (!userEmail) {
      console.error("User email is required for payment");
      return;
    }

    if (!publicKey) {
      console.error("Paystack public key not found in environment variables");
      return;
    }

    setIsProcessing(true);

    try {
      const initResponse = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          amount: amount, // Amount in naira, will be converted to kobo on backend
          reference:
            reference ||
            `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          metadata: {
            userId: user?.id,
            userPhone: user?.phoneNumber,
            ...metadata,
          },
        }),
      });

      const initData = await initResponse.json();

      if (initData.status !== "success") {
        throw new Error(initData.message || "Failed to initialize payment");
      }
      const popup = new Paystack();

      //   const { PaystackPop } = await import("@paystack/inline-js")

      const popupPaystack = popup.newTransaction({
        key: publicKey,
        reference: initData.data.reference,
        amount: amount * 100, // Convert to kobo
        email: userEmail,
        onSuccess: async (transaction: any) => {
          console.log("Paystack payment successful:", transaction);

          try {
            const verifyResponse = await fetch("/api/paystack/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                reference: transaction.reference,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.status === "success") {
              setIsProcessing(false);
              onSuccess(transaction);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (verifyError) {
            console.error("Payment verification error:", verifyError);
            setIsProcessing(false);
            onClose();
          }
        },
        onCancel: () => {
          console.log("Paystack payment cancelled");
          setIsProcessing(false);
          onClose();
        },
        onError: (error: any) => {
          console.error("Paystack payment error:", error);
          setIsProcessing(false);
          onClose();
        },
      });
    } catch (error) {
      console.error("Payment initialization error:", error);
      setIsProcessing(false);
      onClose();
    }
  };

  if (!publicKey) {
    return (
      <Button disabled className={`${className} cursor-not-allowed`}>
        Pay with Card
      </Button>
    );
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isProcessing || !user?.email}
      className={`${className} ${
        !disabled && !isProcessing && user?.email
          ? "cursor-pointer"
          : "cursor-not-allowed"
      }`}
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        children || "Pay Now"
      )}
    </Button>
  );
}
