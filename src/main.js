import { app, BrowserWindow, ipcMain, desktopCapturer } from "electron";
import path from "path";

// @ts-expect-error -> In vite there are no types for the following line. Electron forge error
import started from "electron-squirrel-startup";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) app.quit();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require("electron-squirrel-startup")) {
//   app.quit();
// }

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 250,
    // resizable: false,
    fullscreenable: false,
    titleBarStyle: "hidden",
    skipTaskbar: true,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.setAspectRatio(600 / 250);

  // Set system media permissions
  mainWindow.webContents.session.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      const allowedPermissions = ["media", "desktop-capture"];
      if (allowedPermissions.includes(permission)) {
        callback(true);
      } else {
        callback(false);
      }
    }
  );

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // const childWindow = new BrowserWindow({
  //   parent: mainWindow,
  //   width: 500,
  //   height: 500,
  //   // resizable: false,
  //   // titleBarStyle: "hidden",
  //   // skipTaskbar: true,
  //   // alwaysOnTop: true,
  //   // transparent: true,
  // });
  // childWindow.setAspectRatio(1 / 1);
  // // childWindow.loadFile("./cat.html");
  // // childWindow.once("ready-to-show", () => {
  // //   childWindow.show();
  // // });
  // childWindow.webContents.session.setPermissionRequestHandler(
  //   (webContents, permission, callback) => {
  //     const allowedPermissions = ["media"];
  //     if (allowedPermissions.includes(permission)) {
  //       callback(true);
  //     } else {
  //       callback(false);
  //     }
  //   }
  // );
  // if (MODAL_WINDOW_VITE_DEV_SERVER_URL) {
  //   childWindow.loadURL(MODAL_WINDOW_VITE_DEV_SERVER_URL);
  // } else {
  //   childWindow.loadFile(
  //     path.join(__dirname, `../renderer/${MODAL_WINDOW_VITE_NAME}/index.html`)
  //   );
  // }

  // childWindow.webContents.openDevTools();
}

// Wait for app to be ready before setting up IPC
app.whenReady().then(() => {
  // Set up IPC handler first
  ipcMain.handle("GET_SYSTEM_AUDIO", async () => {
    try {
      console.log("Main: Getting system audio sources...");
      const sources = await desktopCapturer.getSources({
        types: ["screen"],
        thumbnailSize: { width: 0, height: 0 },
      });
      console.log("Main: Got sources:", sources);
      if (!sources || sources.length === 0) {
        throw new Error("No audio sources found");
      }
      return sources[0];
    } catch (error) {
      console.error("Main: Error getting sources:", error);
      throw error;
    }
  });

  // Then create window
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
