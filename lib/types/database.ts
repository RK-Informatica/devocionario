export type DatabaseViewType = "table" | "kanban" | "calendar"

export interface DatabaseProperty {
  id: string
  name: string
  type: "text" | "number" | "select" | "date" | "checkbox" | "multiselect"
  config?: Record<string, any>
}

export interface DatabaseItem {
  id: string
  data: Record<string, any>
  createdAt: string
}

export interface DatabaseView {
  id: string
  type: DatabaseViewType
  name: string
  config?: Record<string, any>
}
