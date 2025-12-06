"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Plus, LogOut, Settings, Users } from "lucide-react"
import { WorkspaceSelector } from "./workspace-selector"
import { PageTreeItem } from "./page-tree-item"
import { MembersDialog } from "@/components/workspace/members-dialog"
import { usePagesTree } from "@/hooks/use-pages-tree"
import type { Workspace, ExpandedPagesState, PageNode } from "@/lib/types/navigation"
import type { PageRow } from "@/hooks/use-pages-tree"

interface Member {
  id: string
  user_id: string
  workspace_id: string
  role: "owner" | "editor" | "viewer"
  email?: string
}

interface AppSidebarProps {
  workspace: Workspace
  workspaces: Workspace[]
  pages: PageRow[]
  members: Member[]
  currentPageId?: string
  isWorkspaceOwner: boolean
  onSelectWorkspace: (workspace: Workspace) => void
  onCreateWorkspace: () => void
  onCreatePage: (parentPageId?: string) => void
  onDeletePage: (pageId: string) => void
  onMembersUpdate: (members: Member[]) => void
  onLogout: () => void
}

export function AppSidebar({
  workspace,
  workspaces,
  pages,
  members,
  currentPageId,
  isWorkspaceOwner,
  onSelectWorkspace,
  onCreateWorkspace,
  onCreatePage,
  onDeletePage,
  onMembersUpdate,
  onLogout,
}: AppSidebarProps) {
  const [expandedPages, setExpandedPages] = useState<ExpandedPagesState>({})
  const [showMembersDialog, setShowMembersDialog] = useState(false)
  const pagesTree = usePagesTree(pages)

  const toggleExpand = useCallback((pageId: string) => {
    setExpandedPages((prev) => ({
      ...prev,
      [pageId]: !prev[pageId],
    }))
  }, [])

  const renderPageTree = (pages: PageNode[], level = 0): React.ReactNode => {
    return pages.map((page) => (
      <PageTreeItem
        key={page.id}
        page={page}
        level={level}
        isActive={page.id === currentPageId}
        isExpanded={expandedPages[page.id] || false}
        onToggleExpand={toggleExpand}
        onNewPage={() => onCreatePage(page.id)}
        onDeletePage={onDeletePage}
      />
    ))
  }

  return (
    <>
      <Sidebar className="border-r">
        <SidebarHeader className="border-b px-0">
          <WorkspaceSelector
            currentWorkspace={workspace}
            workspaces={workspaces}
            onSelectWorkspace={onSelectWorkspace}
            onCreateWorkspace={onCreateWorkspace}
          />
        </SidebarHeader>

        <SidebarContent className="flex flex-col">
          <div className="px-2 py-4">
            <Button onClick={() => onCreatePage()} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              New Page
            </Button>
          </div>

          <SidebarMenu className="px-2 flex-1">
            <div className="space-y-0.5">{renderPageTree(pagesTree)}</div>
          </SidebarMenu>

          <div className="border-t p-2 space-y-1 mt-auto">
            {isWorkspaceOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMembersDialog(true)}
                className="w-full justify-start gap-2 text-muted-foreground"
              >
                <Users className="h-4 w-4" />
                Members ({members.length})
              </Button>
            )}
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="w-full justify-start gap-2 text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </SidebarContent>
      </Sidebar>

      <MembersDialog
        open={showMembersDialog}
        onOpenChange={setShowMembersDialog}
        workspaceId={workspace.id}
        members={members}
        isOwner={isWorkspaceOwner}
        onMembersUpdate={onMembersUpdate}
      />
    </>
  )
}
