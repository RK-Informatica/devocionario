"use client"

import type { DatabaseProperty, DatabaseItem } from "@/lib/types/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2 } from "lucide-react"

interface TableViewProps {
  properties: DatabaseProperty[]
  items: DatabaseItem[]
  onAddItem: () => void
  onDeleteItem: (itemId: string) => void
  onUpdateItem: (itemId: string, data: Record<string, any>) => void
  onAddProperty: (property: DatabaseProperty) => void
}

export function TableView({ properties, items, onAddItem, onDeleteItem, onUpdateItem, onAddProperty }: TableViewProps) {
  return (
    <div className="overflow-x-auto border-t">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-muted/50">
            {properties.map((prop) => (
              <th key={prop.id} className="px-4 py-2 text-left text-sm font-medium">
                {prop.name}
              </th>
            ))}
            <th className="px-4 py-2 w-10" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b hover:bg-muted/30 transition-colors">
              {properties.map((prop) => (
                <td key={prop.id} className="px-4 py-2">
                  <Input
                    type={prop.type === "number" ? "number" : "text"}
                    value={item.data[prop.id] || ""}
                    onChange={(e) => onUpdateItem(item.id, { ...item.data, [prop.id]: e.target.value })}
                    placeholder={`Enter ${prop.name.toLowerCase()}`}
                    className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0"
                  />
                </td>
              ))}
              <td className="px-2 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteItem(item.id)}
                  className="text-destructive hover:text-destructive h-6 w-6 p-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="p-4 border-t">
        <Button onClick={onAddItem} variant="outline" className="gap-2 bg-transparent">
          <Plus className="h-4 w-4" />
          Add row
        </Button>
      </div>
    </div>
  )
}
