// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

// Expose a simple API for getting system audio
contextBridge.exposeInMainWorld("systemAudio", {
  getSource: async () => {
    try {
      if (!ipcRenderer) {
        throw new Error("IPC Renderer not available");
      }
      console.log("Preload: Requesting system audio source...");
      const source = await ipcRenderer.invoke("GET_SYSTEM_AUDIO");
      if (!source) {
        throw new Error("No source returned from main process");
      }
      console.log("Preload: Got source:", source);
      return source;
    } catch (error) {
      console.error("Preload: Error getting source:", error);
      throw error;
    }
  },
});
