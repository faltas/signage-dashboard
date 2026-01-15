// main/main.js
const { app, BrowserWindow, screen, ipcMain } = require("electron");
const path = require("path");

let windowsByDisplayId = {};

// Create a window for a specific physical display
function createWindowForDisplay(display) {
  const win = new BrowserWindow({
    x: display.bounds.x,
    y: display.bounds.y,
    width: display.bounds.width,
    height: display.bounds.height,
    fullscreen: true,
    frame: false,
    kiosk: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  win.loadFile(path.join(__dirname, "../renderer/index.html"));
  windowsByDisplayId[display.id] = win;

  // Robustness
  win.webContents.on("render-process-gone", (event, details) => {
    console.error(`Renderer process gone on display ${display.id}: ${details.reason}`);
    app.relaunch();
    app.exit(0);
  });

  win.webContents.on("unresponsive", () => {
    console.warn(`Window unresponsive on display ${display.id}, reloading...`);
    win.reload();
  });

  win.on("closed", () => {
    delete windowsByDisplayId[display.id];
  });

  return win;
}

function removeWindowForDisplay(displayId) {
  const win = windowsByDisplayId[displayId];
  if (win) {
    win.close();
    delete windowsByDisplayId[displayId];
  }
}

// IPC: displays info (unchanged)
ipcMain.handle("get-displays", () => {
  const primaryId = screen.getPrimaryDisplay().id;
  return screen.getAllDisplays().map(d => ({
    id: d.id,
    width: d.size.width,
    height: d.size.height,
    scaleFactor: d.scaleFactor,
    rotation: d.rotation,
    x: d.bounds.x,
    y: d.bounds.y,
    isPrimary: d.id === primaryId
  }));
});

// NEW: which physical display is THIS window on?
ipcMain.handle("get-current-display", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return null;
  const bounds = win.getBounds();
  const display = screen.getDisplayMatching(bounds);
  if (!display) return null;

  const primaryId = screen.getPrimaryDisplay().id;
  return {
    id: display.id,
    width: display.size.width,
    height: display.size.height,
    scaleFactor: display.scaleFactor,
    rotation: display.rotation,
    x: display.bounds.x,
    y: display.bounds.y,
    isPrimary: display.id === primaryId
  };
});

// System metrics + brightness + resolution → tieni i tuoi handler
// (li copio identici dal tuo file, puoi riusare quelli)

ipcMain.handle("get-system-metrics", async () => {
  const cpuUsage = process.getCPUUsage();
  const memoryInfo = process.getSystemMemoryInfo();
  
  return {
    platform: process.platform,
    arch: process.arch,
    memory: memoryInfo,
    cpu: cpuUsage,
    temperature: 45 + (cpuUsage.percentUsage * 0.2),
    brightness: 80
  };
});

ipcMain.handle("set-display-brightness", (event, level) => {
  const { exec } = require("child_process");
  console.log(`Setting brightness to: ${level}`);
  
  if (process.platform === "win32") {
    exec(`powershell (Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightnessMethods).WmiSetBrightness(1,${level})`);
  } else if (process.platform === "linux") {
    exec(`xrandr --output $(xrandr | grep " connected" | cut -f1 -d" ") --brightness ${level / 100}`);
  }
  return true;
});

ipcMain.handle("set-display-resolution", (event, { width, height }) => {
  const { exec } = require("child_process");
  console.log(`Setting resolution to: ${width}x${height}`);
  
  if (process.platform === "win32") {
    exec(`powershell -Command "& { Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Screen]::PrimaryScreen.Bounds }"`);
  } else if (process.platform === "linux") {
    exec(`xrandr --size ${width}x${height}`);
  }
  return true;
});

// Multi-monitor lifecycle
function setupDisplayEvents() {
  screen.on("display-added", (event, display) => {
    console.log("Display added:", display.id);
    createWindowForDisplay(display);
  });

  screen.on("display-removed", (event, display) => {
    console.log("Display removed:", display.id);
    removeWindowForDisplay(display.id);
  });
}

app.whenReady().then(() => {
  // One window per connected display
  screen.getAllDisplays().forEach(display => {
    createWindowForDisplay(display);
  });

  setupDisplayEvents();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      screen.getAllDisplays().forEach(display => {
        createWindowForDisplay(display);
      });
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Global robustness
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  app.relaunch();
  app.exit(1);
});
