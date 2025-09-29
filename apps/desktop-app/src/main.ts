import { app, BrowserWindow, ipcMain, shell } from "electron";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: __dirname + "/preload.js",
      contextIsolation: true,
      nodeIntegration: false,          
    },
  });

  mainWindow.loadURL("http://localhost:5173");
}


app.whenReady().then(createWindow);

// --- OAuth config ---
const CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const REDIRECT_URI = "http://localhost:3000/callback";

ipcMain.handle("oauth-login", async () => {
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=read:user user:email`;
  shell.openExternal(authUrl);

  const appServer = express();
  const httpServer = appServer.listen(3000, () => {
    console.log("OAuth server listening on port 3000");
  });

  return new Promise((resolve, reject) => {
    appServer.get("/callback", async (req, res) => {
      const code = req.query.code as string;

      try {
        const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code,
            redirect_uri: REDIRECT_URI,
          }),
        });

        const tokenData = await tokenResponse.json();
        console.log("GitHub Token:", tokenData);

        res.send("✅ Login successful! You can close this window.");

        resolve({
          success: true,
          token: tokenData.access_token,
        });
      } catch (err) {
        console.error("OAuth error:", err);
        res.status(500).send("OAuth failed.");
        resolve({
          success: false,
          error: (err as Error).message,
        });
      } finally {
        httpServer.close();
      }
    });
  });
});
