-- Fix device_data table: Convert RESTRICTIVE policies to PERMISSIVE
-- This prevents accidental data exposure if permissive policies are added later

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own device data" ON public.device_data;
DROP POLICY IF EXISTS "Users can insert own device data" ON public.device_data;
DROP POLICY IF EXISTS "Users can update own device data" ON public.device_data;
DROP POLICY IF EXISTS "Users can delete own device data" ON public.device_data;

-- Recreate as permissive policies (default behavior)
CREATE POLICY "Users can view own device data" 
ON public.device_data
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own device data" 
ON public.device_data
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own device data" 
ON public.device_data
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own device data" 
ON public.device_data
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);