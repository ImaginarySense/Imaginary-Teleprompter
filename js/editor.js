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
	// Global objects
	var prompterWindow;

	function init () {
		// Set globals
		debug = 1;

		// Set DOM javascript controls
		document.getElementById("prompterStyle").setAttribute("onclick","setStyleEvent(value);");
		document.getElementById("promptIt").onclick = submitTeleprompter;

		// Set default style
		setStyle();

		// If running inside Electron...
		if (navigator.userAgent.indexOf("Electron")!=-1) {			
			// Import Electron libraries.
			const ipcRenderer = require('electron').ipcRenderer;
			// When asynchronous reply from main process, run function to...
			ipcRenderer.on('asynchronous-reply', function(event, arg) {
				// Get the "exteral" classes and update each link to load on an actual browser.
				var classTags = document.getElementsByClassName('external');
				for (var i = 0; i < classTags.length; i++)
					if (classTags[i].href != " ") {
						classTags[i].setAttribute("onclick","require('shell').openExternal('" + classTags[i].href + "'); return false;");
						classTags[i].href = "#";
						classTags[i].target = "_parent";
					}
			});
			ipcRenderer.send('asynchronous-message', 'working');
		}; // end if
	} // end init()

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
		toolbar: ['undo redo | styleselect | bold italic underline strikethrough | superscript subscript | forecolor backcolor | image',
			'anchor | save | bullist numlist | alignleft aligncenter alignright | charmap searchreplace fullscreen'],
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
	
	function resetTeleprompter(event) {
		// Stops the event but continues executing he code.
	    event.preventDefault();
		// INFO: event.target === document.getElementById("promptIt") and more efficient.
	    event.target.textContent = "Prompt It!";
		event.target.onclick = submitTeleprompter;
		document.getElementById("content").style.display = "";
		document.getElementById("editorcontainer").style.display = "";
		document.getElementById("footer").style.display = "";
		// Hide prompter frame
		document.getElementById("framecontainer").style.display = "none";
	}
	
	// DOM Level functions, allow UI click interaction
// On change Prompter Style
function setStyleEvent(prompterStyle) {
	if (setStyle) {
		if (debug) console.log(prompterStyle);
		setStyle(prompterStyle);
	}
	//if ( selection ) {
	//	document.getElementById("editorcontainer").style.background="#FFF";
	//	document.getElementById("editorcontainer").style.color="#272822";
	//}
	//else {
	//	document.getElementById("editorcontainer").style.background="#272822";
	//	document.getElementById("editorcontainer").style.color="#FFF";
	//}
}

// On "Prompt It!" clicked
function submitTeleprompter(event) {
	// Stops the event but continues executing the code.
	event.preventDefault();
	// Get html from editor
	var htmldata = tinymce.get("prompt").getContent();

	// Get remaining form data
	var settings = '{ "data": {"secondary":'+document.getElementById("secondary").value+',"primary":'+document.getElementById("primary").value+',"prompterStyle":'+document.getElementById("prompterStyle").value+',"background":"#3CC","color":"#333", "overlayBg":"#333","focusMode":'+document.getElementById("focus").value+'}}',
		session = '{ "html":"'+encodeURIComponent(htmldata)+'" }';
	// Store data locally for prompter to use
	localStorage.setItem("IFTeleprompterSettings", settings);
	sessionStorage.setItem("IFTeleprompterSession", session);

	// Set and load "Primary"
	if ( document.getElementById("primary").value>0 ) {
		// Hide stuff
		document.getElementById("content").style.display = "none";
		document.getElementById("editorcontainer").style.display = "none";
		document.getElementById("footer").style.display = "none";
		// Show prompter frame
		document.getElementById("framecontainer").style.display = "block";
		// Load teleprompter
		document.getElementById("teleprompterframe").src = "teleprompter.html?debug=1";
		// INFO: event.target === document.getElementById("promptIt") and more efficient.
		event.target.textContent = "Reset...";
		event.target.onclick = resetTeleprompter;
	}

	// "Secondary"
	if ( document.getElementById("secondary").value>0 ) {
		prompterWindow = window.open("teleprompter.html?debug=1",'TelePrompter Output','height='+screen.availHeight+', width='+screen.width+', top=0, left='+screen.width+', fullscreen=1, status=0, location=0, menubar=0, toolbar=0' );
		if (window.focus)
		prompterWindow.focus();
	}

	// In case of both
	/*
	if ( $("#primary").value>0 && $("#secondary").value>0 ) {
		console.log(teleprompterframe.contentWindow);
		console.log(prompterWindow);
		localStorage.setItem('primaryInstance', teleprompterframe.contentWindow);
		localStorage.setItem('secondaryInstance', prompterWindow);
	}
	// In case of none
	else if ( !($("#primary").value>0 || $("#secondary").value>0) ) {
		window.alert("You must prompt at least to one 'display'.");
	}
	*/
}
	
	// Initialize objects after DOM is loaded
	if (document.readyState === "interactive" || document.readyState === "complete")
		// Call init if the DOM (interactive) or document (complete) is ready.
		init();
	else
		// Set init as a listener for the DOMContentLoaded event.
		document.addEventListener("DOMContentLoaded", init);

}());
