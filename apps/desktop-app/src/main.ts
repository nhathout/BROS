import { app, BrowserWindow, ipcMain, shell } from "electron";
import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";

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

// ---------------- GitHub Login ----------------
ipcMain.handle("oauth-login", async () => {
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
  const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
  const REDIRECT_URI = "http://localhost:3000/github-callback";

  return new Promise((resolve) => {
    const appServer = express();

    const httpServer = appServer.listen(3000, () => {
      console.log("GitHub OAuth server listening on port 3000");

      // ✅ Open login URL once server is ready
      const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=read:user user:email`;
      shell.openExternal(authUrl);
    });

    // 👇 now listening on /github-callback, not /callback
    appServer.get("/github-callback", async (req, res) => {
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
            redirect_uri: REDIRECT_URI, // 👈 must match exactly
          }),
        });

        const tokenData = await tokenResponse.json();
        console.log("GitHub Token:", tokenData);

        res.send("✅ GitHub login successful! You can close this window.");
        resolve({ success: true, token: tokenData.access_token });
      } catch (err) {
        console.error("GitHub OAuth error:", err);
        res.status(500).send("OAuth failed.");
        resolve({ success: false, error: (err as Error).message });
      } finally {
        httpServer.close();
      }
    });
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
