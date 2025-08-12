-- Execute this script to create the assessments table
-- Create assessments table to store individual assessment sessions
CREATE TABLE IF NOT EXISTS assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Assessment metadata
  flow_type TEXT NOT NULL CHECK (flow_type IN ('individual', 'team')),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  
  -- Demographics
  age_range TEXT,
  gender TEXT,
  years_experience TEXT,
  industry TEXT,
  role_level TEXT,
  
  -- Qualitative responses (JSON array of strings)
  qualitative_responses JSONB,
  
  -- Ranking data (JSON array of motivator objects with ranks)
  ranking_data JSONB,
  
  -- Team-specific data (only for team assessments)
  team_name TEXT,
  team_size INTEGER,
  team_members JSONB -- Array of team member objects
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at);
CREATE INDEX IF NOT EXISTS idx_assessments_flow_type ON assessments(flow_type);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_assessments_updated_at 
    BEFORE UPDATE ON assessments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
