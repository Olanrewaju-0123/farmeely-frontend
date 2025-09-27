import Image from "next/image"
import Link from "next/link"
import LoginForm from "@/components/auth/login-form" // Corrected import to default
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login to your Farmeely account",
  description: "Login to your Farmeely account",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Header */}
      {/* <header className="flex h-16 items-center justify-between border-b bg-white px-4 dark:border-gray-800 dark:bg-gray-950 lg:px-6">
        <Link className="flex items-center gap-2 font-semibold" href="/">
          <span className="text-lg font-bold text-[#228B22]">Farmeely</span>
        </Link>
        <div className="flex items-center gap-4">
          <Image
            alt="Placeholder Image"
            className="rounded-full"
            height="24"
            src="/placeholder.svg?height=24&width=24"
            style={{
              aspectRatio: "24/24",
              objectFit: "cover",
            }}
            width="24"
          />
        </div>
      </header> */}

      {/* Main content area - two columns */}
      <main className="flex flex-1">
        {/* Left column: Login Form */}
        <div className="flex flex-1 items-center justify-center bg-white p-8 text-black">
          <Card className="mx-auto w-full max-w-sm border-none shadow-none bg-white text-black">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Login to your account</CardTitle>
              <CardDescription>Enter your email and password to access your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
            {/* "Don't have an account? Sign up" link */}
            <div className="text-center text-sm mt-4">
              <span className="text-muted-foreground">Don&apos;t have an account? </span>
              <Link href="/auth/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </Card>
        </div>

        {/* Right column: Hero Section */}
        {/* <div className="hidden flex-1 items-center justify-center bg-[#228B22] p-8 text-center text-white lg:flex">
          <div className="max-w-md space-y-4">
            <h2 className="text-4xl font-bold">Make a difference today</h2>
            <p className="text-lg">Join thousands of investors and organizations making an impact through Farmeely.</p>
          </div>
        </div> */}
      </main>
    </div>
  )
}