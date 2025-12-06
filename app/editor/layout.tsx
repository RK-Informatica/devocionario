"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import type { Workspace } from "@/lib/types/navigation"
import type { PageRow } from "@/hooks/use-pages-tree"

interface Member {
  id: string
  user_id: string
  workspace_id: string
  role: "owner" | "editor" | "viewer"
  email?: string
}

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [pages, setPages] = useState<PageRow[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [isWorkspaceOwner, setIsWorkspaceOwner] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const currentPageId = pathname.split("/").pop()

  useEffect(() => {
    const loadData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        // Load workspaces
        const { data: workspacesData } = await supabase
          .from("workspaces")
          .select("id, name, icon, owner_id")
          .or(`owner_id.eq.${user.id}`)

        if (!workspacesData || workspacesData.length === 0) {
          router.push("/auth/login")
          return
        }

        setWorkspaces(workspacesData)

        // Set current workspace
        const savedWorkspaceId = localStorage.getItem("currentWorkspaceId")
        const currentWs = workspacesData.find((w) => w.id === savedWorkspaceId) || workspacesData[0]
        setWorkspace(currentWs)
        setIsWorkspaceOwner(currentWs.owner_id === user.id)

        // Load pages for current workspace
        const { data: pagesData } = await supabase
          .from("pages")
          .select("id, title, icon, parent_page_id, is_public, created_at")
          .eq("workspace_id", currentWs.id)
          .order("created_at", { ascending: true })

        setPages(pagesData || [])

        // Load members for current workspace
        const { data: membersData } = await supabase
          .from("workspace_members")
          .select("id, user_id, workspace_id, role")
          .eq("workspace_id", currentWs.id)

        setMembers(
          membersData?.map((m) => ({
            ...m,
            email: undefined,
          })) || [],
        )
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSelectWorkspace = (ws: Workspace) => {
    setWorkspace(ws)
    setIsWorkspaceOwner(ws.owner_id === (localStorage.getItem("userId") || ""))
    localStorage.setItem("currentWorkspaceId", ws.id)
    router.push("/editor")
  }

  const handleCreateWorkspace = async () => {
    const name = prompt("Workspace name:")
    if (!name) return

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: newWorkspace } = await supabase
      .from("workspaces")
      .insert([{ name, owner_id: user.id }])
      .select()
      .single()

    if (newWorkspace) {
      setWorkspaces([...workspaces, newWorkspace])
      handleSelectWorkspace(newWorkspace)
    }
  }

  const handleCreatePage = async (parentPageId?: string) => {
    if (!workspace) return

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: newPage } = await supabase
      .from("pages")
      .insert([
        {
          workspace_id: workspace.id,
          parent_page_id: parentPageId,
          created_by: user.id,
          title: "Untitled",
        },
      ])
      .select()
      .single()

    if (newPage) {
      setPages([...pages, newPage])
      router.push(`/editor/${newPage.id}`)
    }
  }

  const handleDeletePage = async (pageId: string) => {
    if (!confirm("Delete this page?")) return

    await supabase.from("pages").delete().eq("id", pageId)
    setPages(pages.filter((p) => p.id !== pageId))
  }

  const handleMembersUpdate = (updatedMembers: Member[]) => {
    setMembers(updatedMembers)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (isLoading || !workspace) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar
          workspace={workspace}
          workspaces={workspaces}
          pages={pages}
          members={members}
          currentPageId={currentPageId}
          isWorkspaceOwner={isWorkspaceOwner}
          onSelectWorkspace={handleSelectWorkspace}
          onCreateWorkspace={handleCreateWorkspace}
          onCreatePage={handleCreatePage}
          onDeletePage={handleDeletePage}
          onMembersUpdate={handleMembersUpdate}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </SidebarProvider>
  )
}
