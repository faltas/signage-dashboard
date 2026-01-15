-- =====================================================
-- MIGRATION SCRIPT: Add extended_contents and is_sticky support
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Add extended_contents to displays for tracking which contents should be extended
ALTER TABLE displays
ADD COLUMN IF NOT EXISTS extended_contents UUID[] DEFAULT '{}';

-- 2. Add is_sticky to playlist_items for persistent content (no time rotation)
ALTER TABLE playlist_items
ADD COLUMN IF NOT EXISTS is_sticky BOOLEAN DEFAULT FALSE;

-- 3. Add brightness and resolution fields to display_screens for individual screen settings
ALTER TABLE display_screens
ADD COLUMN IF NOT EXISTS brightness INTEGER DEFAULT 100;

ALTER TABLE display_screens
ADD COLUMN IF NOT EXISTS target_resolution VARCHAR(20);

-- 4. Add comment for documentation
COMMENT ON COLUMN displays.extended_contents IS 'Array of content IDs that should be extended across all screens';
COMMENT ON COLUMN playlist_items.is_sticky IS 'If true, content stays on screen indefinitely without rotating';
COMMENT ON COLUMN display_screens.brightness IS 'Screen brightness level (0-100)';
COMMENT ON COLUMN display_screens.target_resolution IS 'Desired resolution for this screen (e.g., 1920x1080)';

-- =====================================================
-- Verification queries (optional - run to check)
-- =====================================================
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'displays';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'playlist_items';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'display_screens';
