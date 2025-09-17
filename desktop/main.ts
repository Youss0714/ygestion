import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';
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
let serverStarted = false;
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
const PORT = isDev ? 5000 : 5001;

// Start Express server for production using dynamic import
const startServer = async (): Promise<boolean> => {
  if (isDev || serverStarted) return serverStarted; // In development, use external server or already started

  try {
    // Check if backend server exists
    const serverPath = app.isPackaged
      ? path.join(process.resourcesPath, 'backend', 'index.js')
      : path.join(__dirname, '..', '..', 'dist', 'index.js');

    console.log('🔍 Looking for backend server at:', serverPath);

    if (!require('fs').existsSync(serverPath)) {
      console.error('⚠️ Backend server not found at:', serverPath);
      return false;
    }

    console.log('🚀 Starting embedded backend server...');

    // Set environment variables for the server
    process.env.ELECTRON_RUN = 'true';
    process.env.NODE_ENV = 'production';
    process.env.PORT = PORT.toString();

    console.log('🌍 Server environment configured with DATABASE_URL:',
      process.env.DATABASE_URL ? 'Found' : 'Missing');

    // Import and start the server directly in this process
    const serverUrl = pathToFileURL(serverPath).href;
    await import(serverUrl);

    console.log('✅ Embedded backend server imported, checking readiness...');

    // Wait for server to be ready and only set serverStarted if successful
    const isReady = await waitForServer(PORT);
    if (isReady) {
      serverStarted = true;
      console.log('✅ Embedded backend server is ready on port', PORT);
    } else {
      console.error('❌ Server import succeeded but failed readiness check');
    }

    return isReady;

  } catch (error) {
    console.error('❌ Error starting embedded server:', error);
    return false;
  }
};

// Helper function to wait for server readiness
const waitForServer = async (port: number, maxAttempts = 30): Promise<boolean> => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(`http://localhost:${port}/api/user`);
      // We expect a 401 response for the /api/user endpoint when not authenticated
      if (response.status === 401 || response.status === 200) {
        console.log(`✅ Server is ready on port ${port} (attempt ${attempt})`);
        return true;
      }
    } catch (error) {
      // Server not ready yet, wait and try again
      console.log(`⏳ Waiting for server... (attempt ${attempt}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  console.error('❌ Server failed to become ready within timeout period');
  return false;
};

// Helper functions for error pages
const showErrorPage = async (message: string) => {
  if (!mainWindow) return;
  
  const errorHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>YGestion - Error</title>
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
      </style>
    </head>
    <body>
      <div class="container">
        <div class="error-icon">⚠️</div>
        <h1>Application Error</h1>
        <p>${message}</p>
        <p>Please try restarting the application.</p>
      </div>
    </body>
    </html>
  `;
  
  await mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`);
};

const showDevErrorPage = async () => {
  if (!mainWindow) return;
  
  const errorHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>YGestion - Development Server Error</title>
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
        <h1>Development Server Not Running</h1>
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
};

const showProductionErrorPage = async () => {
  if (!mainWindow) return;
  
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
        .error-icon { font-size: 4rem; color: #e74c3c; margin-bottom: 1rem; }
        h1 { color: #e74c3c; margin-bottom: 1rem; }
        p { margin-bottom: 0.5rem; line-height: 1.6; }
        .details { background: #f8f9fa; padding: 1rem; border-radius: 4px; margin-top: 1rem; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="error-icon">⚠️</div>
        <h1>Server Failed to Start</h1>
        <p>The application server could not be started.</p>
        <p>This may be due to a missing configuration or dependencies.</p>
        <div class="details">
          <strong>Please ensure:</strong><br>
          • Database connection is configured<br>
          • All required files are present<br>
          • Environment variables are set
        </div>
        <p>Try reinstalling the application if the problem persists.</p>
      </div>
    </body>
    </html>
  `;
  
  await mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`);
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
  // Create the browser window first (hidden)
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true, // Keep security enabled
    },
    show: false,
    titleBarStyle: 'default',
    title: 'YGestion - Gestion Commerciale et Comptable',
    autoHideMenuBar: true // Hide menu bar (File, Edit, View, Window, Help)
  });

  let serverReady = false;

  // Start server after window creation
  if (!isDev) {
    console.log('🚀 Production mode: starting embedded server...');
    try {
      serverReady = await startServer();
    } catch (error) {
      console.error('❌ Failed to start production server:', error);
      serverReady = false;
    }
  } else {
    console.log('🔧 Development mode: checking for existing server...');
    // In development, test if server is available
    try {
      const response = await fetch('http://localhost:5000/api/user');
      serverReady = true;
      console.log('✅ Development server is already running and responding');
    } catch (error) {
      console.log('⚠️ Development server not responding');
      console.log('💡 Please run "npm run dev" in the main directory first');
      serverReady = false;
    }
  }

  // Remove application menu completely
  Menu.setApplicationMenu(null);

  // Load the app only if server is ready
  if (serverReady) {
    const appUrl = `http://localhost:${PORT}`;
    console.log(`📱 Loading application from: ${appUrl}`);

    try {
      await mainWindow.loadURL(appUrl);
      console.log('✅ Application loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load application from URL:', error);
      showErrorPage('Failed to connect to server');
    }
  } else {
    console.error('❌ Server not ready, showing error page');
    if (isDev) {
      showDevErrorPage();
    } else {
      showProductionErrorPage();
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
  // On OS X, keep the app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Before quit, clean up
app.on('before-quit', () => {
  console.log('🔄 Cleaning up resources before quit...');
  // The embedded server will automatically close with the process
});