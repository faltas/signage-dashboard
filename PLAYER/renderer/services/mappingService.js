import { logInfo, logError } from "../utils/logger.js";

export async function computeScreenMapping(wallId) {
  logInfo("Computing professional videowall mapping for wall:", wallId);
  
  const { data: wallConfig, error } = await window.supabaseAPI.getWallConfiguration(wallId);
  if (error || !wallConfig) {
    logError("Failed to fetch wall configuration:", error);
    return null;
  }

  const walls = wallConfig.walls || [];
  const segments = wallConfig.mapping || wallConfig.screens || [];
  const wall = walls[0] || { pixel_width: 1920, pixel_height: 1080 };

  // Get current physical displays
  const physicalDisplays = await window.System.getDisplays();
  
  // Advanced mapping logic for LED walls and Videowalls
  const mapping = segments.map(segment => {
    const physical = physicalDisplays.find(d => 
      d.width === segment.pixel_width && 
      d.height === segment.pixel_height
    ) || physicalDisplays[0];

    return {
      segment_id: segment.id,
      physical_id: physical?.id,
      logical_rect: {
        x: segment.offset_x || 0,
        y: segment.offset_y || 0,
        width: segment.pixel_width || 1920,
        height: segment.pixel_height || 1080
      }
    };
  });

  return {
    wall,
    screens: segments,
    mapping
  };
}
