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

  const { data: logicalScreens } = await window.supabaseAPI.fetchScreensInfo(config.displayId);
  const physicalIds = physicalDisplays.map(d => String(d.id));
  const logicalIds = (logicalScreens || []).map(s => String(s.hardware_id));

  // Rimuovi screen scollegati (che non sono più presenti fisicamente)
  if (logicalScreens) {
    for (const logical of logicalScreens) {
      if (!physicalIds.includes(String(logical.hardware_id))) {
        logInfo("Rimuovo screen scollegato:", logical.hardware_id);
        await window.supabaseAPI.DeleteScreen(logical.id);
      }
    }
  }

  // Aggiungi nuovi screen (che non sono ancora nel cloud)
  for (const p of physicalDisplays) {
    if (!logicalIds.includes(String(p.id))) {
      const screenInfo = {
        hardware_id: String(p.id),
        screen_index: p.isPrimary ? 0 : null,
        width: p.width,
        height: p.height,
        is_primary: p.isPrimary,
        resolution: `${p.width}x${p.height}`
      };

      logInfo("Aggiungo nuovo screen:", p.id);
      await window.supabaseAPI.InsertScreens(config.displayId, screenInfo);
    } else {
      // Opzionale: aggiorna info se necessario (es. risoluzione cambiata)
      const existing = logicalScreens.find(s => String(s.hardware_id) === String(p.id));
      if (existing && (existing.width !== p.width || existing.height !== p.height)) {
         logInfo("Aggiorno dimensioni screen esistente:", p.id);
         await window.supabaseAPI.UpdateScreen(existing.id, {
           width: p.width,
           height: p.height,
           resolution: `${p.width}x${p.height}`
         });
      }
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
      width: p.width || p.size.width,
      height: p.height || p.size.height,
      is_primary: p.isPrimary,
      resolution: `${p.width || p.size.width}x${p.height || p.size.height}`
    };

    await window.supabaseAPI.InsertScreens(config.displayId, screenInfo);
    logInfo("Screen registrato nel cloud:", p.id);
  });

  window.SystemEvents.onDisplayRemoved(async (p) => {
    logInfo("Display scollegato:", p.id);

    const { data: logicalScreens } = await window.supabaseAPI.fetchScreensInfo(config.displayId);
    const screen = logicalScreens.find(s => Number(s.hardware_id) === p.id);

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
