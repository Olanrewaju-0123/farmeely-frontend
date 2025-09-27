"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Facebook, Linkedin, MessageCircle, Share2, Twitter, ImageIcon } from "lucide-react"
import { useState } from "react"

interface ShareGroupModalProps {
  isOpen: boolean
  onClose: () => void
  groupName: string
  groupId: string
}

export function ShareGroupModal({ isOpen, onClose, groupName, groupId }: ShareGroupModalProps) {
  const [copied, setCopied] = useState(false)

  // Ensure window.location.origin is used for the base URL
  const shareUrl = `${window.location.origin}/dashboard/groups/${groupId}`
  const shareText = `Check out this amazing livestock investment group: ${groupName}! Join now and earn returns. #Farmeely`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const socialShareLinks = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
    },
    {
      name: "X (Twitter)",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(groupName)}&summary=${encodeURIComponent(shareText)}`,
    },
    // Instagram usually requires direct app integration or image sharing, not a simple web share link.
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" /> Share Group
          </DialogTitle>
          <DialogDescription>Share "{groupName}" with your network.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="share-link">Shareable Link</Label>
            <div className="flex space-x-2">
              <Input id="share-link" readOnly value={shareUrl} className="flex-1" />
              <Button onClick={handleCopyLink} size="icon" className="shrink-0">
                <Copy className="h-4 w-4" />
                <span className="sr-only">{copied ? "Copied!" : "Copy Link"}</span>
              </Button>
            </div>
            {copied && <p className="text-sm text-green-600">Link copied!</p>}
          </div>
          <div className="space-y-2">
            <Label>Share on Social Media</Label>
            <div className="grid grid-cols-4 gap-3">
              {socialShareLinks.map((platform) => {
                const Icon = platform.icon
                return (
                  <Button
                    key={platform.name}
                    variant="outline"
                    size="icon"
                    asChild
                    className="h-14 w-14 flex flex-col items-center justify-center text-gray-700 hover:text-green-600 hover:border-green-600 bg-transparent"
                  >
                    <a href={platform.url} target="_blank" rel="noopener noreferrer">
                      <Icon className="h-6 w-6" />
                      <span className="text-xs mt-1">{platform.name}</span>
                    </a>
                  </Button>
                )
              })}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Other Options</Label>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <ImageIcon className="mr-2 h-4 w-4" />
              Generate Flyer (Coming Soon)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
