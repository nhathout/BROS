import fs from "node:fs";
import path from "node:path";
import { app, BrowserWindow, ipcMain } from "electron";
import { Runner } from "@bros/runner";

function resolvePreloadPath(): string {
  const localPreload = path.join(__dirname, "remote", "runner-bridge.js");
  if (fs.existsSync(localPreload)) {
    return localPreload;
  }

  const fallbackPreload = path.join(app.getAppPath(), "dist", "remote", "runner-bridge.js");
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
    await instance.up((message) => console.info(`[runner] ${message}`));
  });

  ipcMain.handle("runner:exec", async (_event, command: string) => {
    if (typeof command !== "string" || command.trim().length === 0) {
      throw new Error("runner:exec requires a non-empty command.");
    }
    if (!runner) {
      throw new Error("Runner not initialized. Call runner.up(projectName) first.");
    }
    return runner.exec(command, (message) => console.info(`[runner] ${message}`));
  });

  ipcMain.handle("runner:down", async () => {
    if (!runner) {
      return;
    }
    await runner.down((message) => console.info(`[runner] ${message}`));
    runner = null;
    runnerProjectKey = null;
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
