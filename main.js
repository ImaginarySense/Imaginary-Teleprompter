const electron = require('electron');
const app = electron.app; // Module to control application life.
const BrowserWindow = electron.BrowserWindow; // Module to create native browser window.
var ipc = require('ipc');
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
    mainWindow = new BrowserWindow({width: 1280, height: 800, javascritp: true, title: 'Teleprompter', useContentSize: true, nodeIntegration: false});

    // and load the index.html of app.
    mainWindow.loadURL('file://' + __dirname + '/index.html');


   // Opens the About link in user default browser.
   ipc.on('about', function(event){
     event.preventDefault();
      shell.openExternal('http://imaginary.tech/software/teleprompter');
   });
   // Opens the Source link in user default browser.
   ipc.on('source', function(event){
     event.preventDefault();
       shell.openExternal('https://github.com/imaginaryfilms/Teleprompter.git');
   });
   // Opens the Imaginary Films link in user default browser.
   ipc.on('Imaginary-Films-LLC', function(event){
     event.preventDefault();
      shell.openExternal('http://imaginary.tech');
   });
   // Opens the Victor Ortiz link in user default browser.
   ipc.on('Victor-Ortiz', function(event){
     event.preventDefault();
       shell.openExternal('https://twitter.com/Va2ron1');
   });
   // Opens the Javier Cordero link in user default browser.
   ipc.on('Javier-Cordero', function(event){
     event.preventDefault();
      shell.openExternal('https://www.facebook.com/javicorper');
   });
   // Opens the CC BY 4.0 link in user default browser.
   ipc.on('CC-BY-4.0', function(event){
     event.preventDefault();
      shell.openExternal('https://creativecommons.org/licenses/by/4.0/');
   });

   // Emitted when the window is closed.
   mainWindow.on('closed', function(){
      mainWindow = null;
   });
});
