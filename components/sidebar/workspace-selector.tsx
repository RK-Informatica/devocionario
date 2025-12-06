"use client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Plus, ChevronDown } from "lucide-react"
import type { Workspace } from "@/lib/types/navigation"

interface WorkspaceSelectorProps {
  currentWorkspace: Workspace
  workspaces: Workspace[]
  onSelectWorkspace: (workspace: Workspace) => void
  onCreateWorkspace: () => void
}

export function WorkspaceSelector({
  currentWorkspace,
  workspaces,
  onSelectWorkspace,
  onCreateWorkspace,
}: WorkspaceSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-between px-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg">{currentWorkspace.icon || "📋"}</span>
            <span className="truncate text-sm font-medium">{currentWorkspace.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {workspaces.map((workspace) => (
          <DropdownMenuItem key={workspace.id} onClick={() => onSelectWorkspace(workspace)}>
            <span className="text-lg mr-2">{workspace.icon || "📋"}</span>
            {workspace.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onCreateWorkspace}>
          <Plus className="h-4 w-4 mr-2" />
          New Workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
