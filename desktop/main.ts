import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { spawn, ChildProcess } from 'child_process';
import dotenv from 'dotenv';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
const envPath = app.isPackaged
  ? path.join(process.resourcesPath, '.env')
  : path.join(__dirname, '..', '.env');

console.log('🔧 Loading environment from:', envPath);
dotenv.config({ path: envPath });

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;
let server: any = null;
let backendProcess: ChildProcess | null = null;
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
const PORT = isDev ? 5000 : 5001;

// Start Express server for production
const startServer = async () => {
  if (isDev) return; // In development, use external server

  try {
    // Check if backend server exists
    const serverPath = app.isPackaged
      ? path.join(process.resourcesPath, 'backend', 'index.js')
      : path.join(__dirname, '..', '..', 'dist', 'index.js');

    console.log('🔍 Looking for backend server at:', serverPath);

    if (require('fs').existsSync(serverPath)) {
      // Start the full backend server as a separate process
      console.log('🚀 Starting full backend server...');

      const serverEnv = {
        ...process.env,
        NODE_ENV: 'production',
        PORT: PORT.toString(),
        DATABASE_URL: process.env.DATABASE_URL,
        SESSION_SECRET: process.env.SESSION_SECRET,
        ADMIN_TOKEN: process.env.ADMIN_TOKEN
      };

      console.log('🌍 Server environment configured with DATABASE_URL:',
        process.env.DATABASE_URL ? 'Found' : 'Missing');

      backendProcess = spawn('node', [serverPath], {
        env: serverEnv,
        stdio: ['inherit', 'pipe', 'pipe']
      });

      backendProcess.stdout?.on('data', (data) => {
        console.log('📡 Backend:', data.toString().trim());
      });

      backendProcess.stderr?.on('data', (data) => {
        console.error('🚨 Backend Error:', data.toString().trim());
      });

      backendProcess.on('error', (error) => {
        console.error('❌ Failed to start backend process:', error);
        startFallbackServer();
      });

      backendProcess.on('exit', (code) => {
        console.log(`Backend process exited with code ${code}`);
        if (code !== 0) {
          startFallbackServer();
        }
      });

      console.log('✅ Backend server process started on port', PORT);

      // Wait a moment for the server to start up
      await new Promise(resolve => setTimeout(resolve, 2000));

    } else {
      console.log('⚠️ Backend server not found');
      startFallbackServer();
      return; // Don't try to load the app if no backend
    }
  } catch (error) {
    console.error('❌ Error starting server:', error);
    startFallbackServer();
  }
};

const startFallbackServer = () => {
  console.log('🔄 Starting fallback mode...');
  console.log('⚠️ Backend server could not be started. The app will work in limited mode.');

  // Show an error dialog to the user
  if (mainWindow) {
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>YGestion - Erreur</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex; align-items: center; justify-content: center; 
            height: 100vh; margin: 0; background: #f5f5f5; color: #333;
          }
          .container { 
            text-align: center; padding: 2rem; background: white; 
            border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 500px;
          }
          .error-icon { font-size: 4rem; color: #e74c3c; margin-bottom: 1rem; }
          h1 { color: #e74c3c; margin-bottom: 1rem; }
          p { margin-bottom: 0.5rem; line-height: 1.6; }
          .details { background: #f8f9fa; padding: 1rem; border-radius: 4px; margin-top: 1rem; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error-icon">⚠️</div>
          <h1>Erreur de démarrage</h1>
          <p>Le serveur backend n'a pas pu démarrer.</p>
          <p>Vérifiez que le fichier .env est présent et contient les bonnes configurations.</p>
          <div class="details">
            <strong>Variables requises :</strong><br>
            • DATABASE_URL<br>
            • SESSION_SECRET<br>
            • ADMIN_TOKEN
          </div>
        </div>
      </body>
      </html>
    `;
    mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`);
  }
};

const createWindow = async (): Promise<void> => {
  let serverReady = false;

  // Start server first in production
  if (!isDev) {
    console.log('🚀 Production mode: starting embedded server...');
    await startServer();
    // Wait a moment for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    serverReady = true;
  } else {
    console.log('🔧 Development mode: checking for existing server...');
    // In development, test if server is available, if not start it automatically
    try {
      const response = await fetch('http://localhost:5000/api/user');
      serverReady = true;
      console.log('✅ Development server is already running and responding');
    } catch (error) {
      console.log('⚠️ Development server not responding, starting automatically...');

      // Start the development server automatically
      const serverPath = path.join(__dirname, '..', '..', 'dist', 'index.js');
      console.log('🔍 Looking for development server at:', serverPath);

      if (require('fs').existsSync(serverPath)) {
        console.log('🚀 Starting development server automatically...');

        const serverEnv = {
          ...process.env,
          NODE_ENV: 'development',
          PORT: '5000',
          DATABASE_URL: process.env.DATABASE_URL,
          SESSION_SECRET: process.env.SESSION_SECRET,
          ADMIN_TOKEN: process.env.ADMIN_TOKEN
        };

        console.log('🌍 Development server environment configured with DATABASE_URL:',
          process.env.DATABASE_URL ? 'Found' : 'Missing');

        backendProcess = spawn('node', [serverPath], {
          env: serverEnv,
          stdio: ['inherit', 'pipe', 'pipe'],
          cwd: path.join(__dirname, '..', '..')
        });

        backendProcess.stdout?.on('data', (data) => {
          console.log('📡 Dev Backend:', data.toString().trim());
        });

        backendProcess.stderr?.on('data', (data) => {
          console.error('🚨 Dev Backend Error:', data.toString().trim());
        });

        backendProcess.on('error', (error) => {
          console.error('❌ Failed to start development backend process:', error);
          serverReady = false;
        });

        console.log('✅ Development backend server process started on port 5000');

        // Wait for the server to start up
        await new Promise(resolve => setTimeout(resolve, 3000));
        serverReady = true;

      } else {
        console.log('⚠️ Development backend server not found at:', serverPath);
        console.log('💡 Please run "npm run build" in the main directory first');
        serverReady = false;
      }
    }
  }

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Allow local connections
    },
    show: false,
    titleBarStyle: 'default',
    title: 'YGestion - Gestion Commerciale et Comptable'
  });

  // Load the app
  const appUrl = `http://localhost:${PORT}`;
  console.log(`📱 Loading application from: ${appUrl}`);

  try {
    await mainWindow.loadURL(appUrl);
    console.log('✅ Application loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load application:', error);

    if (isDev) {
      // In development mode, show a helpful error page
      const errorHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>YGestion - Server Error</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex; align-items: center; justify-content: center; 
              height: 100vh; margin: 0; background: #f5f5f5; color: #333;
            }
            .container { 
              text-align: center; padding: 2rem; background: white; 
              border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              max-width: 500px;
            }
            .error-icon { font-size: 4rem; margin-bottom: 1rem; }
            h1 { color: #e74c3c; margin-bottom: 1rem; }
            .instructions { 
              background: #f8f9fa; padding: 1rem; border-radius: 4px; 
              margin: 1rem 0; text-align: left; font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error-icon">⚠️</div>
            <h1>Server Not Running</h1>
            <p>The development server is not running on port 5000.</p>
            <p><strong>To fix this:</strong></p>
            <div class="instructions">
              1. Open a terminal in the main project directory<br>
              2. Run: <strong>npm run dev</strong><br>
              3. Wait for the server to start<br>
              4. Restart this Electron app
            </div>
            <p>Once the server is running, refresh this window or restart the app.</p>
          </div>
        </body>
        </html>
      `;

      await mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`);
    }
  }

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Security: prevent new window creation
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });
};

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  // On OS X, re-create a window when the dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // Close server if running
  if (server) {
    server.close();
  }

  // Kill backend process if running
  if (backendProcess) {
    backendProcess.kill();
  }

  // On OS X, keep the app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Before quit, clean up
app.on('before-quit', () => {
  if (server) {
    server.close();
  }

  if (backendProcess) {
    backendProcess.kill();
  }
});