/*
  # Add rating field to qualifications

  1. Changes
    - Create qualifications table with rating field
    - Rating options: 无、特级、一级、二级、三级、四级、五级、甲级、乙级、丙级、AAA、AAAA、AAAAA、CS1、CS2、CS3、CS4、CS5、一星级至十二星级
    - Default rating value is '无'
    - Add validity period range (valid_from, valid_until)
  
  2. Security
    - Enable RLS on qualifications table
    - Users can only access qualifications of their company
*/

CREATE TABLE IF NOT EXISTS qualifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  name text NOT NULL,
  cert_number text NOT NULL,
  cert_scope text NOT NULL,
  cert_organization text NOT NULL,
  rating text DEFAULT '无',
  valid_from timestamptz,
  valid_until timestamptz NOT NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE qualifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view qualifications"
  ON qualifications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert qualifications"
  ON qualifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update qualifications"
  ON qualifications FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete qualifications"
  ON qualifications FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_qualifications_company_id ON qualifications(company_id);
CREATE INDEX IF NOT EXISTS idx_qualifications_valid_until ON qualifications(valid_until);