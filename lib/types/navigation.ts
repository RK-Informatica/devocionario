export interface Workspace {
  id: string
  name: string
  icon?: string
  owner_id: string
}

export interface PageNode {
  id: string
  title: string
  icon?: string
  parentPageId?: string
  children: PageNode[]
  isPublic: boolean
  createdAt: string
}

export interface ExpandedPagesState {
  [pageId: string]: boolean
}
