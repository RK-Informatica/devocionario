"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Trash2, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Member {
  id: string
  user_id: string
  workspace_id: string
  role: "owner" | "editor" | "viewer"
  email?: string
}

interface MembersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  members: Member[]
  isOwner: boolean
  onMembersUpdate: (members: Member[]) => void
}

export function MembersDialog({
  open,
  onOpenChange,
  workspaceId,
  members,
  isOwner,
  onMembersUpdate,
}: MembersDialogProps) {
  const [newEmail, setNewEmail] = useState("")
  const [newRole, setNewRole] = useState<"editor" | "viewer">("editor")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleAddMember = async () => {
    if (!newEmail || !isOwner) return

    setIsLoading(true)
    try {
      // In a real app, you'd look up the user by email
      // For now, we'll create a placeholder
      const newMember: Member = {
        id: `member-${Date.now()}`,
        user_id: `user-${Date.now()}`,
        workspace_id: workspaceId,
        role: newRole,
        email: newEmail,
      }

      await supabase.from("workspace_members").insert({
        workspace_id: workspaceId,
        user_id: newMember.user_id,
        role: newRole,
      })

      onMembersUpdate([...members, newMember])
      setNewEmail("")
      setNewRole("editor")
    } catch (error) {
      console.error("Error adding member:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = async (member: Member) => {
    if (!isOwner || member.role === "owner") return

    try {
      await supabase.from("workspace_members").delete().eq("user_id", member.user_id).eq("workspace_id", workspaceId)

      onMembersUpdate(members.filter((m) => m.user_id !== member.user_id))
    } catch (error) {
      console.error("Error removing member:", error)
    }
  }

  const handleRoleChange = async (member: Member, newRole: string) => {
    if (!isOwner || member.role === "owner") return

    try {
      await supabase
        .from("workspace_members")
        .update({ role: newRole })
        .eq("user_id", member.user_id)
        .eq("workspace_id", workspaceId)

      onMembersUpdate(members.map((m) => (m.user_id === member.user_id ? { ...m, role: newRole as any } : m)))
    } catch (error) {
      console.error("Error updating member role:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Workspace Members</DialogTitle>
          <DialogDescription>Manage who has access to this workspace</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add member form */}
          {isOwner && (
            <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
              <label className="text-sm font-medium">Add member</label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="text-sm"
                />
                <Select value={newRole} onValueChange={(val) => setNewRole(val as any)}>
                  <SelectTrigger className="w-24 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddMember} disabled={!newEmail || isLoading} className="w-full" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          )}

          {/* Members list */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Current members</label>
            {members.map((member) => (
              <Card key={member.user_id} className="p-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{member.email || "Unknown user"}</p>
                  <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {member.role !== "owner" && isOwner && (
                    <>
                      <Select value={member.role} onValueChange={(val) => handleRoleChange(member, val)}>
                        <SelectTrigger className="w-20 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member)}
                        className="text-destructive h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
