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

// dev: This library needs to be improved in such way that Styles can be
//      incorporated dynamicallly, just by adding them to
//      teleprompter-themes.css.

var themeSheet;

(function () {
	// Use JavaScript Strict Mode.
	"use strict";
	// Global objects

	function init() {
		// Create style element.
		var themeStyle = document.createElement('style');
		// Append style element to head.
		document.head.appendChild(themeStyle);
		// Grab element's style sheet.
		themeSheet = themeStyle.sheet;
	}

	// Initialize objects after DOM is loaded
	if (document.readyState === "interactive" || document.readyState === "complete")
		// Call init if the DOM (interactive) or document (complete) is ready.
		init();
	else
		// Set init as a listener for the DOMContentLoaded event.
		document.addEventListener("DOMContentLoaded", init);

}());

// Set Teleprompter Style.
function setStyle(promptStyleOption, customStyle) {
	// Get page elements.
	var container = document.querySelector("#promptcontainer"),
		overlayBgs = document.getElementsByClassName("overlayBg"),
		overlayBgSetting;

	promptStyleOption = +promptStyleOption;

	// If requesting for custom but no custom style is provided, fallback to default.
	if ((!customStyle)&&promptStyleOption==2)
		promptStyleOption=0;

	// Remove previous classes, if any
	if (container.classList.contains("darkBody"))
		container.classList.remove("darkBody");
	if (container.classList.contains("lightBody"))
		container.classList.remove("lightBody");
	if (container.classList.contains("yellowBody"))
		container.classList.remove("yellowBody");
	if (container.classList.contains("theForce"))
		container.classList.remove("theForce");

	// Set body background.
	switch (promptStyleOption) {
		/*
		// Uncomment and insert new teleprompter color configurations here. (A.k.a. teleprompter-templates.css styles.)
		case 5:
			container.classList.add("newTemplatesBody");
			overlayBgSetting="newTemplatesOverlay";
			break;
		*/
		// Custom case: receives custom values to 
		case 4:
			container.classList.add("theForce");
			overlayBgSetting="darkOverlay";
			break;
		case 3:
			container.classList.add("yellowBody");
			overlayBgSetting="darkOverlay";
			break;
		case 2:
			themeSheet.insertRule('\
				body {\
					background: '+customStyle["background"]+';\
					color: '+customStyle["color"]+';\
			}', 0);
			themeSheet.insertRule('\
				.customOverlay {\
					background: '+customStyle["overlayBg"]+';\
			}', 1);
			overlayBgSetting="customOverlay";
			break;
		// Light: Black letters over white background.
		case 1:
			container.classList.add("lightBody");
			overlayBgSetting="lightOverlay";
			break;
		// Dark: White letters over black background.
		default:
			container.classList.add("darkBody");
			overlayBgSetting="darkOverlay";
	}
	// If page contains overlay, set overlay backgrounds.
	if (overlayBgs)
		for (var i=0; i<overlayBgs.length; i++) {
			// Remove any of the previous classes, if any.
			if (overlayBgs[i].classList.contains("darkOverlay"))
				overlayBgs[i].classList.remove("darkOverlay");
			else if (overlayBgs[i].classList.contains("lightOverlay"))
				overlayBgs[i].classList.remove("lightOverlay");
			else if (overlayBgs[i].classList.contains("customOverlay"))
				overlayBgs[i].classList.remove("customOverlay");
			// Add new overlay class.
			overlayBgs[i].classList.add(overlayBgSetting);
		}
}
