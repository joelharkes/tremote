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

var shouldQuit = app.makeSingleInstance(function (args: string[], cwd: string) {
    // Someone tried to run a second instance, we should focus our window.
    logger.info(`awake triggered: ${args.join(" ")}`);
    if (remoteApp && remoteApp.window) {
        if (remoteApp.window.isMinimized()) {
            remoteApp.window.restore();
        }
        remoteApp.window.focus();
    }
    if (remoteApp) {
        return remoteApp.main(args);
    }
    logger.error("unexpected situation singleInstance called but no remoteApp created");
});

if (shouldQuit) {
    app.quit();
} else {
    remoteApp = new RemoteApp();
    global.app = remoteApp;
    // remoteApp.executeUrl(urlx);
    remoteApp.main(process.argv);
}

// keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
//let win

// so we respond to tremote://

// function createWindow() {
//     // Create the browser window.
//     win = new BrowserWindow({ width: 800, height: 600 })
//     console.log(process.argv);

//     // and load the index.html of the app.
//     win.loadURL(url.format({
//         pathname: path.join(__dirname, 'index.html'),
//         protocol: 'file:',
//         slashes: true
//     }))

//     // Open the DevTools.
//     win.webContents.openDevTools()

//     // Emitted when the window is closed.
//     win.on('closed', () => {
//         // Dereference the window object, usually you would store windows
//         // in an array if your app supports multi windows, this is the time
//         // when you should delete the corresponding element.
//         win = null
//     })
// }

// // This method will be called when Electron has finished
// // initialization and is ready to create browser windows.
// // Some APIs can only be used after this event occurs.
// app.on('ready', createWindow)

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