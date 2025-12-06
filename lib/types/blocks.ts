export type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulletList"
  | "numberedList"
  | "quote"
  | "code"
  | "divider"
  | "image"

export interface TextFormatting {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
}

export interface Block {
  id: string
  pageId: string
  type: BlockType
  content: string
  formatting?: TextFormatting[]
  position: number
  parentBlockId?: string
}

export interface PageWithBlocks {
  id: string
  title: string
  icon?: string
  blocks: Block[]
}
