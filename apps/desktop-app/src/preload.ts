import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  login: () => ipcRenderer.invoke("oauth-login"),
});
