import type React from "react"
import type { BlockType } from "./blocks"

export interface SlashCommand {
  name: string
  description: string
  shortcut?: string
  icon: React.ReactNode
  blockType: BlockType
}

export interface CommandMatch {
  text: string
  startIndex: number
  endIndex: number
}
