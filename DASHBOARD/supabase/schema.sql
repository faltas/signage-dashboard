-- =====================================================
-- DIGITAL SIGNAGE PLATFORM - DATABASE SCHEMA
-- Professional Schema for Supabase
-- Supports: Single Displays, Video Walls, LED Walls
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS & AUTHENTICATION
-- =====================================================
-- Note: Users are managed by Supabase Auth
-- We just reference auth.users(id)

-- =====================================================
-- DISPLAYS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS displays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  pairing_code VARCHAR(10) UNIQUE,
  status VARCHAR(20) DEFAULT 'offline', -- 'online', 'offline', 'mgmt', 'error'
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  screen_count INTEGER DEFAULT 1,
  wall_id UUID, -- Reference to walls table (NULL for single displays)
  playlist_id UUID, -- Currently assigned playlist
  projection_mode VARCHAR(20) DEFAULT 'contain', -- 'contain', 'cover', 'fill', 'auto'
  extended_contents UUID[] DEFAULT '{}', -- Content IDs that should be extended across all screens
  
  -- Hardware info
  hardware_id VARCHAR(255),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_displays_user_id ON displays(user_id);
CREATE INDEX idx_displays_pairing_code ON displays(pairing_code) WHERE pairing_code IS NOT NULL;
CREATE INDEX idx_displays_wall_id ON displays(wall_id) WHERE wall_id IS NOT NULL;
CREATE INDEX idx_displays_status ON displays(status);

-- =====================================================
-- WALLS TABLE (Video Walls / LED Walls)
-- =====================================================
CREATE TABLE IF NOT EXISTS walls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) DEFAULT 'videowall', -- 'videowall', 'ledwall'
  
  -- Wall dimensions (logical canvas)
  pixel_width INTEGER NOT NULL DEFAULT 1920,
  pixel_height INTEGER NOT NULL DEFAULT 1080,
  
  -- Physical layout
  rows INTEGER DEFAULT 1,
  columns INTEGER DEFAULT 1,
  
  -- Metadata
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_walls_user_id ON walls(user_id);
CREATE INDEX idx_walls_type ON walls(type);

-- =====================================================
-- DISPLAY_SCREENS TABLE (Physical Monitors)
-- =====================================================
CREATE TABLE IF NOT EXISTS display_screens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_id UUID REFERENCES displays(id) ON DELETE CASCADE,
  wall_id UUID REFERENCES walls(id) ON DELETE CASCADE,
  
  -- Physical screen info
  hardware_id VARCHAR(255),
  screen_index INTEGER NOT NULL, -- 0, 1, 2, etc.
  is_primary BOOLEAN DEFAULT FALSE,
  
  -- Screen resolution
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  resolution VARCHAR(20), -- e.g., '1920x1080'
  orientation VARCHAR(20) DEFAULT 'landscape', -- 'landscape', 'portrait'
  
  -- Position in wall (for multi-screen setups)
  row_position INTEGER DEFAULT 0,
  col_position INTEGER DEFAULT 0,
  
  -- Viewport mapping (which part of the virtual canvas this screen shows)
  viewport_x INTEGER DEFAULT 0,
  viewport_y INTEGER DEFAULT 0,
  viewport_width INTEGER,
  viewport_height INTEGER,
  
  -- Playlist assignment for individual screen (optional, overrides display playlist)
  playlist_id UUID REFERENCES playlists(id) ON DELETE SET NULL,
  
  -- Screen settings
  brightness INTEGER DEFAULT 100,
  target_resolution VARCHAR(20),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_display_screens_display_id ON display_screens(display_id);
CREATE INDEX idx_display_screens_wall_id ON display_screens(wall_id) WHERE wall_id IS NOT NULL;

-- =====================================================
-- DISPLAY_HEALTH TABLE (Monitoring)
-- =====================================================
CREATE TABLE IF NOT EXISTS display_health (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_id UUID REFERENCES displays(id) ON DELETE CASCADE UNIQUE,
  
  -- System metrics
  cpu_usage NUMERIC(5,2),
  memory_usage NUMERIC(5,2),
  temp_c NUMERIC(5,2),
  brightness INTEGER,
  
  -- Network
  network_status VARCHAR(20) DEFAULT 'unknown',
  bandwidth_mbps NUMERIC(10,2),
  
  -- Application
  player_version VARCHAR(50),
  uptime_seconds BIGINT,
  
  -- Timestamps
  last_query TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_display_health_display_id ON display_health(display_id);

-- =====================================================
-- DISPLAY_SENSORS TABLE (Advanced Monitoring)
-- =====================================================
CREATE TABLE IF NOT EXISTS display_sensors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_id UUID REFERENCES displays(id) ON DELETE CASCADE,
  
  sensor_type VARCHAR(50) NOT NULL, -- 'temperature', 'light', 'proximity', etc.
  value NUMERIC(10,2),
  unit VARCHAR(20),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_display_sensors_display_id ON display_sensors(display_id);
CREATE INDEX idx_display_sensors_type ON display_sensors(sensor_type);

-- =====================================================
-- CONTENTS TABLE (Media Files)
-- =====================================================
CREATE TABLE IF NOT EXISTS contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'image', 'video', 'scene', 'html', 'url'
  url TEXT NOT NULL,
  
  -- File info
  file_size BIGINT,
  mime_type VARCHAR(100),
  duration_seconds INTEGER,
  
  -- Dimensions (for images/videos)
  width INTEGER,
  height INTEGER,
  
  -- Scene reference (if type='scene')
  scene_id UUID,
  
  -- Metadata
  tags TEXT[],
  description TEXT,
  thumbnail_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contents_user_id ON contents(user_id);
CREATE INDEX idx_contents_type ON contents(type);
CREATE INDEX idx_contents_scene_id ON contents(scene_id) WHERE scene_id IS NOT NULL;

-- =====================================================
-- PLAYLISTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Settings
  loop BOOLEAN DEFAULT TRUE,
  shuffle BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_playlists_user_id ON playlists(user_id);

-- =====================================================
-- PLAYLIST_ITEMS TABLE (Content in Playlists)
-- =====================================================
CREATE TABLE IF NOT EXISTS playlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
  
  position INTEGER NOT NULL,
  duration_seconds INTEGER DEFAULT 10,
  
  -- Transitions
  transition_type VARCHAR(50) DEFAULT 'fade',
  transition_duration NUMERIC(4,2) DEFAULT 0.8,
  
  -- Video Wall options
  expand_to_all_screens BOOLEAN DEFAULT FALSE, 
  is_sticky BOOLEAN DEFAULT FALSE, -- New: for "always play" content

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_playlist_items_playlist_id ON playlist_items(playlist_id);
CREATE INDEX idx_playlist_items_content_id ON playlist_items(content_id);
CREATE INDEX idx_playlist_items_position ON playlist_items(playlist_id, position);

-- =====================================================
-- SCENES TABLE (Multi-Region Layouts)
-- =====================================================
CREATE TABLE IF NOT EXISTS scenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wall_id UUID REFERENCES walls(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Layout settings
  layout_type VARCHAR(50) DEFAULT 'custom', -- 'grid', 'custom', 'split', etc.
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scenes_user_id ON scenes(user_id);
CREATE INDEX idx_scenes_wall_id ON scenes(wall_id) WHERE wall_id IS NOT NULL;

-- =====================================================
-- SCENE_REGIONS TABLE (Zones in Scenes)
-- =====================================================
CREATE TABLE IF NOT EXISTS scene_regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  playlist_id UUID REFERENCES playlists(id) ON DELETE SET NULL,
  
  name VARCHAR(255),
  
  -- Position and size (percentage of canvas)
  x_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  y_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  width_percent NUMERIC(5,2) NOT NULL DEFAULT 100,
  height_percent NUMERIC(5,2) NOT NULL DEFAULT 100,
  
  -- Or absolute pixels
  x_px INTEGER,
  y_px INTEGER,
  width_px INTEGER,
  height_px INTEGER,
  
  -- Layer order
  z_index INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scene_regions_scene_id ON scene_regions(scene_id);
CREATE INDEX idx_scene_regions_playlist_id ON scene_regions(playlist_id) WHERE playlist_id IS NOT NULL;

-- =====================================================
-- CAMPAIGNS TABLE (Scheduled Content)
-- =====================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_id UUID REFERENCES displays(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Schedule
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  
  -- Active days (bitmask: Sunday=1, Monday=2, ... Saturday=64)
  active_days INTEGER DEFAULT 127, -- All days by default
  
  -- Priority (higher = more important)
  priority INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_display_id ON campaigns(display_id);
CREATE INDEX idx_campaigns_schedule ON campaigns(start_at, end_at);
CREATE INDEX idx_campaigns_active ON campaigns(is_active) WHERE is_active = TRUE;

-- =====================================================
-- CAMPAIGN_PLAYLISTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS campaign_playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  
  position INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaign_playlists_campaign_id ON campaign_playlists(campaign_id);
CREATE INDEX idx_campaign_playlists_playlist_id ON campaign_playlists(playlist_id);

-- =====================================================
-- DISPLAY_COMMANDS TABLE (Remote Control)
-- =====================================================
CREATE TABLE IF NOT EXISTS display_commands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_id UUID REFERENCES displays(id) ON DELETE CASCADE,
  
  command_type VARCHAR(50) NOT NULL, -- 'reload_playlist', 'force_scene', 'set_brightness', 'restart', etc.
  params JSONB,
  
  executed BOOLEAN DEFAULT FALSE,
  executed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_display_commands_display_id ON display_commands(display_id);
CREATE INDEX idx_display_commands_executed ON display_commands(executed) WHERE executed = FALSE;
CREATE INDEX idx_display_commands_created_at ON display_commands(created_at DESC);

-- =====================================================
-- DISPLAY_LOGS TABLE (Activity Logs)
-- =====================================================
CREATE TABLE IF NOT EXISTS display_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_id UUID REFERENCES displays(id) ON DELETE CASCADE,
  
  type VARCHAR(50) NOT NULL, -- 'info', 'warning', 'error', 'command'
  message TEXT NOT NULL,
  
  -- Additional data
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_display_logs_display_id ON display_logs(display_id);
CREATE INDEX idx_display_logs_type ON display_logs(type);
CREATE INDEX idx_display_logs_created_at ON display_logs(created_at DESC);

-- =====================================================
-- DISPLAY_SCREENSHOTS TABLE (Remote Monitoring)
-- =====================================================
CREATE TABLE IF NOT EXISTS display_screenshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_id UUID REFERENCES displays(id) ON DELETE CASCADE,
  
  url TEXT NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_display_screenshots_display_id ON display_screenshots(display_id);
CREATE INDEX idx_display_screenshots_created_at ON display_screenshots(created_at DESC);

-- =====================================================
-- RPC FUNCTIONS
-- =====================================================

-- Get complete wall configuration with all screens and mapping
CREATE OR REPLACE FUNCTION get_wall_configuration(p_display_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB;
  wall_record RECORD;
  screens_array JSONB;
BEGIN
  -- Get display's wall
  SELECT w.* INTO wall_record
  FROM walls w
  JOIN displays d ON d.wall_id = w.id
  WHERE d.id = p_display_id;
  
  IF wall_record IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Get all screens for this wall
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', ds.id,
      'screen_index', ds.screen_index,
      'is_primary', ds.is_primary,
      'width', ds.width,
      'height', ds.height,
      'row_position', ds.row_position,
      'col_position', ds.col_position,
      'viewport_x', ds.viewport_x,
      'viewport_y', ds.viewport_y,
      'viewport_width', ds.viewport_width,
      'viewport_height', ds.viewport_height
    )
  ) INTO screens_array
  FROM display_screens ds
  WHERE ds.wall_id = wall_record.id;
  
  -- Build result
  result := jsonb_build_object(
    'wall', jsonb_build_object(
      'id', wall_record.id,
      'name', wall_record.name,
      'type', wall_record.type,
      'pixel_width', wall_record.pixel_width,
      'pixel_height', wall_record.pixel_height,
      'rows', wall_record.rows,
      'columns', wall_record.columns
    ),
    'screens', COALESCE(screens_array, '[]'::jsonb),
    'mapping', jsonb_build_object(
      'total_screens', COALESCE(jsonb_array_length(screens_array), 0)
    )
  );
  
  RETURN result;
END;
$$;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE displays ENABLE ROW LEVEL SECURITY;
ALTER TABLE walls ENABLE ROW LEVEL SECURITY;
ALTER TABLE display_screens ENABLE ROW LEVEL SECURITY;
ALTER TABLE display_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE display_sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE display_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE display_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE display_screenshots ENABLE ROW LEVEL SECURITY;

-- Displays: Users can only see their own displays OR displays can access themselves
CREATE POLICY displays_policy ON displays
  FOR ALL
  USING (
    auth.uid() = user_id OR
    (auth.jwt() ->> 'is_display')::boolean = TRUE AND (auth.jwt() ->> 'display_id')::uuid = id
  );

-- Walls: Users can only see their own walls
CREATE POLICY walls_policy ON walls
  FOR ALL
  USING (auth.uid() = user_id);

-- Display screens: Via display or wall ownership
CREATE POLICY display_screens_policy ON display_screens
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM displays d
      WHERE d.id = display_screens.display_id
      AND (d.user_id = auth.uid() OR
           ((auth.jwt() ->> 'is_display')::boolean = TRUE AND (auth.jwt() ->> 'display_id')::uuid = d.id))
    )
    OR
    EXISTS (
      SELECT 1 FROM walls w
      WHERE w.id = display_screens.wall_id
      AND w.user_id = auth.uid()
    )
  );

-- Display health: Via display ownership
CREATE POLICY display_health_policy ON display_health
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM displays d
      WHERE d.id = display_health.display_id
      AND (d.user_id = auth.uid() OR
           ((auth.jwt() ->> 'is_display')::boolean = TRUE AND (auth.jwt() ->> 'display_id')::uuid = d.id))
    )
  );

-- Contents: Users can only see their own content
CREATE POLICY contents_policy ON contents
  FOR ALL
  USING (auth.uid() = user_id);

-- Playlists: Users can only see their own playlists
CREATE POLICY playlists_policy ON playlists
  FOR ALL
  USING (auth.uid() = user_id);

-- Playlist items: Via playlist ownership
CREATE POLICY playlist_items_policy ON playlist_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM playlists p
      WHERE p.id = playlist_items.playlist_id
      AND p.user_id = auth.uid()
    )
  );

-- Scenes: Users can only see their own scenes
CREATE POLICY scenes_policy ON scenes
  FOR ALL
  USING (auth.uid() = user_id);

-- Scene regions: Via scene ownership
CREATE POLICY scene_regions_policy ON scene_regions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM scenes s
      WHERE s.id = scene_regions.scene_id
      AND s.user_id = auth.uid()
    )
  );

-- Campaigns: Users can only see their own campaigns
CREATE POLICY campaigns_policy ON campaigns
  FOR ALL
  USING (auth.uid() = user_id);

-- Display commands: Via display ownership
CREATE POLICY display_commands_policy ON display_commands
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM displays d
      WHERE d.id = display_commands.display_id
      AND (d.user_id = auth.uid() OR
           ((auth.jwt() ->> 'is_display')::boolean = TRUE AND (auth.jwt() ->> 'display_id')::uuid = d.id))
    )
  );

-- Display logs: Via display ownership
CREATE POLICY display_logs_policy ON display_logs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM displays d
      WHERE d.id = display_logs.display_id
      AND (d.user_id = auth.uid() OR
           ((auth.jwt() ->> 'is_display')::boolean = TRUE AND (auth.jwt() ->> 'display_id')::uuid = d.id))
    )
  );

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_displays_updated_at BEFORE UPDATE ON displays
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_walls_updated_at BEFORE UPDATE ON walls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contents_updated_at BEFORE UPDATE ON contents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scenes_updated_at BEFORE UPDATE ON scenes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();