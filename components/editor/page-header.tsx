"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Share2, Lock, Globe, Copy, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface PageHeaderProps {
  pageId: string
  pageTitle: string
  isPublic: boolean
  onTitleChange: (title: string) => void
  onPublishChange: (isPublic: boolean) => void
}

export function PageHeader({ pageId, pageTitle, isPublic, onTitleChange, onPublishChange }: PageHeaderProps) {
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = createClient()

  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/public/${pageId}`

  const handlePublish = async () => {
    setIsUpdating(true)
    try {
      const newPublicState = !isPublic
      await supabase.from("pages").update({ is_public: newPublicState }).eq("id", pageId)
      onPublishChange(newPublicState)
    } catch (error) {
      console.error("Error updating publish status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex-1">
          <Input
            value={pageTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Untitled"
            className="text-lg font-bold border-0 p-0 shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShareDialog(true)}
            className="gap-2"
            disabled={!isPublic}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>

          <Button
            variant={isPublic ? "default" : "outline"}
            size="sm"
            onClick={handlePublish}
            disabled={isUpdating}
            className="gap-2"
          >
            {isPublic ? (
              <>
                <Globe className="h-4 w-4" />
                Published
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Private
              </>
            )}
          </Button>
        </div>
      </div>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Page</DialogTitle>
            <DialogDescription>This page is publicly accessible. Share the link below.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input value={publicUrl} readOnly className="flex-1" />
              <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-2 bg-transparent">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              Anyone with this link can view this page. To restrict access, toggle the "Private" button above.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
