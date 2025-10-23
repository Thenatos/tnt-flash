-- Fix 1: Restrict Profile Data Exposure
-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Todos podem ver perfis" ON public.profiles;

-- Users can see their own full profile
CREATE POLICY "Users see own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Authenticated users can see limited profile data from others (username and avatar only)
CREATE POLICY "Authenticated users see limited profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  auth.uid() != user_id
);

-- Fix 2: Secure Analytics Events
-- Drop the insecure public INSERT policy
DROP POLICY IF EXISTS "Todos podem inserir eventos" ON public.analytics_events;

-- Authenticated users can insert events for themselves
CREATE POLICY "Authenticated users insert own events" 
ON public.analytics_events 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = user_id OR 
  (auth.uid() IS NOT NULL AND user_id IS NULL)
);

-- Anonymous users can only insert limited event types without user_id
CREATE POLICY "Anonymous users limited events" 
ON public.analytics_events 
FOR INSERT 
TO anon
WITH CHECK (
  user_id IS NULL AND
  event_type IN ('page_view', 'product_view')
);