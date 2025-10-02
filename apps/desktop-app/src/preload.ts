import { contextBridge, ipcRenderer } from "electron";
import type { ExecResult } from "@bros/runner";

// OAuth APIs
contextBridge.exposeInMainWorld("electron", {
  login: () => ipcRenderer.invoke("oauth-login"),             // GitHub
  loginGoogle: () => ipcRenderer.invoke("oauth-login-google") // Google
});

// Runner APIs
contextBridge.exposeInMainWorld("runner", {
  up: (projectName: string) => ipcRenderer.invoke("runner:up", projectName),
  exec: (command: string): Promise<ExecResult> =>
    ipcRenderer.invoke("runner:exec", command),
  down: () => ipcRenderer.invoke("runner:down"),
});
