-- Add user_id column to assessments table to link assessments to users
ALTER TABLE assessments 
ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Create index for better query performance
CREATE INDEX idx_assessments_user_id ON assessments(user_id);

-- Update existing assessments to have null user_id (anonymous assessments)
-- Future assessments will be linked to authenticated users
