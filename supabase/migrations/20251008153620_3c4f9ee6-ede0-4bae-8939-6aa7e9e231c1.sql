-- Add SELECT policy to device_data table to restrict access to own data only
CREATE POLICY "Users can view own device data" 
ON public.device_data 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add UPDATE and DELETE policies for completeness
CREATE POLICY "Users can update own device data" 
ON public.device_data 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own device data" 
ON public.device_data 
FOR DELETE 
USING (auth.uid() = user_id);