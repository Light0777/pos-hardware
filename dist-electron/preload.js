"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const main_1 = require("electron/main");
electron_1.contextBridge.exposeInMainWorld('electron', {
    platform: process.platform,
    isPackaged: () => main_1.app.isPackaged,
    getVersion: () => process.env.npm_package_version || '1.0.0'
});
