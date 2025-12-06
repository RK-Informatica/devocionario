"use client"

import { useState, useCallback, useRef } from "react"
import type { Block, BlockType } from "@/lib/types/blocks"

export function useBlocks(initialBlocks: Block[] = []) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks)
  const blockRefs = useRef<Map<string, HTMLElement>>(new Map())

  const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
    setBlocks((prevBlocks) => prevBlocks.map((block) => (block.id === id ? { ...block, ...updates } : block)))
  }, [])

  const addBlock = useCallback((afterBlockId: string, type: BlockType = "paragraph") => {
    setBlocks((prevBlocks) => {
      const index = prevBlocks.findIndex((b) => b.id === afterBlockId)
      if (index === -1) return prevBlocks

      const newBlock: Block = {
        id: `block-${Date.now()}`,
        pageId: prevBlocks[0]?.pageId || "page-1",
        type,
        content: "",
        position: index + 1,
      }

      const updatedBlocks = [
        ...prevBlocks.slice(0, index + 1),
        newBlock,
        ...prevBlocks.slice(index + 1).map((b, i) => ({
          ...b,
          position: b.position + 1,
        })),
      ]

      return updatedBlocks
    })
  }, [])

  const deleteBlock = useCallback((id: string) => {
    setBlocks((prevBlocks) => prevBlocks.filter((block) => block.id !== id).map((b, i) => ({ ...b, position: i })))
  }, [])

  const reorderBlocks = useCallback((fromIndex: number, toIndex: number) => {
    setBlocks((prevBlocks) => {
      const newBlocks = [...prevBlocks]
      const [removed] = newBlocks.splice(fromIndex, 1)
      newBlocks.splice(toIndex, 0, removed)
      return newBlocks.map((b, i) => ({ ...b, position: i }))
    })
  }, [])

  return {
    blocks,
    updateBlock,
    addBlock,
    deleteBlock,
    reorderBlocks,
    blockRefs,
  }
}
