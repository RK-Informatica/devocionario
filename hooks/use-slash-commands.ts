"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import type { CommandMatch } from "@/lib/types/commands"

export function useSlashCommands() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [match, setMatch] = useState<CommandMatch | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  const getCaretCoordinates = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || !selection.rangeCount) return { top: 0, left: 0 }

    const range = selection.getRangeAt(0)
    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(editorRef.current || document.body)
    preCaretRange.setEnd(range.endContainer, range.endOffset)

    const rect = preCaretRange.getBoundingClientRect()
    return {
      top: rect.bottom,
      left: rect.left,
    }
  }, [])

  const detectSlashCommand = useCallback((text: string, position: number) => {
    const beforeCursor = text.slice(Math.max(0, position - 50), position)
    const slashIndex = beforeCursor.lastIndexOf("/")

    if (slashIndex === -1) {
      setIsOpen(false)
      setMatch(null)
      return
    }

    const isStartOfLine = slashIndex === 0 || /\s/.test(beforeCursor[slashIndex - 1])
    if (!isStartOfLine) {
      setIsOpen(false)
      setMatch(null)
      return
    }

    const commandText = beforeCursor.slice(slashIndex + 1)
    const absoluteStartIndex = position - beforeCursor.length + slashIndex

    setMatch({
      text: commandText,
      startIndex: absoluteStartIndex,
      endIndex: position,
    })
    setIsOpen(true)
    setSelectedIndex(0)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, commands: any[]) => {
      if (!isOpen) return

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % commands.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + commands.length) % commands.length)
      } else if (e.key === "Enter") {
        e.preventDefault()
        return commands[selectedIndex]
      } else if (e.key === "Escape") {
        setIsOpen(false)
      }
    },
    [isOpen, selectedIndex],
  )

  return {
    isOpen,
    setIsOpen,
    selectedIndex,
    setSelectedIndex,
    match,
    detectSlashCommand,
    handleKeyDown,
    getCaretCoordinates,
    editorRef,
  }
}
