/*
  # Create licenses table and storage

  1. New Tables
    - `licenses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `image_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Storage
    - Create bucket for license images

  3. Security
    - Enable RLS on licenses table
    - Add policies for authenticated users
*/

-- Create licenses table
CREATE TABLE IF NOT EXISTS licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own licenses"
  ON licenses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own licenses"
  ON licenses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own licenses"
  ON licenses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create storage bucket
INSERT INTO storage.buckets (id, name)
VALUES ('license-images', 'license-images')
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view license images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'license-images');

CREATE POLICY "Authenticated users can upload license images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'license-images');

CREATE POLICY "Users can update their own license images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'license-images');