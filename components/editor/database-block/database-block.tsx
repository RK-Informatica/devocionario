"use client"

import { useState, useEffect } from "react"
import type { DatabaseViewType, DatabaseProperty, DatabaseItem } from "@/lib/types/database"
import { DatabaseViewSelector } from "./database-view-selector"
import { TableView } from "./table-view"
import { KanbanView } from "./kanban-view"
import { CalendarView } from "./calendar-view"

interface DatabaseBlockProps {
  blockId: string
  initialProperties?: DatabaseProperty[]
  initialItems?: DatabaseItem[]
}

export function DatabaseBlock({ blockId, initialProperties = [], initialItems = [] }: DatabaseBlockProps) {
  const [currentView, setCurrentView] = useState<DatabaseViewType>("table")
  const [properties, setProperties] = useState<DatabaseProperty[]>(initialProperties)
  const [items, setItems] = useState<DatabaseItem[]>(initialItems)

  // Initialize with default properties if empty
  useEffect(() => {
    if (properties.length === 0) {
      setProperties([
        { id: "title", name: "Title", type: "text" },
        { id: "status", name: "Status", type: "select", config: { options: ["Todo", "In Progress", "Done"] } },
        { id: "date", name: "Date", type: "date" },
      ])
    }
  }, [])

  const handleAddItem = (status?: string) => {
    const newItem: DatabaseItem = {
      id: `item-${Date.now()}`,
      data: status ? { [properties[1]?.id || ""]: status } : {},
      createdAt: new Date().toISOString(),
    }
    setItems([...items, newItem])
  }

  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter((i) => i.id !== itemId))
  }

  const handleUpdateItem = (itemId: string, data: Record<string, any>) => {
    setItems(items.map((i) => (i.id === itemId ? { ...i, data } : i)))
  }

  const handleAddProperty = (property: DatabaseProperty) => {
    setProperties([...properties, property])
  }

  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      <DatabaseViewSelector currentView={currentView} onViewChange={setCurrentView} />

      {currentView === "table" && (
        <TableView
          properties={properties}
          items={items}
          onAddItem={() => handleAddItem()}
          onDeleteItem={handleDeleteItem}
          onUpdateItem={handleUpdateItem}
          onAddProperty={handleAddProperty}
        />
      )}

      {currentView === "kanban" && (
        <KanbanView
          properties={properties}
          items={items}
          statusProperty={properties.find((p) => p.type === "select")}
          onAddItem={handleAddItem}
          onDeleteItem={handleDeleteItem}
          onUpdateItem={handleUpdateItem}
        />
      )}

      {currentView === "calendar" && (
        <CalendarView
          properties={properties}
          items={items}
          dateProperty={properties.find((p) => p.type === "date")}
          onAddItem={(date) => {
            const newItem: DatabaseItem = {
              id: `item-${Date.now()}`,
              data: {
                [properties.find((p) => p.type === "date")?.id || "date"]: date.toISOString(),
              },
              createdAt: new Date().toISOString(),
            }
            setItems([...items, newItem])
          }}
          onDeleteItem={handleDeleteItem}
          onUpdateItem={handleUpdateItem}
        />
      )}
    </div>
  )
}
