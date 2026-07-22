const { app, BrowserWindow, globalShortcut, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow;
let nextProcess;

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
  });

  mainWindow.loadURL(`http://localhost:${port}`);

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startNextJsServer() {
  return new Promise((resolve, reject) => {
    const port = 3000; // In a production app, we would dynamically assign a free port.
    const isDev = !app.isPackaged;

    if (isDev) {
      // Dev mode: handled by concurrently, wait-on, just resolve
      resolve(port);
      return;
    }

    // Production mode: run standalone server
    const serverDir = path.join(process.resourcesPath, 'app.asar.unpacked', '.next', 'standalone');
    const serverPath = path.join(serverDir, 'server.js');
    
    // Database Template Setup
    const fs = require('fs');
    const dbPath = path.join(app.getPath('userData'), 'dev.db');
    if (!fs.existsSync(dbPath)) {
      const templateDb = path.join(serverDir, 'prisma', 'dev.db');
      if (fs.existsSync(templateDb)) {
        fs.copyFileSync(templateDb, dbPath);
      }
    }

    const env = {
      ...process.env,
      PORT: port.toString(),
      NODE_ENV: 'production',
      // Prisma SQLite path inside user data dir
      DATABASE_URL: `file:${dbPath}`,
    };

    nextProcess = spawn(process.execPath, [serverPath], {
      env,
      stdio: 'inherit',
      cwd: serverDir
    });

    // Simple health check polling
    const checkServer = () => {
      http.get(`http://localhost:${port}`, (res) => {
        if (res.statusCode === 200) {
          resolve(port);
        } else {
          setTimeout(checkServer, 500);
        }
      }).on('error', () => {
        setTimeout(checkServer, 500);
      });
    };

    setTimeout(checkServer, 500);
  });
}

let tray = null;

app.whenReady().then(async () => {
  const port = await startNextJsServer();
  createWindow(port);

  // Setup System Tray
  const iconPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'public', 'window.svg'); 
  // Note: fallback to default empty icon if SVG is not supported or missing
  const trayIcon = fs.existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : nativeImage.createEmpty();
  
  tray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show ContentOS Engine', click: () => mainWindow.show() },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.isQuitting = true; app.quit(); } }
  ]);
  
  tray.setToolTip('ContentOS Engine');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Register a global shortcut to toggle the app visibility
  globalShortcut.register('CommandOrControl+Shift+Space', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(port);
  });
});

app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  // Do nothing. The app stays active in the background.
});

app.on('before-quit', () => {
  if (nextProcess) {
    nextProcess.kill();
  }
});
