import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PageEditor } from "@/components/editor/page-editor"
import type { Block } from "@/lib/types/blocks"

export default async function EditorPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get or create default workspace and page
  const { data: workspace } = await supabase.from("workspaces").select("id").eq("owner_id", user.id).single()

  if (!workspace) {
    redirect("/auth/login")
  }

  const { data: page, error } = await supabase
    .from("pages")
    .select("*")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single()

  const pageId = page?.id || `page-${Date.now()}`
  const pageTitle = page?.title || "Untitled"

  // Get blocks for this page
  const { data: blocks = [] } = await supabase
    .from("blocks")
    .select("*")
    .eq("page_id", pageId)
    .order("position", { ascending: true })

  const typedBlocks: Block[] = (blocks || []).map((b) => ({
    id: b.id,
    pageId: b.page_id,
    type: b.type as any,
    content: b.content || "",
    position: b.position,
  }))

  return (
    <div className="min-h-screen bg-background">
      <PageEditor pageId={pageId} initialTitle={pageTitle} initialBlocks={typedBlocks} />
    </div>
  )
}
