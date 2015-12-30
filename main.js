	"use strict";
const electron = require('electron');
const app = electron.app; // Module to control application life.
const BrowserWindow = electron.BrowserWindow; // Module to create native browser window.
//The ipcMain module, when used in the main process,
//handles asynchronous and synchronous messages sent from a renderer process (web page).
const ipcMain = require('electron').ipcMain;
const shell = require('electron').shell; // Module that provides functions related to desktop integration.
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
        app.quit();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 1280, height: 800, javascritp: true, title: 'Teleprompter', useContentSize: true, nodeIntegration: true});

    // and load the index.html of app.
    mainWindow.loadURL('file://' + __dirname + '/index.html');


  ipcMain.on('asynchronous-message', function(event, arg) {
     event.sender.send('asynchronous-reply', 'Done');
   });


   // Emitted when the window is closed.
   mainWindow.on('closed', function(){
      mainWindow = null;
   });
});
