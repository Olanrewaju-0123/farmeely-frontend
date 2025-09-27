"use client"

import { useAuth } from "@/lib/auth-context"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react"

const formSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits."),
})

interface VerifyEmailFormProps {
  email: string
}

export function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const { verifyEmail, resendOtp, isLoading } = useAuth()
  const [isResending, setIsResending] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    verifyEmail({ email, otp: values.otp })
  }

  const handleResendOtp = async () => {
    if (!email) {
      console.error("Email is required to resend OTP")
      return
    }
    
    setIsResending(true)
    try {
      await resendOtp(email)
    } catch (error) {
      console.error("Error resending OTP:", error)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OTP</FormLabel>
              <FormControl>
                <Input placeholder="Enter 6-digit OTP" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting || isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Email"
          )}
        </Button>
        <Button type="button" variant="link" className="w-full" onClick={handleResendOtp} disabled={isResending || isLoading || !email}>
          {isResending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resending...
            </>
          ) : (
            "Resend OTP"
          )}
        </Button>
      </form>
    </Form>
  )
}
