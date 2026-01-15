-- =====================================================
-- MIGRATION SCRIPT: Add playlist support for display_screens
-- and expand_to_all_screens for playlist_items
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Add playlist_id to display_screens for individual screen playlists
ALTER TABLE display_screens
ADD COLUMN IF NOT EXISTS playlist_id UUID REFERENCES playlists(id) ON DELETE SET NULL;

-- 2. Add expand_to_all_screens to playlist_items for video wall content spanning
ALTER TABLE playlist_items
ADD COLUMN IF NOT EXISTS expand_to_all_screens BOOLEAN DEFAULT FALSE;

-- 3. Create index for the new column
CREATE INDEX IF NOT EXISTS idx_display_screens_playlist_id 
ON display_screens(playlist_id) WHERE playlist_id IS NOT NULL;

-- 4. Update RLS policy for display_screens to allow playlist updates
DROP POLICY IF EXISTS display_screens_update_policy ON display_screens;

CREATE POLICY display_screens_update_policy ON display_screens
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM displays d
      WHERE d.id = display_screens.display_id
      AND d.user_id = auth.uid()
    )
  );

-- 5. Grant necessary permissions
GRANT UPDATE ON display_screens TO authenticated;
GRANT UPDATE ON playlist_items TO authenticated;

-- =====================================================
-- Verification queries (optional - run to check)
-- =====================================================
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'display_screens';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'playlist_items';
