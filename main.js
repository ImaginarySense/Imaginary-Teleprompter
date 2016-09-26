/*
	Teleprompter
	Copyright (C) 2015 Imaginary Films LLC and contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

"use strict";
const {electron} = require('electron');
const {app} = require('electron');  // Module to control application life.
const {BrowserWindow} = require('electron'); // Module to create native browser window.

//The ipcMain module, when used in the main process,
//handles asynchronous and synchronous messages sent from a renderer process (web page).
const {ipcMain} = require('electron');
const {shell} = require('electron'); // Module that provides functions related to desktop integration.
const {globalShortcut} = require('electron'); // module can register/unregister a global keyboard shortcut with the operating system so that you can customize the operations for various shortcuts.
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;
// The menu class is used to create native menus that can be used as application menus and context menus.
const {Menu} = require('electron');

// Quit when all windows are closed.
app.on('window-all-closed', () => {
       // On macOS it is common for applications and their menu bar
       // to stay active until the user quits explicitly with Cmd + Q
       if (process.platform !== 'darwin'){
       app.quit();
       }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => {
	// Create the browser window.
	mainWindow = new BrowserWindow({width: 1280, height: 800, javascritp: true, title: 'Teleprompter', useContentSize: true, nodeIntegration: true});

	// and load the index.html of app.
	mainWindow.loadURL('file://' + __dirname + '/index.html');
    
  // Disables menu in systems where it can be disabled.
    Menu.setApplicationMenu(null);
    
	// Send a message to the renderer process...
	ipcMain.on('asynchronous-message', (event, arg) => {
		event.sender.send('asynchronous-reply', 'Done');
	});

  // Register a 'F8' shortcut listener.
  let ret = globalShortcut.register('F8', () => {
    mainWindow.openDevTools();
  });
  

  if (!ret) {
    console.log('registration failed');
  }

  // Check whether a shortcut is registered.
  console.log(globalShortcut.isRegistered('F8'));

  app.on('will-quit', () => {
  // Unregister a shortcut.
  globalShortcut.unregister('F8');

  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});

	// Emitted when the window is closed.
	mainWindow.on('closed', () =>{
        // Dereference the windows object, usually you would store  windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
		mainWindow = null;
	});
});
