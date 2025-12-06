"use client"

import type React from "react"

import { useEffect, useState } from "react"
import type { BlockType } from "@/lib/types/blocks"
import { Command as CommandUI } from "@/components/ui/command"
import { Popover, PopoverContent } from "@/components/ui/popover"
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Divide as Divider,
  ImageIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SlashCommandMenuProps {
  isOpen: boolean
  query: string
  selectedIndex: number
  position: { top: number; left: number }
  onSelectCommand: (command: Command) => void
}

interface Command {
  name: string
  description: string
  icon: React.ReactNode
  blockType: BlockType
}

const COMMANDS: Command[] = [
  {
    name: "Heading 1",
    description: "Large section heading",
    icon: <Heading1 className="h-4 w-4" />,
    blockType: "heading1",
  },
  {
    name: "Heading 2",
    description: "Medium section heading",
    icon: <Heading2 className="h-4 w-4" />,
    blockType: "heading2",
  },
  {
    name: "Heading 3",
    description: "Small section heading",
    icon: <Heading3 className="h-4 w-4" />,
    blockType: "heading3",
  },
  {
    name: "Bullet List",
    description: "Unordered list",
    icon: <List className="h-4 w-4" />,
    blockType: "bulletList",
  },
  {
    name: "Numbered List",
    description: "Ordered list",
    icon: <ListOrdered className="h-4 w-4" />,
    blockType: "numberedList",
  },
  {
    name: "Quote",
    description: "Quoted text",
    icon: <Quote className="h-4 w-4" />,
    blockType: "quote",
  },
  {
    name: "Code",
    description: "Code block",
    icon: <Code2 className="h-4 w-4" />,
    blockType: "code",
  },
  {
    name: "Divider",
    description: "Horizontal line",
    icon: <Divider className="h-4 w-4" />,
    blockType: "divider",
  },
  {
    name: "Image",
    description: "Image block",
    icon: <ImageIcon className="h-4 w-4" />,
    blockType: "image",
  },
]

export function SlashCommandMenu({ isOpen, query, selectedIndex, position, onSelectCommand }: SlashCommandMenuProps) {
  const [filteredCommands, setFilteredCommands] = useState(COMMANDS)

  useEffect(() => {
    const filtered = COMMANDS.filter((cmd) => cmd.name.toLowerCase().includes(query.toLowerCase()))
    setFilteredCommands(filtered)
  }, [query])

  return (
    <Popover open={isOpen}>
      <PopoverContent
        side="bottom"
        align="start"
        className="w-56 p-0"
        style={{
          position: "fixed",
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <CommandUI>
          <div className="space-y-1 p-2">
            {filteredCommands.length === 0 ? (
              <div className="text-sm text-muted-foreground px-2 py-1.5">No commands found</div>
            ) : (
              filteredCommands.map((cmd, index) => (
                <button
                  key={cmd.blockType}
                  onClick={() => onSelectCommand(cmd)}
                  className={cn(
                    "w-full text-left px-2 py-2 rounded flex items-center gap-2 transition-colors",
                    index === selectedIndex ? "bg-primary/10" : "hover:bg-muted",
                  )}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex-shrink-0 text-muted-foreground">{cmd.icon}</div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{cmd.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{cmd.description}</div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </CommandUI>
      </PopoverContent>
    </Popover>
  )
}
