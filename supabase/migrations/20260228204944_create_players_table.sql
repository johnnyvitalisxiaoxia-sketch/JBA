/*
  # Create players table

  1. New Tables
    - `players`
      - `id` (uuid, primary key, auto-generated)
      - `name` (text, not null) - player name
      - `handling` (integer, default 5) - ball handling/passing skill 0-10
      - `shooting` (integer, default 5) - shooting efficiency 0-10
      - `defense` (integer, default 5) - defensive impact 0-10
      - `rebounding` (integer, default 5) - rebounding/inside presence 0-10
      - `stamina` (integer, default 5) - stamina/physicality 0-10
      - `created_at` (timestamptz, default now()) - record creation time

  2. Security
    - Enable RLS on `players` table
    - Add policy for anyone to read players (public roster)
    - Add policies for authenticated users to insert/update/delete players (admin operations)

  3. Seed Data
    - Insert 6 default players to match the current hardcoded data
*/

CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  handling integer NOT NULL DEFAULT 5 CHECK (handling >= 0 AND handling <= 10),
  shooting integer NOT NULL DEFAULT 5 CHECK (shooting >= 0 AND shooting <= 10),
  defense integer NOT NULL DEFAULT 5 CHECK (defense >= 0 AND defense <= 10),
  rebounding integer NOT NULL DEFAULT 5 CHECK (rebounding >= 0 AND rebounding <= 10),
  stamina integer NOT NULL DEFAULT 5 CHECK (stamina >= 0 AND stamina <= 10),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read players"
  ON players FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert players"
  ON players FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update players"
  ON players FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete players"
  ON players FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

INSERT INTO players (name, handling, shooting, defense, rebounding, stamina) VALUES
  ('张三', 8, 7, 6, 5, 8),
  ('李四', 6, 9, 5, 4, 7),
  ('王五', 5, 6, 9, 8, 9),
  ('赵六', 7, 5, 7, 9, 8),
  ('钱七', 4, 4, 8, 10, 9),
  ('孙八', 9, 8, 4, 3, 7);
