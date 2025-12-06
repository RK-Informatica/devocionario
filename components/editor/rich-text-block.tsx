"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import type { Block, BlockType } from "@/lib/types/blocks"
import { BlockToolbar } from "./block-toolbar"
import { SlashCommandMenu } from "./slash-command-menu"
import { DatabaseBlock } from "./database-block/database-block"
import { Plus, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface RichTextBlockProps {
  block: Block
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<Block>) => void
  onAddBlock: (type?: BlockType) => void
  onDelete: () => void
  onDuplicate: () => void
  isDragging?: boolean
}

export function RichTextBlock({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onAddBlock,
  onDelete,
  onDuplicate,
  isDragging,
}: RichTextBlockProps) {
  const [showToolbar, setShowToolbar] = useState(false)
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashQuery, setSlashQuery] = useState("")
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const contentRef = useRef<HTMLDivElement>(null)
  const [content, setContent] = useState(block.content)

  useEffect(() => {
    setContent(block.content)
  }, [block.content])

  const getCaretPosition = () => {
    const selection = window.getSelection()
    if (!selection || !selection.rangeCount || !contentRef.current) return 0

    const range = selection.getRangeAt(0)
    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(contentRef.current)
    preCaretRange.setEnd(range.endContainer, range.endOffset)
    return preCaretRange.toString().length
  }

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.innerText
    setContent(text)
    onUpdate({ content: text })

    const caretPos = getCaretPosition()
    const beforeCursor = text.slice(Math.max(0, caretPos - 50), caretPos)
    const slashIndex = beforeCursor.lastIndexOf("/")

    if (slashIndex !== -1 && (slashIndex === 0 || /\s/.test(beforeCursor[slashIndex - 1]))) {
      const query = beforeCursor.slice(slashIndex + 1)
      setSlashQuery(query)
      setShowSlashMenu(true)
      setSelectedCommandIndex(0)

      const selection = window.getSelection()
      if (selection && selection.rangeCount) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        setMenuPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
        })
      }
    } else {
      setShowSlashMenu(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (showSlashMenu) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedCommandIndex((prev) => (prev + 1) % 8)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedCommandIndex((prev) => (prev - 1 + 8) % 8)
      } else if (e.key === "Escape") {
        setShowSlashMenu(false)
      }
      return
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onAddBlock("paragraph")
    }

    if (e.key === "Backspace" && content === "" && block.type === "paragraph") {
      e.preventDefault()
      onDelete()
    }
  }

  const blockClasses = {
    paragraph: "text-base leading-relaxed",
    heading1: "text-3xl font-bold leading-tight",
    heading2: "text-2xl font-bold leading-tight",
    heading3: "text-xl font-bold leading-tight",
    bulletList: "list-disc list-inside",
    numberedList: "list-decimal list-inside",
    quote: "border-l-4 border-primary pl-4 italic text-muted-foreground",
    code: "font-mono bg-muted p-2 rounded text-sm",
    divider: "border-t border-border my-4",
    image: "rounded-lg border border-border",
  }

  if (block.type === "database") {
    return (
      <div className={cn("group relative py-1", isSelected && "ring-2 ring-primary rounded-lg")}>
        <div className="flex items-start gap-2">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity pt-1">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
          </div>
          <div className="flex-1">
            <DatabaseBlock blockId={block.id} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn("group relative py-1 transition-colors", isSelected && "bg-primary/5 rounded-md")}
      onClick={onSelect}
    >
      <div className="flex items-start gap-2">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity pt-1">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
        </div>

        <div className="flex-1">
          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              onSelect()
              setShowToolbar(true)
            }}
            onBlur={() => setShowToolbar(false)}
            className={cn(
              "outline-none min-h-[1.5em] max-w-full break-words",
              blockClasses[block.type],
              block.type === "divider" && "pointer-events-none",
            )}
            placeholder={block.type === "paragraph" ? "Type / for commands" : undefined}
          >
            {block.content}
          </div>

          {showToolbar && isSelected && (
            <div className="mt-2">
              <BlockToolbar
                blockType={block.type}
                onTypeChange={(newType) => onUpdate({ type: newType })}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onBold={() => {}}
                onItalic={() => {}}
              />
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddBlock("paragraph")}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <SlashCommandMenu
        isOpen={showSlashMenu}
        query={slashQuery}
        selectedIndex={selectedCommandIndex}
        position={menuPosition}
        onSelectCommand={(cmd) => {
          setShowSlashMenu(false)
          setContent(content.replace(/\/\S*$/, ""))
          onUpdate({ type: cmd.blockType, content: "" })
          onAddBlock(cmd.blockType)
        }}
      />
    </div>
  )
}
