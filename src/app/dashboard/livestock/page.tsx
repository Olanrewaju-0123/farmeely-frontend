"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import type { Livestock } from "@/lib/types"
import { formatCurrency } from "@/lib/utils" // Declare the formatCurrency variable

export default function LivestockPage() {
  const { token, isLoading: isAuthLoading } = useAuth()
  const { toast } = useToast()
  const [livestock, setLivestock] = useState<Livestock[]>([])
  const [isLoadingLivestock, setIsLoadingLivestock] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchLivestock = useCallback(async () => {
    if (!token) {
      setIsLoadingLivestock(false)
      return
    }

    setIsLoadingLivestock(true)
    try {
      const response = await api.getLivestock(token)
      if (response.status === "success" && response.data) {
        setLivestock(response.data)
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch livestock.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Network error fetching livestock.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingLivestock(false)
    }
  }, [token, toast])

  useEffect(() => {
    if (!isAuthLoading) {
      fetchLivestock()
    }
  }, [isAuthLoading, fetchLivestock])

  const filteredLivestock = livestock.filter(
    (item) =>
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (isAuthLoading || isLoadingLivestock) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="relative mt-4">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="grid gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Livestock</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your livestock inventory.</p>
        </div>
        <Link href="/dashboard/livestock/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Livestock
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
        <Input
          type="search"
          placeholder="Search livestock..."
          className="w-full rounded-lg bg-background pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredLivestock.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">No livestock found.</p>
        ) : (
          filteredLivestock.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>
                  {item.type} - {item.breed}
                </CardTitle>
                <CardContent className="p-0 pt-4">
                  <p className="text-sm text-gray-500">Age: {item.age} years</p>
                  <p className="text-sm text-gray-500">Weight: {item.weight} kg</p>
                  <p className="text-sm text-gray-500">Health: {item.health_status}</p>
                  <p className="text-sm text-gray-500">Location: {item.location}</p>
                  <p className="text-lg font-bold mt-2">Price: {formatCurrency(item.price)}</p>
                </CardContent>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
