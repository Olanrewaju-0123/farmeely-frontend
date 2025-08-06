"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, ArrowRight, Trash2 } from "lucide-react"
import type { Group } from "@/lib/types"

interface DraftGroupsSectionProps {
  groups: Group[]
  onDeleteDraft?: (groupId: string) => void
  isLoading?: boolean
}

export default function DraftGroupsSection({ groups, onDeleteDraft, isLoading }: DraftGroupsSectionProps) {
  const router = useRouter()

  // Filter for pending/draft groups
  const draftGroups = groups.filter(group => group.status === "pending")

  const handleContinuePayment = (groupId: string) => {
    router.push(`/dashboard/groups/create/finalize/${groupId}`)
  }

  const handleDeleteDraft = (groupId: string) => {
    if (onDeleteDraft) {
      onDeleteDraft(groupId)
    }
  }

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Draft Groups
          </CardTitle>
          <CardDescription>Groups waiting for payment completion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading drafts...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (draftGroups.length === 0) {
    return null // Don't show the section if no drafts
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-500" />
          Draft Groups ({draftGroups.length})
        </CardTitle>
        <CardDescription>
          Complete payment for these groups to activate them
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {draftGroups.map((group) => {
            const initialContributionCost = group.slotPrice * (group.creatorInitialSlots || 1)
            
            return (
              <div
                key={group.group_id}
                className="flex items-center justify-between p-4 border rounded-lg bg-orange-50 border-orange-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{group.group_name}</h3>
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      Payment Pending
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {group.group_description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>
                      Your Slots: <span className="font-medium">{group.creatorInitialSlots || 1}</span>
                    </span>
                    <span>
                      Amount: <span className="font-medium">₦{initialContributionCost.toLocaleString()}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Created: {new Date(group.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {onDeleteDraft && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDraft(group.group_id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    onClick={() => handleContinuePayment(group.group_id)}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    Complete Payment
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}