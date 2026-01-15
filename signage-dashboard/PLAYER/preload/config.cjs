const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "player-config.json");

function loadConfig() {
  try {
    if (!fs.existsSync(configPath)) return { displayId: null };
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch (e) {
    console.error("[CONFIG] Errore lettura config:", e);
    return { displayId: null };
  }
}

function saveConfig(config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config));
  } catch (e) {
    console.error("[CONFIG] Errore salvataggio config:", e);
  }
}

module.exports = { loadConfig, saveConfig };
