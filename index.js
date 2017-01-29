const {app, BrowserWindow, shell, dialog} = require('electron')
const {autoUpdater} = require('electron-auto-updater')
const path = require('path')
const url = require('url')
const isDev = require('electron-is-dev');

let mainwin
let updating

autoUpdater.addListener("update-available", function(event) {
  updating.show()
});
autoUpdater.addListener("update-downloaded", function(event, releaseNotes, releaseName, releaseDate, updateURL) {
  autoUpdater.quitAndInstall();
});
autoUpdater.addListener("error", function(error) {
  dialog.showMessageBox({ title: "Error", message: "Something went wrong with the Auto-Updater, It's highly recommended to re-download manually.", buttons: ["OK"] });
  updating.close()
  mainwin.show()
});
autoUpdater.addListener("update-not-available", function(event) {
  mainwin.show()
});

function createwindow () {

  mainwin = new BrowserWindow({width: 1280, height: 600, minWidth: 1280, minHeight: 600, frame: false, titleBarStyle: 'hidden', show: false})
  mainwin.loadURL(url.format({ pathname: path.join(__dirname, 'index.html'), protocol: 'file:', slashes: true }))
  updating = new BrowserWindow({width: 430, height: 220, minWidth: 430, minHeight: 220, frame: false, titleBarStyle: 'hidden', show: false})
  updating.loadURL(url.format({ pathname: path.join(__dirname, 'updating.html'), protocol: 'file:', slashes: true }))
 
  if(isDev) {
    mainwin.show()
  } else {
    autoUpdater.checkForUpdates()
  }
  
  //mainwin.webContents.openDevTools()

  mainwin.on('closed', () => {
    app.quit()
    mainwin = null
    updating = null
  })

  mainwin.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    //shell.openExternal(url);
  });

}

app.on('ready', createwindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainwin === null) {
    createwindow()
  }
})