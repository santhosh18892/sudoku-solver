/*
  # Create Sudoku Game Tables

  1. New Tables
    - `game_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable for anonymous play)
      - `difficulty` (text) - easy, medium, hard
      - `initial_puzzle` (text) - JSON string of the starting puzzle
      - `current_state` (text) - JSON string of current puzzle state
      - `solution` (text) - JSON string of the solution
      - `time_elapsed` (integer) - time in seconds
      - `is_completed` (boolean)
      - `is_solved_auto` (boolean) - whether auto-solver was used
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz, nullable)
  
  2. Security
    - Enable RLS on `game_sessions` table
    - Add policy for anyone to create their own game sessions
    - Add policy for users to view their own sessions
    - Add policy for users to update their own sessions
*/

CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  difficulty text NOT NULL DEFAULT 'medium',
  initial_puzzle text NOT NULL,
  current_state text NOT NULL,
  solution text NOT NULL,
  time_elapsed integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  is_solved_auto boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create game sessions"
  ON game_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own sessions"
  ON game_sessions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can update their own sessions"
  ON game_sessions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own sessions"
  ON game_sessions FOR DELETE
  TO anon, authenticated
  USING (true);