"use client"

import type React from "react"
import { useAuth } from "@/lib/auth-context"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <DashboardNav isCollapsed={isCollapsed} toggleCollapsed={() => setIsCollapsed(!isCollapsed)} />
      <main className={`flex-1 overflow-auto transition-all duration-300 ${isCollapsed ? "ml-[60px]" : "ml-[240px]"}`}>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  )
}
