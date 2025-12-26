-- Create social_groups table
CREATE TABLE IF NOT EXISTS public.social_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('whatsapp', 'telegram')),
  link TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for ordering
CREATE INDEX idx_social_groups_display_order ON public.social_groups(display_order);

-- Enable RLS
ALTER TABLE public.social_groups ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active groups
CREATE POLICY "Anyone can view active social groups"
  ON public.social_groups
  FOR SELECT
  USING (is_active = true);

-- Policy: Admins can view all groups
CREATE POLICY "Admins can view all social groups"
  ON public.social_groups
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_permissions
      WHERE admin_permissions.user_id = auth.uid()
    )
  );

-- Policy: Admins can insert groups
CREATE POLICY "Admins can insert social groups"
  ON public.social_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_permissions
      WHERE admin_permissions.user_id = auth.uid()
    )
  );

-- Policy: Admins can update groups
CREATE POLICY "Admins can update social groups"
  ON public.social_groups
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_permissions
      WHERE admin_permissions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_permissions
      WHERE admin_permissions.user_id = auth.uid()
    )
  );

-- Policy: Admins can delete groups
CREATE POLICY "Admins can delete social groups"
  ON public.social_groups
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_permissions
      WHERE admin_permissions.user_id = auth.uid()
    )
  );

-- Insert default groups
INSERT INTO public.social_groups (name, platform, link, display_order) VALUES
  ('Grupo Principal WhatsApp', 'whatsapp', 'https://chat.whatsapp.com/IsXhhKLkxNPEywfx0IYG3e', 1);
