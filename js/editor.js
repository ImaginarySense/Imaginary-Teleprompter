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

// Global variables
var debug;

(function () {
	// Use JavaScript Strict Mode.
	"use strict";
	
	// Import Electron libraries.
	if ( inElectron() )
		var ipcRenderer = require('electron').ipcRenderer;
	
	// Global objects
	var prompterWindow, frame;

	// Global variables
	var domain;

	function init () {
		// Set globals
		debug = true;

		// Set DOM javascript controls
		document.getElementById("prompterStyle").setAttribute("onclick","setStyleEvent(value);");
		document.getElementById("promptIt").onclick = submitTeleprompter;
		frame = document.getElementById("teleprompterframe");
		// Set default style
		setStyle();
		// Set domain to current domain.
		setDomain();

		// If running inside Electron...
		if ( inElectron() ) {			
			// Setup Electron.
			var elecScreen = require('electron').screen // Returns the object returned by require(electron.screen) in the main process.
			// When asynchronous reply from main process, run function to...
			ipcRenderer.on('asynchronous-reply', function(event, arg) {
				// Get the "exteral" classes and update each link to load on an actual browser.
				var classTags = document.getElementsByClassName('external');
				var idTags = document.getElementById('secondary');
				for (var i = 0; i < classTags.length; i++)
					if (classTags[i].href != " ") {
						classTags[i].setAttribute("onclick","require('shell').openExternal('" + classTags[i].href + "'); return false;");
						classTags[i].href = "#";
						classTags[i].target = "_parent";
					}
				// Checks if a display was added, then enables secondary screen botton.               
				elecScreen.on('display-added', function(event, oldDisplay) {
					// idTags.setAttribute("disabled", "false", "return false;"); 
					idTags.removeAttribute("disabled", "return false;");
				});   
				// Checks if the display was removed, then disables secondary screen botton.  
				elecScreen.on('display-removed', function(event, oldDisplay) {
					idTags.setAttribute("disabled", "disabled", "return false;"); 
				}); 
			});  
			ipcRenderer.send('asynchronous-message', 'working');    
		} // end if
	} // end init()

	// Initialize postMessage event listener.
	addEventListener("message", listener, false);

	// Instance Editor
	tinymce.init({
		selector: "div#prompt",
		inline: true, // The key to make apps without security loopholes.
		auto_focus: "prompt", // Focus to show controls..
		fixed_toolbar_container: "#fixedToolbarContainer",
		statusbar: true,
		elementpath: false, // Remove the path bar at the bottom.
		resize: true, // True means will be vertically resizable.
		theme: "modern", //dev: We should make a custom theme.
		editor_css : "css/tinymce.css",
		//content_css : '/css/prompt.css',
		plugins: "advlist anchor save charmap code colorpicker contextmenu directionality emoticons fullscreen hr image media lists nonbreaking paste print searchreplace spellchecker table textcolor wordcount imagetools insertdatetime",
		toolbar: ['anchor | save | undo redo | styleselect | bold italic underline strikethrough | superscript subscript | forecolor backcolor | bullist numlist | alignleft aligncenter alignright | charmap image | searchreplace fullscreen'],
		contextmenu: "copy cut paste pastetext | anchor | image charmap",
		menu: {
			file: {title: 'File', items: 'newdocument print'},
			edit: {title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall'},
			insert: {title: 'Insert', items: 'anchor insertdatetime | image media emoticons | hr charmap'},
			format: {title: 'Format', items: 'bold italic underline strikethrough | superscript subscript | formats | removeformat | ltr rtl'},
			table: {title: 'Table', items: 'inserttable tableprops deletetable | cell row column'},
			tools: {title: 'Tools', items: 'searchreplace spellchecker code'}
		},
		directionality: "ltr",
		setup: function(editor) {
			// Don't close editor when out of focus.
			editor.on("blur", function () { return false; });
			// On editor clicked, go to fullscreen.
			//dev: This is meant to be inserted into it's own TinyMCE Button.
			/*
			editor.on("click", function() {
				var elem = document.getElementById("editorcontainer");
				if (elem.requestFullscreen) {
					elem.requestFullscreen();
				} else if (elem.msRequestFullscreen) {
					elem.msRequestFullscreen();
				} else if (elem.mozRequestFullScreen) {
					elem.mozRequestFullScreen();
				} else if (elem.webkitRequestFullscreen) {
					elem.webkitRequestFullscreen();
				}
			});
			*/
		},
		/*
		style_formats: [
			{title: 'Heading 1', block: 'h1', styles: {color: '#000'}},
			{title: 'Heading 2', block: 'h2', styles: {color: '#000'}},
			{title: 'Paragraph', block: 'p', styles: {color: '#000'}},
			{title: 'Example 1', inline: 'span', classes: 'example1'},
			{title: 'Table styles'},
			{title: 'Table row 1', selector: 'tr', classes: 'tablerow1'}
		],
		*/
		/*advlist_bullet_styles: "default,circle,disc,square",
		advlist_number_styles: "default,lower-alpha,lower-greek,lower-roman,upper-alpha,upper-roman",*/
		/*image_list: [
			{title: 'My image 1', value: 'http://www.tinymce.com/my1.gif'},
			{title: 'My image 2', value: 'http://www.moxiecode.com/my2.gif'}
		],*/
		save_enablewhendirty: false,
		save_onsavecallback: save,
		nonbreaking_force_tab: true
	
	});

	function save () {
		console.log("Save pressed");
	}

	function inElectron() {
		return navigator.userAgent.indexOf("Electron")!=-1;
	}
	
	function setDomain() {
		// Get current domain from browser
		domain = document.domain;
		// If not running on a server, return catchall.
		if ( domain.indexOf("http://")!=0 || domain.indexOf("https://")!=0 )
			domain = "*";
	}

	function getDomain() {
		return domain;
	}

	function restoreEditor(event) {
		if (debug) console.log("Restoring editor.");

		// Request to close prompters:
		// Close frame.
		if (frame.src.indexOf("teleprompter.html")!=-1)
			frame.contentWindow.postMessage( {'request':'close'}, getDomain() );
		// Close window.
		if (prompterWindow)
			prompterWindow.postMessage( {'request':'close'}, getDomain() );

		// Stops the event but continues executing current function.
		if (event&&event.preventDefault)
			event.preventDefault();

		// Change button and behaviour.
		// INFO: event.target === document.getElementById("promptIt") and it's more efficient. Unfortunatelly it doesn't cover all use cases.
		var button = document.getElementById("promptIt");
		button.innerHTML = "Prompt It!";
		button.onclick = submitTeleprompter;
		// Reset DOM
		//dev: Rewrite index.html for a cleaner way to do the following.
		document.getElementById("content").style.display = "";
		document.getElementById("editorcontainer").style.display = "";
		document.getElementById("footer").style.display = "";
		// Hide prompter frame
		document.getElementById("framecontainer").style.display = "none";
	}
	
	function doFullScreen() {
		var elem = document.getElementById("editorcontainer");
			if (elem.requestFullscreen) {
				elem.requestFullscreen();
			} else if (elem.msRequestFullscreen) {
				elem.msRequestFullscreen();
			} else if (elem.mozRequestFullScreen) {
				elem.mozRequestFullScreen();
			} else if (elem.webkitRequestFullscreen) {
				elem.webkitRequestFullscreen();
			}
	}

	// On "Prompt It!" clicked
	function submitTeleprompter(event) {
		if (debug) console.log("Submitting to prompter");
		
		// Stops the event but continues executing the code.
		event.preventDefault();
		// Get html from editor
		var htmldata = tinymce.get("prompt").getContent();

		// Get remaining form data
		var settings = '{ "data": {"secondary":'+document.getElementById("secondary").value+',"primary":'+document.getElementById("primary").value+',"prompterStyle":'+document.getElementById("prompterStyle").value+',"background":"#3CC","color":"#333", "overlayBg":"#333","focusMode":'+document.getElementById("focus").value+'}}',
			session = '{ "html":"'+encodeURIComponent(htmldata)+'" }';
		
		// Store data locally for prompter to use
		localStorage.setItem("IFTeleprompterSettings", settings);
		if (inElectron())
			localStorage.setItem("IFTeleprompterSession", session);
		else
			sessionStorage.setItem("IFTeleprompterSession", session);
		
		// Set and load "Primary"
		if ( document.getElementById("primary").value>0 ) {
			// Hide stuff
			document.getElementById("content").style.display = "none";
			document.getElementById("editorcontainer").style.display = "none";
			document.getElementById("footer").style.display = "none";
			// Show prompter frame
			document.getElementById("framecontainer").style.display = "block";

			// Checks if is running on electron app...
			if(navigator.userAgent.indexOf("Electron")!=-1)
				ipcRenderer.send('make-fullscreen');         
			
			// Load teleprompter
			frame.src = "teleprompter.html?debug=1";
			frame.focus();
		}

		// "Secondary"
		if ( document.getElementById("secondary").value>0 ) {
			// Checks if is running on electron app...
			if (navigator.userAgent.indexOf("Electron")!=-1) {
				// Imported libraries for the us of externalDisplay...
				const remote = require('electron').remote; //Returns the object returned by require(electron) in the main process.
				const BrowserWindow = remote.BrowserWindow; //Returns the object returned by require(electron.BrowserWindow) in the main process.
				var elecScreen = require('electron').screen //Returns the object returned by require(electron.screen) in the main process.

				//var electronScreen = electron.screen; // Module that retrieves information about screen size, displays,
				// cursor position, etc. Important: You should not use this module until the ready event of the app module is Emitted.
				var displays = elecScreen.getAllDisplays(); // Returns an array of displays that are currently  available.
				var externalDisplay = null;
				for (var i in displays) {
					if (displays[i].bounds.x != 0 || displays[i].bounds.y != 0) {
						externalDisplay = displays[i]; // externalDisplay recives all available displays.
						break;
					}
				}

				// If there are any externalDisplay; then create a new window for the display.
				if (externalDisplay) {
					//mainWindow = new BrowserWindow({x: externalDisplay.bounds.x + 50, y: externalDisplay.bounds.y + 50, title: 'Teleprompter', fullscreen: true});
					//mainWindow.loadURL('file://' + __dirname + '/teleprompter.html'); // load the teleprompter.html file when the mainWindow is created.
					prompterWindow = window.open("teleprompter.html?debug=1",'TelePrompter Output','height='+externalDisplay.bounds.y + 50 +', width='+externalDisplay.bounds.x + 50 +', top=0, left='+elecScreen.width+', fullscreen=1, status=0, location=0, menubar=0, toolbar=0');
				}
			} else {
				prompterWindow = window.open("teleprompter.html"+(debug?"?debug=1":""),'TelePrompter Output','height='+screen.availHeight+', width='+screen.width+', top=0, left='+screen.width+', fullscreen=1, status=0, location=0, menubar=0, toolbar=0' );
				if (window.focus)
					prompterWindow.focus();
			}
		}
	
		// In case of both
		// In case of none
		if ( !(document.getElementById("primary").value>0 || document.getElementById("secondary").value>0) )
			window.alert("You must prompt at least to one display.");
		else {
			event.target.textContent = "Close It...";
			event.target.onclick = restoreEditor;	
		}
	}

	function listener(event) {
		setTimeout(function() {
			if (debug) {
				console.log("Editor:");
				console.log(event);
			}
		}, 0);
		// If the event comes from the same domain...
		if (!event.domain||event.domain===getDomain()) {
			var message = event.data;
			if (message.request==="restoreEditor")
				restoreEditor();
			else {
				// Redirect message to each prompter instance.
				prompterWindow.postMessage( message, getDomain());
				frame.contentWindow.postMessage( message, getDomain());
			}
		}
	}

	document.onkeydown = function( evt ) {
		evt = evt || window.event;
		// keyCode is announced to be deprecated but not all browsers support key as of 2015.
		if (evt.key === undefined)
			evt.key = evt.keyCode;
		//if (debug) console.log("Key: "+evt.key);
		switch ( evt.key ) {
/*
			case "F11":
			case 122:
				evt.preventDefault();
				doFullScreen();
				break;
*/
			case "F8":
			case 119:
				debug=!debug;
				break;
			case "Escape":
			case 27: // ESC
				restoreEditor();
				break;
		}
	};
		
	// Initialize objects after DOM is loaded
	if (document.readyState === "interactive" || document.readyState === "complete")
		// Call init if the DOM (interactive) or document (complete) is ready.
		init();
	else
		// Set init as a listener for the DOMContentLoaded event.
		document.addEventListener("DOMContentLoaded", init);
}());

// On change Prompter Style
function setStyleEvent(prompterStyle) {
	if (setStyle) {
		if (debug) console.log(prompterStyle);
		setStyle(prompterStyle);
	}
}
