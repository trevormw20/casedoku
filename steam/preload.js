// Casedoku — Demo : preload (runs with contextIsolation ON, nodeIntegration OFF, sandbox ON).
// The web demo needs nothing from Node, so this only exposes a tiny read-only marker that the page
// MAY use to know it's running inside the desktop wrapper. No Node APIs are leaked to the page.
"use strict";

const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("casedokuDesktop", {
  isDesktop: true,
  platform: process.platform
});
