// renderer/services/screenService.js
import { logInfo, logError } from "../utils/logger.js";

export async function syncScreens(config, displayInfo) {
  const physicalDisplays = await window.System.getDisplays();
  logInfo("Display fisici rilevati:", physicalDisplays.length);

  if (!displayInfo.screen_count) {
    // Primo setup: nessuno screen nel cloud
    const errorUpdate = await window.supabaseAPI.updateDisplayInfo(
      config.displayId,
      physicalDisplays.length
    );
    if (errorUpdate) logError("Errore update screen_count:", errorUpdate);

    logInfo("Nessuno screen registrato. Procedo a registrarli...");

    for (const p of physicalDisplays) {
      const screenInfo = {
        hardware_id: p.id,
        screen_index: p.isPrimary ? 0 : null,
        resolution: `${p.width}x${p.height}`,
        width: p.width,
        height: p.height,
        is_primary: p.isPrimary
      };

      const { error } = await window.supabaseAPI.InsertScreens(config.displayId, screenInfo);
      if (error) logError("Errore creazione screen:", error);
    }
    return;
  }

  // Esistono già screen nel cloud → sync
  const { data: logicalScreens } = await window.supabaseAPI.fetchScreensInfo(config.displayId);

  const physicalIds = physicalDisplays.map(d => d.id);
  const logicalIds = logicalScreens.map(s => s.hardware_id);

  // Rimuovi screen scollegati
  for (const logical of logicalScreens) {
    if (!physicalIds.includes(logical.hardware_id)) {
      logInfo("Rimuovo screen scollegato:", logical.hardware_id);
      await window.supabaseAPI.DeleteScreen(logical.id);
    }
  }

  // Aggiungi nuovi screen
  for (const p of physicalDisplays) {
    if (!logicalIds.includes(p.id)) {
      const screenInfo = {
        hardware_id: p.id,
        screen_index: p.isPrimary ? 0 : null,
        width: p.size.width,
        height: p.size.height,
        is_primary: p.isPrimary,
        resolution: `${p.size.width}x${p.size.height}`
      };

      logInfo("Aggiungo nuovo screen:", p.id);
      await window.supabaseAPI.InsertScreens(config.displayId, screenInfo);
    }
  }
}

// Eventi sistema → supabase
export function setupRealtimeScreenEvents(config) {
  window.SystemEvents.onDisplayAdded(async (p) => {
    logInfo("Nuovo display collegato:", p.id);

    const screenInfo = {
      hardware_id: p.id,
      screen_index: p.isPrimary ? 0 : null,
      width: p.size.width,
      height: p.size.height,
      is_primary: p.isPrimary,
      resolution: `${p.size.width}x${p.size.height}`
    };

    await window.supabaseAPI.InsertScreens(config.displayId, screenInfo);
    logInfo("Screen registrato nel cloud:", p.id);
  });

  window.SystemEvents.onDisplayRemoved(async (p) => {
    logInfo("Display scollegato:", p.id);

    const { data: logicalScreens } = await window.supabaseAPI.fetchScreensInfo(config.displayId);
    const screen = logicalScreens.find(s => s.hardware_id === p.id);

    if (screen) {
      await window.supabaseAPI.DeleteScreen(screen.id);
      logInfo("Screen rimosso dal cloud:", screen.id);
    }
  });

  window.SystemEvents.onDisplayChanged(async (p) => {
    logInfo("Display modificato:", p.id);

    const { data: logicalScreens } = await window.supabaseAPI.fetchScreensInfo(config.displayId);
    const screen = logicalScreens.find(s => s.hardware_id === p.id);

    if (screen) {
      await window.supabaseAPI.UpdateScreen(screen.id, {
        width: p.size.width,
        height: p.size.height,
        is_primary: p.isPrimary,
        resolution: `${p.size.width}x${p.size.height}`
      });

      logInfo("Screen aggiornato nel cloud:", screen.id);
    }
  });
}
