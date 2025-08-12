-- Add automatic cleanup for old assessments
-- Adding 30-day expiry for assessments to manage storage

-- Add expires_at column with default 30 days from creation
ALTER TABLE assessments 
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days');

-- Update existing records to have expiry dates
UPDATE assessments 
SET expires_at = created_at + INTERVAL '30 days' 
WHERE expires_at IS NULL;

-- Create function to clean up expired assessments
CREATE OR REPLACE FUNCTION cleanup_expired_assessments()
RETURNS void AS $$
BEGIN
  DELETE FROM assessments WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup daily (requires pg_cron extension)
-- Note: This requires enabling pg_cron in Supabase dashboard
-- SELECT cron.schedule('cleanup-assessments', '0 2 * * *', 'SELECT cleanup_expired_assessments();');
