"use client"

import type { DatabaseProperty, DatabaseItem } from "@/lib/types/database"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"

interface KanbanViewProps {
  properties: DatabaseProperty[]
  items: DatabaseItem[]
  statusProperty: DatabaseProperty | undefined
  onAddItem: (status: string) => void
  onDeleteItem: (itemId: string) => void
  onUpdateItem: (itemId: string, data: Record<string, any>) => void
}

export function KanbanView({
  properties,
  items,
  statusProperty,
  onAddItem,
  onDeleteItem,
  onUpdateItem,
}: KanbanViewProps) {
  const selectProperty = properties.find((p) => p.type === "select")
  const options = selectProperty?.config?.options || ["Todo", "In Progress", "Done"]

  const itemsByStatus = options.reduce(
    (acc, status) => {
      acc[status] = items.filter((item) => item.data[selectProperty?.id || ""] === status)
      return acc
    },
    {} as Record<string, DatabaseItem[]>,
  )

  return (
    <div className="overflow-x-auto p-4 space-y-4">
      <div className="flex gap-4 min-w-max">
        {options.map((status) => (
          <div key={status} className="w-80 flex-shrink-0 bg-muted/30 rounded-lg p-3">
            <h3 className="font-medium text-sm mb-3">{status}</h3>

            <div className="space-y-2 min-h-[500px]">
              {itemsByStatus[status]?.map((item) => (
                <Card key={item.id} className="p-3 cursor-grab">
                  <div className="flex items-start justify-between gap-2">
                    <Input
                      type="text"
                      value={item.data.title || ""}
                      onChange={(e) => onUpdateItem(item.id, { ...item.data, title: e.target.value })}
                      placeholder="Card title"
                      className="border-0 p-0 h-auto bg-transparent text-sm font-medium focus-visible:ring-0"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteItem(item.id)}
                      className="text-destructive h-5 w-5 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <Button onClick={() => onAddItem(status)} variant="ghost" className="w-full gap-2 mt-2">
              <Plus className="h-4 w-4" />
              Add card
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
