const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow = null;
let serverProcess = null;

function startBackend() {
  const isDev = !app.isPackaged;
  let backendPath;

  console.log(`Starting backend in ${isDev ? 'development' : 'production'} mode`);

  if (isDev) {
    backendPath = path.join(__dirname, '../server/src/index.ts');
    if (!fs.existsSync(backendPath)) {
      console.error(`Backend not found at: ${backendPath}`);
      return;
    }
    serverProcess = spawn('npx', ['tsx', backendPath], {
      stdio: 'pipe',
      env: { ...process.env, ELECTRON_RUNNING: 'true', PORT: '3000' }
    });
  } else {
    backendPath = path.join(process.resourcesPath, 'server/index.js');
    if (!fs.existsSync(backendPath)) {
      console.error(`Server not found at: ${backendPath}`);
      return;
    }
    serverProcess = spawn('node', [backendPath], {
      stdio: 'pipe',
      env: { ...process.env, ELECTRON_RUNNING: 'true', PORT: '3000' }
    });
  }

  if (serverProcess) {
    serverProcess.stdout.on('data', (data) => {
      console.log(`[Backend]: ${data.toString()}`);
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`[Backend Error]: ${data.toString()}`);
    });

    serverProcess.on('close', (code) => {
      console.log(`Backend process exited with code ${code}`);
    });
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
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

  const isDev = !app.isPackaged;
  
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) mainWindow.show();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    } else {
      console.error(`Frontend not found at: ${indexPath}`);
      app.quit();
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startBackend();
  setTimeout(createWindow, 3000);
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

process.on('SIGINT', () => {
  if (serverProcess) serverProcess.kill();
  app.quit();
});

process.on('SIGTERM', () => {
  if (serverProcess) serverProcess.kill();
  app.quit();
});
