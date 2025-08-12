-- Update retention policy: 3 days for anonymous users, indefinite for completed assessments
-- This replaces the previous 30-day policy

-- Drop the old cleanup function if it exists
DROP FUNCTION IF EXISTS cleanup_old_assessments();

-- Create updated cleanup function for 3-day retention on incomplete anonymous assessments
CREATE OR REPLACE FUNCTION cleanup_old_assessments()
RETURNS void AS $$
BEGIN
  -- Delete incomplete assessments older than 3 days for anonymous users
  DELETE FROM assessments 
  WHERE user_id IS NULL 
    AND status != 'completed' 
    AND created_at < NOW() - INTERVAL '3 days';
    
  -- Keep all completed assessments indefinitely for analysis
  -- Keep all user-associated assessments indefinitely
END;
$$ LANGUAGE plpgsql;

-- Update the cron job to run daily cleanup
SELECT cron.schedule('cleanup-old-assessments', '0 2 * * *', 'SELECT cleanup_old_assessments();');
