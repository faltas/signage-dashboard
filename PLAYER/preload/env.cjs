const fs = require("fs");
const path = require("path");

function Env() {
  const filePath = path.join(__dirname, "env.json");

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Errore caricando env.json:", err);
    return {};
  }
}

module.exports = { Env };
