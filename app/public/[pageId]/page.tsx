import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import type { Block } from "@/lib/types/blocks"

function renderBlock(block: Block) {
  const blockClasses = {
    paragraph: "text-base leading-relaxed",
    heading1: "text-3xl font-bold leading-tight mt-6 mb-4",
    heading2: "text-2xl font-bold leading-tight mt-5 mb-3",
    heading3: "text-xl font-bold leading-tight mt-4 mb-2",
    bulletList: "list-disc list-inside",
    numberedList: "list-decimal list-inside",
    quote: "border-l-4 border-primary pl-4 italic text-muted-foreground my-4",
    code: "font-mono bg-muted p-3 rounded text-sm overflow-x-auto my-2",
    divider: "border-t border-border my-6",
    image: "rounded-lg border border-border my-4",
  }

  return (
    <div key={block.id} className={blockClasses[block.type]}>
      {block.content}
    </div>
  )
}

export default async function PublicPagePage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params
  const supabase = await createClient()

  // Fetch public page
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("*")
    .eq("id", pageId)
    .eq("is_public", true)
    .single()

  if (pageError || !page) {
    notFound()
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
    <main className="min-h-screen bg-background">
      <article className="w-full max-w-3xl mx-auto py-12 px-4">
        {/* Page title */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-2">{page.title}</h1>
          {page.icon && <span className="text-2xl">{page.icon}</span>}
          <p className="text-sm text-muted-foreground">Published on {new Date(page.created_at).toLocaleDateString()}</p>
        </header>

        {/* Content */}
        <div className="prose prose-sm max-w-none space-y-2">
          {typedBlocks.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">This page is empty</Card>
          ) : (
            typedBlocks.map((block) => renderBlock(block))
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t text-sm text-muted-foreground">
          <p>Created with NotionClone</p>
        </footer>
      </article>
    </main>
  )
}
