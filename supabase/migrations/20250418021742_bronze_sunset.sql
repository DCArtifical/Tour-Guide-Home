/*
  # Add cascade delete constraints for user data

  1. Changes
    - Add ON DELETE CASCADE to foreign key constraints in:
      - guide_licenses
      - licenses
      - certificates
    
  2. Security
    - Maintains existing RLS policies
    - Ensures proper data cleanup when a user is deleted
*/

-- Add CASCADE to guide_licenses foreign key
ALTER TABLE guide_licenses
DROP CONSTRAINT guide_licenses_user_id_fkey,
ADD CONSTRAINT guide_licenses_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Add CASCADE to licenses foreign key
ALTER TABLE licenses
DROP CONSTRAINT licenses_user_id_fkey,
ADD CONSTRAINT licenses_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Add CASCADE to certificates foreign key
ALTER TABLE certificates
DROP CONSTRAINT certificates_user_id_fkey,
ADD CONSTRAINT certificates_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;