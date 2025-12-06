-- Create profiles table (user management)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workspaces table
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workspace members table
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Create pages table
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  parent_page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled',
  icon TEXT,
  cover_image_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  position INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blocks table (for page content)
CREATE TABLE IF NOT EXISTS public.blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  parent_block_id UUID REFERENCES public.blocks(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content JSONB,
  position INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create databases table (for database blocks with different views)
CREATE TABLE IF NOT EXISTS public.databases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID NOT NULL REFERENCES public.blocks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create database properties table
CREATE TABLE IF NOT EXISTS public.database_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  database_id UUID NOT NULL REFERENCES public.databases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  position INT DEFAULT 0,
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create database items table
CREATE TABLE IF NOT EXISTS public.database_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  database_id UUID NOT NULL REFERENCES public.databases(id) ON DELETE CASCADE,
  data JSONB,
  position INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.databases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.database_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.database_items ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Workspaces RLS
CREATE POLICY "workspaces_select" ON public.workspaces FOR SELECT USING (
  owner_id = auth.uid() OR id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
);
CREATE POLICY "workspaces_insert" ON public.workspaces FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "workspaces_update" ON public.workspaces FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "workspaces_delete" ON public.workspaces FOR DELETE USING (owner_id = auth.uid());

-- Workspace Members RLS
CREATE POLICY "workspace_members_select" ON public.workspace_members FOR SELECT USING (
  user_id = auth.uid() OR workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
);
CREATE POLICY "workspace_members_insert" ON public.workspace_members FOR INSERT WITH CHECK (
  workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
);

-- Pages RLS
CREATE POLICY "pages_select" ON public.pages FOR SELECT USING (
  is_public = TRUE OR 
  created_by = auth.uid() OR 
  workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
);
CREATE POLICY "pages_insert" ON public.pages FOR INSERT WITH CHECK (
  workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()) AND created_by = auth.uid()
);
CREATE POLICY "pages_update" ON public.pages FOR UPDATE USING (
  created_by = auth.uid() OR workspace_id IN (SELECT workspace_id FROM workspaces WHERE owner_id = auth.uid())
);
CREATE POLICY "pages_delete" ON public.pages FOR DELETE USING (
  created_by = auth.uid() OR workspace_id IN (SELECT workspace_id FROM workspaces WHERE owner_id = auth.uid())
);

-- Blocks RLS
CREATE POLICY "blocks_select" ON public.blocks FOR SELECT USING (
  page_id IN (SELECT id FROM pages WHERE is_public = TRUE OR created_by = auth.uid() OR workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()))
);
CREATE POLICY "blocks_insert" ON public.blocks FOR INSERT WITH CHECK (
  page_id IN (SELECT id FROM pages WHERE created_by = auth.uid() OR workspace_id IN (SELECT workspace_id FROM workspaces WHERE owner_id = auth.uid()))
);
CREATE POLICY "blocks_update" ON public.blocks FOR UPDATE USING (
  page_id IN (SELECT id FROM pages WHERE created_by = auth.uid() OR workspace_id IN (SELECT workspace_id FROM workspaces WHERE owner_id = auth.uid()))
);
CREATE POLICY "blocks_delete" ON public.blocks FOR DELETE USING (
  page_id IN (SELECT id FROM pages WHERE created_by = auth.uid() OR workspace_id IN (SELECT workspace_id FROM workspaces WHERE owner_id = auth.uid()))
);

-- Databases RLS
CREATE POLICY "databases_select" ON public.databases FOR SELECT USING (
  block_id IN (SELECT id FROM blocks WHERE page_id IN (SELECT id FROM pages WHERE is_public = TRUE OR created_by = auth.uid() OR workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())))
);
CREATE POLICY "databases_insert" ON public.databases FOR INSERT WITH CHECK (
  block_id IN (SELECT id FROM blocks WHERE page_id IN (SELECT id FROM pages WHERE created_by = auth.uid() OR workspace_id IN (SELECT workspace_id FROM workspaces WHERE owner_id = auth.uid())))
);

-- Database Properties RLS
CREATE POLICY "database_properties_select" ON public.database_properties FOR SELECT USING (
  database_id IN (SELECT id FROM databases WHERE block_id IN (SELECT id FROM blocks WHERE page_id IN (SELECT id FROM pages WHERE is_public = TRUE OR created_by = auth.uid() OR workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()))))
);
CREATE POLICY "database_properties_insert" ON public.database_properties FOR INSERT WITH CHECK (
  database_id IN (SELECT id FROM databases WHERE block_id IN (SELECT id FROM blocks WHERE page_id IN (SELECT id FROM pages WHERE created_by = auth.uid() OR workspace_id IN (SELECT workspace_id FROM workspaces WHERE owner_id = auth.uid()))))
);

-- Database Items RLS
CREATE POLICY "database_items_select" ON public.database_items FOR SELECT USING (
  database_id IN (SELECT id FROM databases WHERE block_id IN (SELECT id FROM blocks WHERE page_id IN (SELECT id FROM pages WHERE is_public = TRUE OR created_by = auth.uid() OR workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()))))
);
CREATE POLICY "database_items_insert" ON public.database_items FOR INSERT WITH CHECK (
  database_id IN (SELECT id FROM databases WHERE block_id IN (SELECT id FROM blocks WHERE page_id IN (SELECT id FROM pages WHERE created_by = auth.uid() OR workspace_id IN (SELECT workspace_id FROM workspaces WHERE owner_id = auth.uid()))))
);
