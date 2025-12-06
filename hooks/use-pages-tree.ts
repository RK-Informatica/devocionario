"use client"

import { useMemo } from "react"
import type { PageNode } from "@/lib/types/navigation"

export interface PageRow {
  id: string
  title: string
  icon?: string
  parent_page_id?: string
  is_public: boolean
  created_at: string
}

export function usePagesTree(pagesData: PageRow[]) {
  return useMemo(() => {
    const pageMap = new Map<string, PageNode>()
    const roots: PageNode[] = []

    // Create nodes for all pages
    pagesData.forEach((page) => {
      pageMap.set(page.id, {
        id: page.id,
        title: page.title,
        icon: page.icon,
        parentPageId: page.parent_page_id,
        children: [],
        isPublic: page.is_public,
        createdAt: page.created_at,
      })
    })

    // Build tree structure
    pagesData.forEach((page) => {
      const node = pageMap.get(page.id)!
      if (page.parent_page_id) {
        const parent = pageMap.get(page.parent_page_id)
        if (parent) {
          parent.children.push(node)
        } else {
          roots.push(node)
        }
      } else {
        roots.push(node)
      }
    })

    // Sort children
    roots.sort((a, b) => a.title.localeCompare(b.title))
    roots.forEach((root) => {
      root.children.sort((a, b) => a.title.localeCompare(b.title))
    })

    return roots
  }, [pagesData])
}
