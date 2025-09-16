import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import dotenv from "dotenv";

// Charge les variables d'environnement
// En mode Electron packagé, chercher le .env dans le dossier resources
const isElectron = process.env.npm_config_user_config?.includes('electron') || 
                 process.argv.some(arg => arg.includes('electron')) ||
                 process.env.ELECTRON_RUN === 'true';

const envPath = isElectron && process.env.NODE_ENV === "production"
  ? (process as any).resourcesPath ? `${(process as any).resourcesPath}/.env` : "./.env"
  : process.env.NODE_ENV === "production" ? "./.env.production" : "./.env";

console.log('🔧 Loading environment from:', envPath);
dotenv.config({ path: envPath });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware de journalisation API
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Middleware de gestion des erreurs
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Setup Vite uniquement en développement (mais pas depuis Electron)
  if (app.get("env") === "development" && !isElectron) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Démarrage du serveur
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`✅ Server running on port ${port}`);
  });
})();
