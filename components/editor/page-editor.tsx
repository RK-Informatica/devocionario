"use client"

import { useState } from "react"
import { useBlocks } from "@/hooks/use-blocks"
import { RichTextBlock } from "./rich-text-block"
import type { Block, BlockType } from "@/lib/types/blocks"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useEffect } from "react"

interface PageEditorProps {
  pageId: string
  initialTitle: string
  initialBlocks: Block[]
  onSave?: (title: string, blocks: Block[]) => Promise<void>
}

export function PageEditor({ pageId, initialTitle, initialBlocks, onSave }: PageEditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const { blocks, updateBlock, addBlock, deleteBlock } = useBlocks(initialBlocks)
  const supabase = createClient()

  useEffect(() => {
    const saveDebounce = setTimeout(async () => {
      try {
        await supabase.from("pages").update({ title }).eq("id", pageId)

        for (const block of blocks) {
          const { data: existingBlock } = await supabase.from("blocks").select("id").eq("id", block.id).single()

          if (existingBlock) {
            await supabase
              .from("blocks")
              .update({ content: block.content, type: block.type, position: block.position })
              .eq("id", block.id)
          } else {
            await supabase.from("blocks").insert({
              id: block.id,
              page_id: pageId,
              type: block.type,
              content: block.content,
              position: block.position,
            })
          }
        }
      } catch (error) {
        console.error("Error saving:", error)
      }
    }, 1000)

    return () => clearTimeout(saveDebounce)
  }, [title, blocks, pageId, supabase])

  const handleAddBlock = (afterBlockId: string, type: BlockType = "paragraph") => {
    addBlock(afterBlockId, type)
  }

  const handleDuplicate = (blockId: string) => {
    const blockIndex = blocks.findIndex((b) => b.id === blockId)
    if (blockIndex === -1) return

    const blockToDuplicate = blocks[blockIndex]
    addBlock(blockId)
    const newBlocks = [...blocks]
    const newBlock = newBlocks[blockIndex + 1]
    Object.assign(newBlock, blockToDuplicate)
    newBlock.id = `block-${Date.now()}`
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Untitled"
        className="mb-8 text-3xl font-bold border-0 p-0 shadow-none focus-visible:ring-0"
      />

      <div className="space-y-1">
        {blocks.map((block) => (
          <RichTextBlock
            key={block.id}
            block={block}
            isSelected={selectedBlockId === block.id}
            onSelect={() => setSelectedBlockId(block.id)}
            onUpdate={(updates) => updateBlock(block.id, updates)}
            onAddBlock={(type) => handleAddBlock(block.id, type)}
            onDelete={() => deleteBlock(block.id)}
            onDuplicate={() => handleDuplicate(block.id)}
          />
        ))}
      </div>

      {blocks.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Start typing or press / for commands</p>
        </div>
      )}
    </div>
  )
}
