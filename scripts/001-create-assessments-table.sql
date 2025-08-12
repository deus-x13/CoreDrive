-- Create the assessments table for Core Drive app
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Assessment metadata
  flow_type TEXT NOT NULL CHECK (flow_type IN ('individual', 'team')),
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  
  -- Demographics
  age_range TEXT,
  gender TEXT,
  years_experience TEXT,
  industry TEXT,
  role_level TEXT,
  
  -- Team information (for team flow)
  team_name TEXT,
  team_size INTEGER,
  team_members JSONB,
  
  -- Qualitative responses
  qualitative_responses JSONB,
  
  -- Ranking data
  ranking_data JSONB,
  
  -- Calculated scores
  scores JSONB
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON public.assessments(created_at);
CREATE INDEX IF NOT EXISTS idx_assessments_flow_type ON public.assessments(flow_type);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON public.assessments(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_assessments_updated_at 
    BEFORE UPDATE ON public.assessments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (optional but recommended)
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations on assessments" ON public.assessments
    FOR ALL USING (true);
