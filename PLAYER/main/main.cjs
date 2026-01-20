// main/main.js
const { app, BrowserWindow, screen, ipcMain } = require("electron");
const path = require("path");

let windowsByDisplayId = {};

function broadcastTopologyChanged() {
  for (const id in windowsByDisplayId) {
    const win = windowsByDisplayId[id];
    if (win && !win.isDestroyed()) {
      win.webContents.send("display-topology-changed");
    }
  }
}

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

function getWindowsDisplayIndex(screens) {
  // Ordina i display come fa Windows
  const sorted = [...screens].sort((a, b) => {
    if (a.bounds.x === b.bounds.x) {
      return a.bounds.y - b.bounds.y;
    }
    return a.bounds.x - b.bounds.x;
  });

  // Assegna l’indice Windows
  return sorted.map((d, i) => ({
    ...d,
    windowsIndex: i + 1, // DISPLAY1, DISPLAY2, DISPLAY3...
    windowsName: `DISPLAY${i + 1}`
  }));
}


// IPC: displays info (unchanged)
ipcMain.handle("get-displays", () => {
  const primaryId = screen.getPrimaryDisplay().id;
  const screens = screen.getAllDisplays().map(d => ({
    id: d.id,
    width: d.size.width,
    height: d.size.height,
    scaleFactor: d.scaleFactor,
    rotation: d.rotation,
    x: d.bounds.x,
    y: d.bounds.y,
    isPrimary: d.id === primaryId
  }));
  return getWindowsDisplayIndex(screens);
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

ipcMain.on("hide-cursor", (event, displayId) => {
  const win = windowsByDisplayId[displayId];
  if (win && !win.isDestroyed()) {
    win.setCursorVisibility(false);
  }
});

ipcMain.on("show-cursor", (event, displayId) => {
  const win = windowsByDisplayId[displayId];
  if (win && !win.isDestroyed()) {
    win.setCursorVisibility(true);
  }
});



ipcMain.handle("set-display-brightness", async (event, { windowindex, level }) => {
  const { exec } = require("child_process");

  level = Math.max(0, Math.min(100, Number(level)));
  windowindex = Number(windowindex);

  console.log(`Setting brightness for monitor ${windowindex} to ${level}`);

  return new Promise(resolve => {
    let cmd = null;
    // dX = monitor X
    cmd = `ClickMonitorDDC_7_2.exe d${windowindex} b ${level}`;

    if (!cmd) return resolve(false);

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error("Brightness error:", err);
        return resolve(false);
      }
      resolve(true);
    });
  });
});


ipcMain.handle("set-display-resolution", async (event, { hardware_id, width, height }) => {
  const { exec } = require("child_process");

  console.log(`Setting resolution for monitor ${hardware_id} to ${width}x${height}`);

  return new Promise(resolve => {
    let cmd = null;
    // QRes deve essere incluso nella tua app
    // /d:X = monitor X
    cmd = `QRes.exe /x:${width} /y:${height} /d:${hardware_id}`;

    if (!cmd) return resolve(false);

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error("Resolution error:", err);
        return resolve(false);
      }
      resolve(true);
    });
  });
});


// Multi-monitor lifecycle
function setupDisplayEvents() {
  screen.on("display-added", (event, display) => {
    console.log("Display added:", display.id);
    createWindowForDisplay(display);
	broadcastTopologyChanged();
  });

  screen.on("display-removed", (event, display) => {
    console.log("Display removed:", display.id);
    removeWindowForDisplay(display.id);
	broadcastTopologyChanged();
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
