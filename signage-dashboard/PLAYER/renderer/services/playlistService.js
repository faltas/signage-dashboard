import { logInfo, logError } from "../utils/logger.js";
//import { getActiveCampaignForDisplay } from "./schedulingService.js";


/**
 * Load playlists for all screens (screens come parametro esterno)
 * Returns an object with screen playlists and extended content info
 */
export async function loadPlaylistsForScreens(displayId, screens) {
  try {
    // Fetch display info (per extended_contents)
    const { data: display, error: displayError } = await window.supabaseAPI.fetchDisplayInfo(displayId);
    
    if (displayError) {
      logError("Error fetching display info:", displayError);
      return null;
    }

    //  Usa gli schermi passati dal PlayerEngine
    if (!screens || screens.length === 0) {
      logInfo("No screens provided for display:", displayId);
      return null;
    }

    const extendedContents = display?.extended_contents || [];
    const screenPlaylists = {};

    for (const screen of screens) {
      if (screen.playlist_id) {
        const { data: items } = await window.supabaseAPI.fetchPlaylist(screen.playlist_id);
        
        // Optimize: check if content is shared across screens for sync
        const processedItems = (items || []).map(item => ({
          ...item,
          syncEnabled: isContentExtended(item.content_id, extendedContents)
        }));

        screenPlaylists[screen.id] = {
          screenIndex: screen.screen_index,
          playlistId: screen.playlist_id,
          items: processedItems,
          width: screen.width,
          height: screen.height,
          viewportX: screen.viewport_x || 0,
          viewportY: screen.viewport_y || 0,
          viewportWidth: screen.viewport_width || screen.width,
          viewportHeight: screen.viewport_height || screen.height
        };
      } else {
        // Nessuna playlist assegnata
        screenPlaylists[screen.id] = {
          screenIndex: screen.screen_index,
          playlistId: null,
          items: [],
          width: screen.width,
          height: screen.height,
          viewportX: screen.viewport_x || 0,
          viewportY: screen.viewport_y || 0,
          viewportWidth: screen.viewport_width || screen.width,
          viewportHeight: screen.viewport_height || screen.height
        };
      }
    }

    return {
      display,
      screens,
      screenPlaylists,
      extendedContents
    };

  } catch (err) {
    logError("Exception in loadPlaylistsForScreens:", err);
    return null;
  }
}

/**
 * Legacy compatibility: load playlist for a single display
 */
export async function loadPlaylistForDisplay(displayId) {
  const { data: screens } = await window.supabaseAPI.fetchScreensInfo(displayId);
  return loadPlaylistsForScreens(displayId, screens);
}

/**
 * Check if a content should be extended across all screens
 */
export function isContentExtended(contentId, extendedContents) {
  return extendedContents && extendedContents.includes(contentId);
}
