const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

process.env.USER_DATA_PATH = app.getPath('userData');
console.log('USER_DATA_PATH set to:', process.env.USER_DATA_PATH);

let mainWindow = null;
let serverProcess = null;

function startBackend() {
  const isDev = !app.isPackaged;
  let backendPath;

  console.log(`Starting backend in ${isDev ? 'development' : 'production'} mode`);
  console.log('App is packaged:', app.isPackaged);
  console.log('Resources path:', process.resourcesPath);

  if (isDev) {
    backendPath = path.join(__dirname, '../server/src/index.ts');
    console.log(`Looking for dev backend at: ${backendPath}`);
    if (!fs.existsSync(backendPath)) {
      console.error(`Backend not found at: ${backendPath}`);
      return;
    }
    serverProcess = spawn('npx.cmd', ['tsx', backendPath], {
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, ELECTRON_RUNNING: 'true', PORT: '3000' }
    });
  } else {
    const possiblePaths = [
      path.join(process.resourcesPath, 'server/index.cjs'),
      path.join(__dirname, '../server/dist/index.cjs'),
      path.join(process.resourcesPath, 'app.asar/server/index.cjs')
    ];

    console.log('Trying possible backend paths:', possiblePaths);

    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        backendPath = testPath;
        console.log(`Found backend at: ${backendPath}`);
        break;
      }
    }

    if (!backendPath) {
      console.error('Server not found in any location');
      return;
    }

    const userDataPath = app.getPath('userData');
    const nodePath = path.join(process.resourcesPath, 'node_modules');
    const electronNodePath = process.execPath;

    serverProcess = spawn(electronNodePath, [backendPath], {
      stdio: 'pipe',
      cwd: process.resourcesPath,
      env: {
        ...process.env,
        PORT: '3000',
        NODE_ENV: 'production',
        NODE_PATH: nodePath,
        RESOURCES_PATH: process.resourcesPath,
        USER_DATA_PATH: userDataPath,
        ELECTRON_RUN_AS_NODE: '1'
      }
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
    console.log(`Looking for frontend at: ${indexPath}`);
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
      mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.executeJavaScript(`window.location.hash = '#/'`);
      });
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
