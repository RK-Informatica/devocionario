"use client"
import Link from "next/link"
import { ChevronRight, FileText, Plus, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PageNode } from "@/lib/types/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface PageTreeItemProps {
  page: PageNode
  level: number
  isActive: boolean
  isExpanded: boolean
  onToggleExpand: (pageId: string) => void
  onNewPage: (parentPageId: string) => void
  onDeletePage: (pageId: string) => void
}

export function PageTreeItem({
  page,
  level,
  isActive,
  isExpanded,
  onToggleExpand,
  onNewPage,
  onDeletePage,
}: PageTreeItemProps) {
  const hasChildren = page.children.length > 0
  const paddingLeft = level * 12

  return (
    <div>
      <div className={cn("group flex items-center gap-1 pr-2", isActive && "bg-primary/10 rounded-md")}>
        {/* Expand/collapse toggle */}
        <button
          onClick={() => onToggleExpand(page.id)}
          className={cn("p-1 hover:bg-muted rounded transition-colors", !hasChildren && "opacity-0 cursor-default")}
        >
          <ChevronRight className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-90")} />
        </button>

        {/* Page link */}
        <Link
          href={`/editor/${page.id}`}
          className={cn(
            "flex-1 flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors",
            isActive && "bg-muted font-medium",
          )}
        >
          <span className="text-base">{page.icon || <FileText className="h-4 w-4" />}</span>
          <span className="truncate">{page.title}</span>
        </Link>

        {/* Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNewPage(page.id)}
            title="Add subpage"
            className="h-6 w-6 p-0"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onNewPage(page.id)}>Add subpage</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDeletePage(page.id)} className="text-destructive">
                Delete page
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div style={{ paddingLeft }}>
          {page.children.map((child) => (
            <PageTreeItem
              key={child.id}
              page={child}
              level={level + 1}
              isActive={false}
              isExpanded={false}
              onToggleExpand={onToggleExpand}
              onNewPage={onNewPage}
              onDeletePage={onDeletePage}
            />
          ))}
        </div>
      )}
    </div>
  )
}
