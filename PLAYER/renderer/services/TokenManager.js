import { logInfo, logError } from "../utils/logger.js";

export class TokenManager {
  static instance = null;

  constructor(env) {
    if (TokenManager.instance) {
      return TokenManager.instance;
    }

    this.env = env;

    TokenManager.instance = this;
  }

  async getToken(displayId) {

    // 2) Richiesta al backend
	let ret = null;
	
    let resp;
    try {
      resp = await fetch(this.env.DISPLAY_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayId: displayId }),
      });
    } catch (err) {
      logError("Backend offline, entering offline mode:", err);
      return ret;
    }

    // 3) Errore backend → reset
    if (!resp.ok) {
      logError("Error getting display-token:", await resp.text());
      this.token = null;
      return ret;
    }

    // 4) Token valido
    const { token } = await resp.json();
    logInfo("Received token from backend");
    ret = token;


    return ret;
  }

}
