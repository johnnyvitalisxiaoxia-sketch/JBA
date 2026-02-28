/*
  # Allow anonymous write access to players table

  Since this app uses client-side admin password (not Supabase Auth),
  we need to allow anon users to perform write operations.
  The admin access control is handled in the frontend.

  1. Security Changes
    - Add insert policy for anon users
    - Add update policy for anon users
    - Add delete policy for anon users
*/

CREATE POLICY "Anon users can insert players"
  ON players FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon users can update players"
  ON players FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon users can delete players"
  ON players FOR DELETE
  TO anon
  USING (true);
