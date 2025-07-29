import type React from "react"
import Link from "next/link" // Import Link for the logo

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      {/* Left Column: Form Area */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-white relative">
        {/* Logo */}
        <div className="absolute top-8 left-8">
          <Link href="/" className="text-2xl font-bold text-green-600">
            Farmeely
          </Link>
        </div>
        {/* Form Content */}
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Right Column: Promotional Area */}
      <div className="hidden lg:flex lg:w-1/2 bg-green-700 items-center justify-center p-8 text-white text-center">
        <div className="max-w-md space-y-4">
          <h2 className="text-4xl font-bold">Make a difference today</h2>
          <p className="text-lg opacity-90">
            Join thousands of investors and organizations making an impact through Farmeely.
          </p>
        </div>
      </div>
    </div>
  )
}
