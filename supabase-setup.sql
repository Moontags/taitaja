-- This file contains the additional SQL needed for Supabase setup
-- First, run the quiz_app.sql file provided, then run this:

-- Create scores table for storing game results
CREATE TABLE IF NOT EXISTS scores (
  id SERIAL PRIMARY KEY,
  player_name VARCHAR(255) NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  category_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint if categories table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
        ALTER TABLE scores ADD CONSTRAINT fk_scores_category 
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore if constraint already exists
        NULL;
END $$;

-- Create index for better performance on scores queries
CREATE INDEX IF NOT EXISTS idx_scores_category_score ON scores(category_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON scores(created_at DESC);

-- Insert some sample scores for testing (optional)
INSERT INTO scores (player_name, score, total_questions, category_id) 
VALUES 
  ('Anna K.', 5, 5, 1),
  ('Mikael L.', 4, 5, 1),
  ('Ella S.', 2, 5, 1),
  ('Linda P.', 10, 10, 2),
  ('Olli R.', 10, 10, 2),
  ('Katri R.', 9, 10, 2),
  ('Margit T.', 15, 15, 3),
  ('Maija S.', 14, 15, 3),
  ('Anna S.', 10, 15, 3)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS) if needed
-- ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Create policies for scores table (allow read for all, insert for all users)
-- CREATE POLICY "Allow read access to all users" ON scores FOR SELECT USING (true);
-- CREATE POLICY "Allow insert for all users" ON scores FOR INSERT WITH CHECK (true);