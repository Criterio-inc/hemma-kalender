-- Allow anyone to create a household (for registration)
CREATE POLICY "Allow creating households" 
ON public.households 
FOR INSERT 
WITH CHECK (true);