-- Add user_id column to assessments table to link assessments to users
ALTER TABLE public.assessments 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_assessments_user_id ON public.assessments(user_id);

-- Update RLS policies to allow users to access their own assessments
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own assessments
CREATE POLICY "Users can view own assessments" ON public.assessments
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Users can insert their own assessments
CREATE POLICY "Users can insert own assessments" ON public.assessments
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Users can update their own assessments
CREATE POLICY "Users can update own assessments" ON public.assessments
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
