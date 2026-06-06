// Casedoku — Demo : Electron main process.
// Wraps the EXISTING web demo (../demo/index.html) in a desktop window. Web + desktop share one
// source — nothing is copied into the repo. The demo's relative ../assets/ paths resolve because
// demo/ and assets/ stay siblings both in dev (repo root) and when packaged (resources/).
"use strict";

const { app, BrowserWindow, shell, Menu } = require("electron");
const path = require("path");

// In a packaged build the web files live in resources/ (see extraResources in package.json).
// In dev they live at the repo root, one level up from this folder.
function demoIndexPath() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "demo", "index.html")
    : path.join(__dirname, "..", "demo", "index.html");
}

function isExternal(url) {
  return /^https?:\/\//i.test(url) || /^mailto:/i.test(url);
}

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,            // Steam Deck native resolution
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "Casedoku — Demo",
    backgroundColor: "#0d0f14",
    autoHideMenuBar: true,                       // hidden menu bar (revealable with Alt only if a menu existed)
    icon: path.join(__dirname, "build", process.platform === "win32" ? "icon.ico" : "icon.png"),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,                    // page cannot reach Node
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  });

  Menu.setApplicationMenu(null);                 // no application menu at all
  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.loadFile(demoIndexPath());

  // External links (the demo's CTA buttons use window.open; any target=_blank too) -> default browser.
  // The Steam in-game overlay browser picks these up on Steam/Deck.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isExternal(url)) shell.openExternal(url);
    return { action: "deny" };                   // never open a second Electron window
  });

  // Block any in-app navigation away from the demo; send real http(s) links to the browser instead.
  mainWindow.webContents.on("will-navigate", (e, url) => {
    if (url !== mainWindow.webContents.getURL()) {
      e.preventDefault();
      if (isExternal(url)) shell.openExternal(url);
    }
  });

  // F11 toggles fullscreen; Esc only LEAVES fullscreen (never quits the app).
  mainWindow.webContents.on("before-input-event", (e, input) => {
    if (input.type !== "keyDown") return;
    if (input.key === "F11") {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
      e.preventDefault();
    } else if (input.key === "Escape" && mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(false);
      e.preventDefault();
    }
  });

  mainWindow.on("closed", () => { mainWindow = null; });
}

// Single instance — a second launch focuses the existing window (Steam may re-launch).
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.focus(); }
  });
  app.whenReady().then(() => {
    createWindow();
    app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  });
  app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
}
