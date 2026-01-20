// renderer/services/CommandManager.js - Modular Command Management
import { logInfo, logError } from "../utils/logger.js";

// CommandManager.js

export class CommandManager {
  constructor(env) {
    this.commandChannel = null;
    this.handlers = {};
    this.env = env;
    this.queue = [];
    this.processing = false;
  }

  async startListener(displayId, handlers) {
    this.handlers = handlers;

    const enqueue = (command) => {
      this.queue.push(command);
      this.processNext();
    };

    this.commandChannel = await window.SupaRT.listenCommands(displayId, enqueue);
  }

  async processNext() {
    if (this.processing) return;
    const command = this.queue.shift();
    if (!command) return;

    this.processing = true;
    try {
      await this.handleCommand(command);
      await window.supabaseAPI.markCommandExecuted(command.id);
    } catch (err) {
      logError("Error handling command:", err);
    } finally {
      this.processing = false;
      if (this.queue.length > 0) this.processNext();
    }
  }

  async handleCommand(command) {
    logInfo("Received command:", command.type);

    switch (command.type) {
      case "assignPlaylist":
        if (this.handlers.reloadPlaylist) {
          await this.handlers.reloadPlaylist();
        }
        break;

      case "force_scene":
        if (this.handlers.forceScene && command.params?.scene_id) {
          await this.handlers.forceScene(command.params.scene_id);
        }
        break;

      case "set_brightness":
        if (command.params?.level !== undefined) {
          await window.System.setBrightness(command.params.level);
        }
        break;

      case "set_resolution":
        if (command.params?.width && command.params?.height) {
          await window.System.setResolution(command.params.width, command.params.height);
        }
        break;

      case "restart":
        location.reload();
        break;

      default:
        logInfo("Unknown command type:", command.type);
    }
  }

  stopListener() {
    if (this.commandChannel) {
      this.commandChannel.unsubscribe();
      this.commandChannel = null;
    }
    this.queue = [];
    this.processing = false;
  }
}
