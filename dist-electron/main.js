"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
let mainWindow = null;
let serverProcess = null;
function startBackend() {
    const isDev = !electron_1.app.isPackaged;
    let backendPath;
    console.log(`Starting backend in ${isDev ? 'development' : 'production'} mode`);
    if (isDev) {
        backendPath = path_1.default.join(__dirname, '../server/src/index.ts');
        if (!fs_1.default.existsSync(backendPath)) {
            console.error(`Backend not found at: ${backendPath}`);
            return;
        }
        serverProcess = (0, child_process_1.spawn)('npx', ['tsx', backendPath], {
            stdio: 'pipe',
            env: { ...process.env, ELECTRON_RUNNING: 'true', PORT: '3000' }
        });
    }
    else {
        backendPath = path_1.default.join(process.resourcesPath, 'server/index.js');
        if (!fs_1.default.existsSync(backendPath)) {
            console.error(`Server not found at: ${backendPath}`);
            return;
        }
        serverProcess = (0, child_process_1.spawn)('node', [backendPath], {
            stdio: 'pipe',
            env: { ...process.env, ELECTRON_RUNNING: 'true', PORT: '3000' }
        });
    }
    if (serverProcess) {
        serverProcess.stdout?.on('data', (data) => {
            console.log(`[Backend]: ${data.toString()}`);
        });
        serverProcess.stderr?.on('data', (data) => {
            console.error(`[Backend Error]: ${data.toString()}`);
        });
        serverProcess.on('close', (code) => {
            console.log(`Backend process exited with code ${code}`);
        });
    }
}
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        title: 'POS Billing System',
        show: false
    });
    const isDev = !electron_1.app.isPackaged;
    mainWindow.once('ready-to-show', () => {
        if (mainWindow)
            mainWindow.show();
    });
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    }
    else {
        const indexPath = path_1.default.join(__dirname, '../dist/index.html');
        if (fs_1.default.existsSync(indexPath)) {
            mainWindow.loadFile(indexPath);
        }
        else {
            console.error(`Frontend not found at: ${indexPath}`);
            electron_1.app.quit();
        }
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
electron_1.app.whenReady().then(() => {
    startBackend();
    setTimeout(createWindow, 3000);
});
electron_1.app.on('window-all-closed', () => {
    if (serverProcess) {
        serverProcess.kill();
    }
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
process.on('SIGINT', () => {
    if (serverProcess)
        serverProcess.kill();
    electron_1.app.quit();
});
process.on('SIGTERM', () => {
    if (serverProcess)
        serverProcess.kill();
    electron_1.app.quit();
});
