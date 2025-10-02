import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import electron from "electron";
import { Runner } from "@bros/runner";

const { app, BrowserWindow, ipcMain } = electron;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolvePreloadPath(): string {
  const localPreload = path.join(__dirname, "remote", "runner-bridge.cjs");
  if (fs.existsSync(localPreload)) {
    return localPreload;
  }

  const fallbackPreload = path.join(app.getAppPath(), "dist", "remote", "runner-bridge.cjs");
  if (fs.existsSync(fallbackPreload)) {
    return fallbackPreload;
  }

  throw new Error("Cannot locate runner preload script. Run 'pnpm --filter ./apps/desktop-app build:main' first.");
}

let runner: Runner | null = null;
let runnerProjectKey: string | null = null;

function ensureRunner(projectName: string): Runner {
  const trimmed = projectName.trim();
  const candidate = Runner.defaultProject(trimmed);
  if (!runner || runnerProjectKey !== candidate.projectName) {
    runner = candidate;
    runnerProjectKey = candidate.projectName;
    return runner;
  }

  return runner!;
}

function createWindow() {
  const preloadPath = resolvePreloadPath();
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false
    },
  });

  // Load Vite dev server in dev, or index.html in production
  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle("runner:up", async (_event, projectName: string) => {
    if (typeof projectName !== "string" || projectName.trim().length === 0) {
      throw new Error("runner:up requires a non-empty projectName.");
    }
    const instance = ensureRunner(projectName);
    await instance.up((message: string) => console.info(`[runner] ${message}`));
  });

  ipcMain.handle("runner:exec", async (_event, command: string) => {
    if (typeof command !== "string" || command.trim().length === 0) {
      throw new Error("runner:exec requires a non-empty command.");
    }
    if (!runner) {
      throw new Error("Runner not initialized. Call runner.up(projectName) first.");
    }
    return runner.exec(command, (message: string) => console.info(`[runner] ${message}`));
  });

  ipcMain.handle("runner:down", async () => {
    if (!runner) {
      return;
    }
    await runner.down((message: string) => console.info(`[runner] ${message}`));
    runner = null;
    runnerProjectKey = null;
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});


// ---------------- Google Login ----------------
ipcMain.handle("oauth-login-google", async () => {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=http://localhost:3000/google-callback&response_type=code&scope=openid%20email%20profile&access_type=offline`;

  shell.openExternal(authUrl);

  const appServer = express();
  const httpServer = appServer.listen(3000, () => {
    console.log("Google OAuth server listening on port 3000");
  });

  return new Promise((resolve) => {
    appServer.get("/google-callback", async (req, res) => {
      const code = req.query.code as string;

      try {
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri: "http://localhost:3000/google-callback",
            grant_type: "authorization_code",
          }),
        });

        const tokenData = await tokenResponse.json();
        console.log("Google Token:", tokenData);

        res.send("✅ Google login successful! You can close this window.");
        resolve({ success: true, token: tokenData.access_token });
      } catch (err) {
        console.error("Google OAuth error:", err);
        res.status(500).send("OAuth failed.");
        resolve({ success: false, error: (err as Error).message });
      } finally {
        httpServer.close();
      }
    });
  });
});
