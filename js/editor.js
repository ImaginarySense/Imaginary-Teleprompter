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
	var promptIt, prompterWindow, frame;

	// Global variables
	var domain, tic, instance = [false, false], htmldata;
	
	// Enums
	var command = Object.freeze({
		"incVelocity":1,
		"decVelocity":2,
		"iSync":3,
		"sync":4,
		"togglePlay":5,
		"internalPlay":6,
		"internalPause":7,
		"play":8,
		"pause":9,
		"stopAll":10,
		"incFont":11,
		"decFont":12,
		"anchor":13,
		"close":14,
		"restoreEditor":15
	});

	function init () {
		// Set globals
		debug = true;
		tic = false;

		// Set DOM javascript controls
		promptIt = document.getElementById("promptIt");
		promptIt.onclick = submitTeleprompter;
		document.getElementById("prompterStyle").setAttribute("onchange","setStyleEvent(value);");
		document.getElementById("credits-link").onclick = credits;
		
		frame = document.getElementById("teleprompterframe");
		// Set default style and option style
		setStyle(document.getElementById("prompterStyle").value);
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
			});  
			ipcRenderer.send('asynchronous-message', 'working');    
		} // end if
	} // end init()

	// Initialize postMessage event listener.
	addEventListener("message", listener, false);

	// Instance Editor
	if (typeof tinymce!=="undefined") {
		tinymce.init({
			selector: "div#prompt",
			inline: true, // The key to make apps without security loopholes.
			auto_focus: "prompt", // Focus to show controls..
			fixed_toolbar_container: "#toolbar",
			statusbar: true,
			elementpath: false, // Remove the path bar at the bottom.
			resize: true, // True means will be vertically resizable.
			theme: "modern", //dev: We should make a custom theme.
			skin: "imaginary",
			editor_css : "css/tinymce.css",
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
			},
			style_formats: [
				{title: 'Paragraph', block: 'p'},
				{title: 'Heading 1', block: 'h1'},
				{title: 'Heading 2', block: 'h2'},
				{title: 'Heading 3', block: 'h3'},
				{title: 'Heading 4', block: 'h4'},
			],
			//image_list: [
			//	{title: 'My image 1', value: 'http://www.tinymce.com/my1.gif'},
			//	{title: 'My image 2', value: 'http://www.moxiecode.com/my2.gif'}
			//],
			save_enablewhendirty: false,
			save_onsavecallback: save,
			nonbreaking_force_tab: true
		});
	}
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
		if (promptIt.onclick===restoreEditor) {
			if (debug) console.log("Restoring editor.");
			// Request to close prompters:
			// Close frame.
			if (frame.src.indexOf("teleprompter.html")!=-1)
				frame.contentWindow.postMessage( {'request':command.close}, getDomain() );
			// Close window.
			if (prompterWindow)
				prompterWindow.postMessage( {'request':command.close}, getDomain() );
			// Clear contents from frame
			frame.src = "about:blank";
			// Stops the event but continues executing current function.
			if (event&&event.preventDefault)
				event.preventDefault();
			togglePromptIt();
		}
	}
	
	function launchIntoFullscreen(element) {
		var requestFullscreen = element.requestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen || element.msRequestFullscreen;
		requestFullscreen.call(element);
	}

	function exitFullscreen() {
		var exitFullscreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullscreen;
		exitFullscreen.call(document);
	}

	function toggleFullscreen() {
		var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement,
			elem;
		if (fullscreenElement)
			exitFullscreen();
		else {
			if (promptIt.onclick===submitTeleprompter)
				elem = document.getElementById("editorcontainer");
			else
				elem = document.documentElement;
			launchIntoFullscreen(elem);
		}
	}

	function togglePromptIt() {
		if (promptIt.onclick===submitTeleprompter) {		
			// Update button
			promptIt.textContent = "Close It...";
			promptIt.onclick = restoreEditor;
			// Hide stuff
			if (instance[0]) {
				document.getElementById("content").style.display = "none";
				document.getElementById("editorcontainer").style.display = "none";
				document.getElementById("footer").style.display = "none";
				// Show prompter frame
				document.getElementById("framecontainer").style.display = "block";
				launchIntoFullscreen(document.documentElement);
			}
		}
		else {
			// Update button
			promptIt.innerHTML = "Prompt It!";
			promptIt.onclick = submitTeleprompter;
			// Restore editor
			if (instance[0]) {
				document.getElementById("content").style.display = "";
				document.getElementById("editorcontainer").style.display = "";
				document.getElementById("footer").style.display = "";
				// Hide prompter frame
				document.getElementById("framecontainer").style.display = "none";
				exitFullscreen();
			}
		}
	}

	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			htmldata = xmlhttp.responseText;
			internalCredits();
		}
	}

	function internalCredits() {
		// Set primary instance as active.
		instance[0] = true;
		instance[1] = false;

		// Toggle editor interface
		togglePromptIt();
		
		// Set data to send.
		var settings = '{ "data": {"secondary":0,"primary":1,"prompterStyle":3,"focusMode":3,"background":"#3CC","color":"#333","overlayBg":"#333"}}',
			session = '{ "html":"'+encodeURIComponent(htmldata)+'" }';

		// Store data locally for prompter to use
		localStorage.setItem("IFTeleprompterSettings", settings);
		if (inElectron())
			localStorage.setItem("IFTeleprompterSession", session);
		else
			sessionStorage.setItem("IFTeleprompterSession", session);

		// Update frame and focus on it.
		//frame.src = "teleprompter.html";
		frame.src = "teleprompter.html?debug=1";
		frame.focus();

	}

	function credits() {
		// Get credits page.
		xmlhttp.open("GET", "credits.html", true);
		xmlhttp.send();
		toggleFullscreen();
	}

	// On "Prompt It!" clicked
	function submitTeleprompter(event) {
		if (debug) console.log("Submitting to prompter");
		
		// Stops the event but continues executing the code.
		event.preventDefault();
		// Get html from editor
		if (typeof CKEDITOR !== "undefined")
			htmldata = CKEDITOR.instances.prompt.getData()
		else if (typeof tinymce !== "undefined")
			htmldata = tinymce.get("prompt").getContent();

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
			instance[0] = true;
			// Checks if is running on electron app...
			if ( inElectron() ) {
				var remote = require('electron').remote; //Returns the object returned by require(electron) in the main process.
				var elecScreen = require('electron').screen //Returns the object returned by require(electron.screen) in the main process.
				
                // Load teleprompter
				if (elecScreen.getPrimaryDisplay() && instance[0]) {
					toggleFullscreen();
					frame.src = "teleprompter.html?debug=1";
				}
			} else {
				// Load teleprompter
				frame.src = "teleprompter.html?debug=1";
				frame.focus();
			}
		}
		else {
            instance[0] = false;
        }			

		// "Secondary"
		if ( document.getElementById("secondary").value>0 ) {
			instance[1] = true;
			// Checks if is running on electron app...
			if (inElectron()) {
				// Imported libraries for the us of externalDisplay...
				var remote = require('electron').remote; //Returns the object returned by require(electron) in the main process.
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
				if (externalDisplay && instance[1]){
                    prompterWindow = window.open("teleprompter.html?debug=1",'TelePrompter Output','height='+externalDisplay.bounds.y + 50 +', width='+externalDisplay.bounds.x + 50 +', top=0, left='+elecScreen.width+', fullscreen=1, status=0, location=0, menubar=0, toolbar=0');
                }else if(!externalDisplay && instance[0] === false){
                    prompterWindow = window.open("teleprompter.html"+(debug?"?debug=1":""),'TelePrompter Output','height='+screen.availHeight+', width='+screen.width+', top=0, left='+screen.width+', fullscreen=1, status=0, location=0, menubar=0, toolbar=0' );
				if (window.focus)
					prompterWindow.focus();
                }
					
			}else {
				prompterWindow = window.open("teleprompter.html"+(debug?"?debug=1":""),'TelePrompter Output','height='+screen.availHeight+', width='+screen.width+', top=0, left='+screen.width+', fullscreen=1, status=0, location=0, menubar=0, toolbar=0' );
				if (window.focus)
					prompterWindow.focus();
			}
		}
		else{
            instance[1] = false;
        }
			
	
		// In case of both
		// In case of none
		if ( !(instance[0]||instance[1]) )
			window.alert("You must prompt at least to one display.");
        else if (inElectron() && instance[0] && instance[1] && !externalDisplay){
            window.alert("You dont have any external Display");
       }
		else
			togglePromptIt();
	}

	function toc () {
		tic!=tic;
	}

	function listener(event) {
		// Message data. Uncommenting will give you valuable information and decrease performance dramatically.
		/*
		setTimeout(function() {
			if (debug) {
				console.log("Editor:");
				console.log(event);
			}
		}, 0);
		*/
		// If the event comes from the same domain...
		if (!event.domain||event.domain===getDomain()) {
			var message = event.data;
			// Special case. Restore editor message received.
			if (message.request===command.restoreEditor)
				restoreEditor();
			else {
				// If this isn't a instant sync command, follow normal procedure.
				if (!(message.request===command.iSync||message.request===command.sync)) {
					// Tic toc mechanism symmetricaly distributes message request lag.
					if (tic) {
						// Redirect message to each prompter instance.
						if (instance[1])
							prompterWindow.postMessage( message, getDomain());
						if (instance[0])
							frame.contentWindow.postMessage( message, getDomain());
					}
					else  {
						// Redirect message to each prompter instance.
						if (instance[0])
							frame.contentWindow.postMessage( message, getDomain());
						if (instance[1])
							prompterWindow.postMessage( message, getDomain());
					}
				}
				// If requesting for sync, ensure both instances are open. Otherwise do nothing.
				else if (instance[0]&&instance[1]) {
					// Tic toc mechanism symmetricaly distributes message request lag.
					if (tic) {
						// Redirect message to each prompter instance.
						if (instance[1])
							prompterWindow.postMessage( message, getDomain());
						if (instance[0])
							frame.contentWindow.postMessage( message, getDomain());
					}
					else {
						// Redirect message to each prompter instance.
						if (instance[0])
							frame.contentWindow.postMessage( message, getDomain());
						if (instance[1])
							prompterWindow.postMessage( message, getDomain());
					}
				}
				// Update tic-toc bit.
				setTimeout(toc, 10);
			}
		}
	}

	document.onkeydown = function( event ) {
		// keyCode is announced to be deprecated but not all browsers support key as of 2016.
		if (event.key === undefined)
			event.key = event.keyCode;
		if (debug) console.log(event.key);
		switch ( event.key ) {
			// TELEPROMPTER COMMANDS
			case "s":
			case "S":
			case "ArrowDown":
			case 40: // Down
			case 68: // S
				listener( {data:{request:command.incVelocity}} );
				break;
			// prompterWindow.postMessage( message, getDomain())
			case "w":
			case "W":
			case "ArrowUp":
			case 38: // Up
			case 87: // W
				listener( {data:{request:command.decVelocity}} );
				break;
			case "d":
			case "D":
			case "ArrowRight":
			case 83: // S
			case 39: // Right
				listener( {data:{request:command.incFont}} );
				break;
			case "a":
			case "A":
			case "ArrowLeft":
			case 37: // Left
			case 65: // A
				listener( {data:{request:command.decVelocity}} );
				break;
			case " ":
			case 32: // Spacebar
				listener( {data:{request:command.togglePlay}} );
				break;
			case ".":
			case 110: // Numpad dot
			case 190: // Dot
				listener( {data:{request:command.sync}} );
				break;
			// EDITOR COMMANDS
			case 122:
			case "F11":
				event.preventDefault();
				toggleFullscreen();
				break;
			case 123:
			case "F12":
				debug=!debug;
				break;
			case 27: // ESC
			case "Escape":
				restoreEditor();
				break;
            // Electron Commands
            case 17, 91, 70:
            case "ctrl" + "" + "f":
            if(inElectron()){
                event.preventDefault();
                toggleFullscreen();
                break;
            } else{
                break;
            }
			default:
				// If pressed any number from 0 to 9.
				if ( event.key>=48 && event.key<=57 )
					event.key-=48;
				else if ( event.key>=96 && event.key<=105 )
					event.key-=96;
				// Or if pressed any other key.
				listener( {data:{request:command.anchor, data:event.key}} );
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
