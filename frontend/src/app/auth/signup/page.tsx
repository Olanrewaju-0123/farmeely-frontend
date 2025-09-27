import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SignupForm } from "@/components/auth/signup-form"
import { ThemeToggle } from "@/components/theme-toggle"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-green-600">Farmeely</div>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Signup Form */}
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>Enter your information to create your Farmeely account.</CardDescription>
          </CardHeader>
          <CardContent>
            <SignupForm />
          </CardContent>
          <CardFooter className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="underline text-primary hover:text-primary/80">
              Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
