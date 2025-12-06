"use client"

import type { DatabaseProperty, DatabaseItem } from "@/lib/types/database"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"

interface CalendarViewProps {
  properties: DatabaseProperty[]
  items: DatabaseItem[]
  dateProperty: DatabaseProperty | undefined
  onAddItem: (date: Date) => void
  onDeleteItem: (itemId: string) => void
  onUpdateItem: (itemId: string, data: Record<string, any>) => void
}

export function CalendarView({
  properties,
  items,
  dateProperty,
  onAddItem,
  onDeleteItem,
  onUpdateItem,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1))

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const getItemsForDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return items.filter((item) => {
      const itemDate = new Date(item.data[dateProperty?.id || ""])
      return itemDate.toDateString() === date.toDateString()
    })
  }

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{monthName}</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-sm font-medium py-2">
            {day}
          </div>
        ))}

        {emptyDays.map((i) => (
          <div key={`empty-${i}`} className="aspect-square bg-muted/20 rounded-lg" />
        ))}

        {days.map((day) => (
          <div
            key={day}
            className="aspect-square border rounded-lg p-1 overflow-hidden hover:bg-muted/30 transition-colors"
          >
            <div className="text-xs font-medium mb-1">{day}</div>
            <div className="space-y-1 text-xs overflow-y-auto max-h-12">
              {getItemsForDate(day).map((item) => (
                <Card key={item.id} className="p-1 text-xs truncate bg-primary/10">
                  {item.data.title || "Untitled"}
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
