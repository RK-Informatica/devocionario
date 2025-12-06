"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table2, KanbanSquare, Calendar, Plus, ChevronDown } from "lucide-react"
import type { DatabaseViewType } from "@/lib/types/database"

interface DatabaseViewSelectorProps {
  currentView: DatabaseViewType
  onViewChange: (view: DatabaseViewType) => void
}

const VIEW_OPTIONS: { type: DatabaseViewType; label: string; icon: React.ReactNode }[] = [
  { type: "table", label: "Table", icon: <Table2 className="h-4 w-4" /> },
  { type: "kanban", label: "Kanban", icon: <KanbanSquare className="h-4 w-4" /> },
  { type: "calendar", label: "Calendar", icon: <Calendar className="h-4 w-4" /> },
]

export function DatabaseViewSelector({ currentView, onViewChange }: DatabaseViewSelectorProps) {
  return (
    <div className="flex items-center gap-2 p-2 border-b">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            {VIEW_OPTIONS.find((v) => v.type === currentView)?.icon}
            {VIEW_OPTIONS.find((v) => v.type === currentView)?.label}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {VIEW_OPTIONS.map((option) => (
            <DropdownMenuItem key={option.type} onClick={() => onViewChange(option.type)}>
              {option.icon}
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-1" />

      <Button variant="ghost" size="sm">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
