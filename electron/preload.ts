import { contextBridge } from 'electron';
import { app } from 'electron/main';

contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  isPackaged: () => app.isPackaged,
  getVersion: () => process.env.npm_package_version || '1.0.0'
});