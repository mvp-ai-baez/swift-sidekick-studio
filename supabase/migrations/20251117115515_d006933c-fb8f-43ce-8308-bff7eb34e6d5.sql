-- Fix RESTRICTIVE RLS policies by converting them to PERMISSIVE (default)
-- This prevents policy combination vulnerabilities

-- Drop and recreate profiles policies as PERMISSIVE
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Drop and recreate device_data policies as PERMISSIVE
DROP POLICY IF EXISTS "Users can view own device data" ON public.device_data;
DROP POLICY IF EXISTS "Users can insert own device data" ON public.device_data;
DROP POLICY IF EXISTS "Users can update own device data" ON public.device_data;
DROP POLICY IF EXISTS "Users can delete own device data" ON public.device_data;

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