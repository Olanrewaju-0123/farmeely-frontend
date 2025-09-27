"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { DollarSign, Users, PiggyBank, Badge } from "lucide-react"
import type { Group } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface GroupCardProps {
  group: Group
 onJoin?: (group: Group) => void
  onJoinClick?: (group: Group) => void
  showJoinButton: boolean
  children?: React.ReactNode // For share button or other actions
  isCreator?: boolean
  isPending?: boolean
}

export function   GroupCard({ group, onJoin, onJoinClick, showJoinButton = true, children, isCreator = false, isPending= false }: GroupCardProps) {
  // const progress = group.totalSlot > 0 ? ((group.totalSlot - group.totalSlotLeft) / group.totalSlot) * 100 : 0
  const progress = group.progress ||0
  const isCompleted = group.status === "completed"
  const isActive = group.status === "active"

  const handleJoinClick = () => {
    if(onJoin) {
      onJoin(group)
    } else if (onJoinClick) {
      onJoinClick(group)
    }
  }

  // return (
  //   <Card className="flex flex-col">
  //     <CardHeader>
  //       <div className="flex items-center justify-between">
  //         <CardTitle className="text-lg">{group.group_name}</CardTitle>
  //         <span
  //           className={`rounded-full px-3 py-1 text-xs font-medium ${
  //             group.status === "active"
  //               ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
  //               : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
  //           }`}
  //         >
  //           {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
  //         </span>
  //       </div>
  //       <CardDescription>{group.description}</CardDescription>
  //     </CardHeader>
  //     <CardContent className="flex-grow">
  //       {group.livestock?.imageUrl && (
  //         <Image
  //           src={group.livestock.imageUrl || "/placeholder.svg"}
  //           alt={group.livestock.name}
  //           width={400}
  //           height={200}
  //           className="mb-4 h-40 w-full rounded-md object-cover"
  //         />
  //       )}
  //       <div className="grid grid-cols-2 gap-4 text-sm">
  //         <div className="flex items-center">
  //           <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
  //           <span>Price per Slot: {formatCurrency(group.slotPrice)}</span>
  //         </div>
  //         <div className="flex items-center">
  //           <Users className="mr-1 h-4 w-4 text-muted-foreground" />
  //           <span>Total Slots: {group.totalSlot}</span>
  //         </div>
  //         <div className="flex items-center">
  //           <PiggyBank className="mr-1 h-4 w-4 text-muted-foreground" />
  //           <span>Slots Left: {group.totalSlotLeft}</span>
  //         </div>
  //         <div className="flex items-center">
  //           <span>Total Value: {formatCurrency(group.livestock?.price || 0)}</span>
  //         </div>
  //       </div>
  //       <div className="mt-4 space-y-2">
  //         <div className="flex justify-between text-sm">
  //           <span>Progress</span>
  //           <span>{progress.toFixed(0)}%</span>
  //         </div>
  //         <Progress value={progress} className="h-2" />
  //       </div>
  //     </CardContent>
  //     <CardFooter className="flex justify-between gap-2">
  //       <Link href={`/dashboard/groups/${group.group_id}`} className="flex-1">
  //         <Button variant="outline" className="w-full bg-transparent">
  //           View Details
  //         </Button>
  //       </Link>
  //       {showJoinButton && group.totalSlotLeft > 0 && group.status === "active" && (
  //         <Button onClick={() => onJoinClick(group)} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
  //           Join Group
  //         </Button>
  //       )}
  //       {children}
  //     </CardFooter>
  //   </Card>
  // )

   return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{group.groupName || group.group_name}</CardTitle>
            <CardDescription className="mt-1">{group.description}</CardDescription>
          </div>
          <Badge fontVariant={isCompleted ? "default" : isActive ? "secondary" : "outline"}>{group.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Livestock</p>
            <p className="font-medium">{group.livestock?.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Price per Slot</p>
            <p className="font-medium">{formatCurrency(group.slotPrice)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Slots Taken</p>
            <p className="font-medium">
              {group.slotTaken} / {group.totalSlot}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Slots Left</p>
            <p className="font-medium">{group.totalSlotLeft}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {showJoinButton && isActive && group.totalSlotLeft > 0 && !isCreator && (
          <Button onClick={handleJoinClick} className="w-full bg-green-600 hover:bg-green-700">
            Join Group
          </Button>
        )}

        {isPending && isCreator && (
          <Link href={`/dashboard/groups/create/finalize/${group.group_id}`}>
            <Button className="w-full bg-orange-600 hover:bg-orange-700">Complete Payment</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
