import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PageEditor } from "@/components/editor/page-editor"
import { PageHeader } from "@/components/editor/page-header"
import type { Block } from "@/lib/types/blocks"

export default async function PageEditorPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch page
  const { data: page, error: pageError } = await supabase.from("pages").select("*").eq("id", pageId).single()

  if (pageError || !page) {
    redirect("/editor")
  }

  // Check access
  const { data: workspace } = await supabase.from("workspaces").select("owner_id").eq("id", page.workspace_id).single()

  if (workspace?.owner_id !== user.id && page.created_by !== user.id) {
    redirect("/editor")
  }

  // Fetch blocks
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
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader
        pageId={pageId}
        pageTitle={page.title}
        isPublic={page.is_public}
        onTitleChange={(title) => {}}
        onPublishChange={(isPublic) => {}}
      />
      <div className="flex-1 overflow-auto">
        <PageEditor pageId={pageId} initialTitle={page.title} initialBlocks={typedBlocks} />
      </div>
    </div>
  )
}
