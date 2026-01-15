// renderer/services/displayService.js
import { logInfo, logError } from "../utils/logger.js";

export async function registerDisplayIfNeeded(env, config) {
  if (config.displayId) {
    logInfo("Trovato DisplayId:", config.displayId, "salto procedura di registrazione");
    return { displayId_Found: true, config };
  }

  logInfo("DisplayId è null → richiedo registrazione al backend");

  const resp = await fetch(env.REGISTER_DISPLAY_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceInfo: {} })
  });

  if (!resp.ok) {
    logError("Errore durante la registrazione del display");
    throw new Error("Impossibile registrare display");
  }

  const { displayId, pairing_code } = await resp.json();

  logInfo("Registrato nel backend correttamente con displayID:", displayId, "pairing code:", pairing_code);

  const newConfig = {
    ...config,
    displayId,
    pairingCode: pairing_code,
  };

  window.Config.saveConfig(newConfig);

  return {
    displayId_Found: false,
    config: null,
    pairingCode: pairing_code,
    newDisplayId: displayId
  };
}

export async function getDisplayInfo(env, config) {
  logInfo("Carico configurazione display dal cloud");

  let resp;
  try {
    resp = await fetch(env.DISPLAY_TOKEN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayId: config.displayId }),
    });
  } catch (err) {
    logError("Backend offline, entro in modalità offline:", err);
    return { offline: true };
  }

  if (!resp.ok) {
    logError("Errore ottenendo display-token:", await resp.text());
    config.displayId = null;
    window.Config.saveConfig(config);
    return { exists: false, unpaired: true, screen_count: 0 };
  }

  const { token } = await resp.json();

  logInfo("Ricevuto token dal backend, inizializzo comunicazione autenticata");
  await window.supabaseAPI.setAuthToken(token);

  logInfo("Richiedo al cloud la mia configurazione");

  const { data: display, error } = await window.supabaseAPI.fetchDisplayInfo(config.displayId);

  if (error || !display) {
    logError("Display non trovato per id:", config.displayId, "o errore generico durante richiesta cloud");
	config.displayId = null;
    window.Config.saveConfig(config);
    return { exists: false, unpaired: false, screen_count: 0, token };
  }

  if (display.pairing_code) {
    logInfo("Display esistente ma NON associato, pairing_code:", display.pairing_code);
    return {
      exists: true,
      unpaired: true,
      screen_count: display.screen_count || 0,
      token,
      pairing_code: display.pairing_code
    };
  }

  return {
    exists: true,
    unpaired: false,
    screen_count: display.screen_count || 0,
    token,
    display
  };
}
