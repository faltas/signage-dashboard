// renderer/services/CommandManager.js - Modular Command Management
import { logInfo, logError } from "../utils/logger.js";

export class CommandManager {
  constructor() {
    this.commandChannel = null;
    this.handlers = {};
  }

  startListener(displayId, handlers) {
    this.handlers = handlers;

    const handleCommand = async (command) => {
      try {
        logInfo("Received command:", command.command_type);

        switch (command.command_type) {
          case "reload_playlist":
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
            logInfo("Unknown command type:", command.command_type);
        }

        // Mark command as executed
        await window.supabaseAPI.markCommandExecuted(command.id);
      } catch (err) {
        logError("Error handling command:", err);
      }
    };

    this.commandChannel = window.SupaRT.listenCommands(displayId, handleCommand);
  }

  stopListener() {
    if (this.commandChannel) {
      this.commandChannel.unsubscribe();
      this.commandChannel = null;
    }
  }
}