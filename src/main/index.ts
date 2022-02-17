import { RemoteApp } from "./remote-app";

import { app, BrowserWindow } from "electron";
import * as path from "path";
import * as url from "url";
import { logger } from "./logger";

logger.debug(`electron started with: ${process.argv.join(" ")}`);
// tremote://remote.js?action=https%3A%2F%2Fboxwise-dash.appspot.com%2F_ah%2Fapi%2Fcustomer%2Fv1%2Fget%3Fkey%3D5655602927763456%26secret%3DHGWhagNVGS627wedhfds
// var urlx = "tremote://remote.js?action=https%3A%2F%2Fboxwise-dash.appspot.com%2F_ah%2Fapi%2Fcustomer%2Fv1%2Fget%3Fkey%3D5655602927763456%26secret%3DHGWhagNVGS627wedhfds";
if ((module as any).hot != null) {
    logger.debug("hot module replacement found!");
}

var remoteApp: RemoteApp;

let myWindow = null
    
const gotTheLock = app.requestSingleInstanceLock()
    
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, argv, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (remoteApp?.window) {
      if (remoteApp.window.isMinimized()) remoteApp.window.restore()
      remoteApp.window.focus()
    }
    if (remoteApp) {
        return remoteApp.main(argv);
    }
    logger.error("unexpected situation singleInstance called but no remoteApp created");
  })
}

remoteApp = new RemoteApp();
global.app = remoteApp;
// remoteApp.executeUrl(urlx);
remoteApp.main(process.argv);

// // Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// app.on('activate', () => {
//     // On macOS it's common to re-create a window in the app when the
//     // dock icon is clicked and there are no other windows open.
//     if (win === null) {
//         createWindow()
//     }
// })

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.