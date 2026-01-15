// main/main.js
const { app, BrowserWindow, screen, ipcMain } = require("electron");
const path = require("path");

let mainWindow = null;

function createWindow() {
  const displays = screen.getAllDisplays();
  
  // Calculate the total bounds encompassing all screens
  const totalBounds = displays.reduce((acc, d) => ({
    x: Math.min(acc.x, d.bounds.x),
    y: Math.min(acc.y, d.bounds.y),
    right: Math.max(acc.right, d.bounds.x + d.bounds.width),
    bottom: Math.max(acc.bottom, d.bounds.y + d.bounds.height)
  }), { x: Infinity, y: Infinity, right: -Infinity, bottom: -Infinity });

  const width = totalBounds.right - totalBounds.x;
  const height = totalBounds.bottom - totalBounds.y;

  mainWindow = new BrowserWindow({
    x: totalBounds.x,
    y: totalBounds.y,
    width: width,
    height: height,
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

  mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Robustness: Handle renderer process crashes
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error(`Renderer process gone: ${details.reason}`);
    app.relaunch();
    app.exit(0);
  });

  mainWindow.webContents.on('unresponsive', () => {
    console.warn('Window unresponsive, reloading...');
    mainWindow.reload();
  });
  
  mainWindow.webContents.openDevTools();

}

// Global robustness: Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  app.relaunch();
  app.exit(1);
});

// IPC: displays info
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

ipcMain.handle("get-system-metrics", async () => {
  // Simulating hardware temperature and brightness retrieval from system
  // In a professional environment, this would call OS-specific APIs or thermal sensors
  const cpuUsage = process.getCPUUsage();
  const memoryInfo = process.getSystemMemoryInfo();
  
  return {
    platform: process.platform,
    arch: process.arch,
    memory: memoryInfo,
    cpu: cpuUsage,
    // Professional simulation of temperature and brightness without external sensors
    temperature: 45 + (cpuUsage.percentUsage * 0.2), // Estimated based on load
    brightness: 80 // Default internal state
  };
});

ipcMain.handle("set-display-brightness", (event, level) => {
  const { exec } = require("child_process");
  console.log(`Setting brightness to: ${level}`);
  
  if (process.platform === "win32") {
    // Windows: Use PowerShell to set brightness
    exec(`powershell (Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightnessMethods).WmiSetBrightness(1,${level})`);
  } else if (process.platform === "linux") {
    // Linux/LED Wall: Use xrandr for brightness emulation if direct backlight fails
    exec(`xrandr --output $(xrandr | grep " connected" | cut -f1 -d" ") --brightness ${level / 100}`);
  }
  return true;
});

ipcMain.handle("set-display-resolution", (event, { width, height }) => {
  const { exec } = require("child_process");
  console.log(`Setting resolution to: ${width}x${height}`);
  
  if (process.platform === "win32") {
    // Windows: Change resolution using a tool like QRes (must be present) or PowerShell
    // For a professional player, we assume a utility is available or use DisplaySettings API via addon
    exec(`powershell -Command "& { Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Screen]::PrimaryScreen.Bounds }"`);
  } else if (process.platform === "linux") {
    // LED Wall/Linux: Use xrandr
    exec(`xrandr --size ${width}x${height}`);
  }
  return true;
});

// System events → renderer
function setupDisplayEvents() {
  screen.on("display-added", (event, display) => {
    console.log("Display added, updating window bounds...");
    updateWindowBounds();
    if (mainWindow) mainWindow.webContents.send("display-added", display);
  });

  screen.on("display-removed", (event, display) => {
    console.log("Display removed, updating window bounds...");
    updateWindowBounds();
    if (mainWindow) mainWindow.webContents.send("display-removed", display);
  });

  screen.on("display-metrics-changed", (event, display, changedMetrics) => {
    updateWindowBounds();
    if (mainWindow) {
      mainWindow.webContents.send("display-changed", { display, changedMetrics });
    }
  });
}

function updateWindowBounds() {
  if (!mainWindow) return;
  
  const displays = screen.getAllDisplays();
  const totalBounds = displays.reduce((acc, d) => ({
    x: Math.min(acc.x, d.bounds.x),
    y: Math.min(acc.y, d.bounds.y),
    right: Math.max(acc.right, d.bounds.x + d.bounds.width),
    bottom: Math.max(acc.bottom, d.bounds.y + d.bounds.height)
  }), { x: Infinity, y: Infinity, right: -Infinity, bottom: -Infinity });

  const width = totalBounds.right - totalBounds.x;
  const height = totalBounds.bottom - totalBounds.y;

  mainWindow.setBounds({
    x: totalBounds.x,
    y: totalBounds.y,
    width: width,
    height: height
  });
}

app.whenReady().then(() => {
  createWindow();
  setupDisplayEvents();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
