"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Bold,
  Italic,
  Code2,
  Heading1,
  Heading2,
  Quote,
  List,
  ListOrdered,
  Trash2,
  ChevronDown,
  Copy,
} from "lucide-react"
import type { BlockType } from "@/lib/types/blocks"

interface BlockToolbarProps {
  blockType: BlockType
  onTypeChange: (type: BlockType) => void
  onDelete: () => void
  onDuplicate: () => void
  onBold: () => void
  onItalic: () => void
}

export function BlockToolbar({ blockType, onTypeChange, onDelete, onDuplicate, onBold, onItalic }: BlockToolbarProps) {
  const blockTypeLabels: Record<BlockType, string> = {
    paragraph: "Text",
    heading1: "Heading 1",
    heading2: "Heading 2",
    heading3: "Heading 3",
    bulletList: "Bullet List",
    numberedList: "Numbered List",
    quote: "Quote",
    code: "Code",
    divider: "Divider",
    image: "Image",
  }

  return (
    <div className="flex items-center gap-1 rounded-md bg-background border border-border p-1 shadow-sm">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1">
            {blockTypeLabels[blockType]}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => onTypeChange("paragraph")}>Text</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onTypeChange("heading1")}>
            <Heading1 className="mr-2 h-4 w-4" />
            Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onTypeChange("heading2")}>
            <Heading2 className="mr-2 h-4 w-4" />
            Heading 2
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onTypeChange("heading3")}>Heading 2</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onTypeChange("bulletList")}>
            <List className="mr-2 h-4 w-4" />
            Bullet List
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onTypeChange("numberedList")}>
            <ListOrdered className="mr-2 h-4 w-4" />
            Numbered List
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onTypeChange("quote")}>
            <Quote className="mr-2 h-4 w-4" />
            Quote
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onTypeChange("code")}>
            <Code2 className="mr-2 h-4 w-4" />
            Code
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="h-5 w-px bg-border" />

      <Button variant="ghost" size="sm" onClick={onBold} title="Bold">
        <Bold className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onItalic} title="Italic">
        <Italic className="h-4 w-4" />
      </Button>

      <div className="h-5 w-px bg-border ml-auto" />

      <Button variant="ghost" size="sm" onClick={onDuplicate} title="Duplicate">
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        title="Delete"
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
