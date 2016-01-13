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

/*  References:
https://github.com/jquery/PEP
https://github.com/briangonzalez/jquery.pep.js/
http://stackoverflow.com/questions/18240107/make-background-follow-the-cursor
https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/onversionchange
*/

// Encapsulate the code in an anonymous self-invoking function.
(function () {
	// Use JavaScript Strict Mode.
	"use strict";
	// Global objects
	var settings, session, prompt, pointer, overlay, overlayFocus, styleElement, styleSheet, argument;
	// Global variables
	var unit, x, velocity, sensitivity, speedMultip, limit, relativeLimit, play, timeoutStatus, invertedWheel, focus, promptStyleOption, customStyle, flipV, flipH, fontSize, previousPromptHeight, previousScreenHeight, previousScreenWidth, previousVerticalDisplacementCorrector, tic, debug, closing;
	// Global constants
	var transitionDelays = 500,
		timeoutDelay = 500;
	
	function initCSS() {
		// Create style element.
		styleElement = document.createElement('style');
		// Append style element to head.
		document.head.appendChild(styleElement);
		// Grab element's style sheet.
		styleSheet = styleElement.sheet;
	}

	function init() {
		// Local variables
		var flip;

		// Initialize objects
		prompt = document.querySelector(".prompt");
		overlay = document.querySelector("#overlay");
		overlayFocus = document.querySelector("#overlayFocus");
		pointer = {}; //document.querySelector("#pointer");

		// Initialize CSS
		initCSS();

		// Initialize variables
		// HTTP GET debug option...
		debug = getUrlVars()["debug"];
		// Evaluate it to boolean expresion.
		debug = debug>0||debug=="true";

		// Init variables. Do not change these unless you know what you are doing.
		x = 0;
		velocity = 0;closing
		tic = false;
		closing = false;
		
		// Animation settings
		play = true;
		sensitivity = 1.2;
		speedMultip = 11;
		limit = 3000;
		
		// Set values relative to unit size.
		updateUnit();
		
		// Local Storage and Session data
		settings = JSON.parse(localStorage.getItem('IFTeleprompterSettings'));
		if (inElectron())
			session = JSON.parse(localStorage.getItem('IFTeleprompterSession'));
		else
			session = JSON.parse(sessionStorage.getItem('IFTeleprompterSession'));

		// Get focus mode
		focus = settings.data.focusMode;
		// Get prompter style
		promptStyleOption = settings.data.prompterStyle;
		customStyle = { "background": settings.data.background, "color": settings.data.color, "overlayBg": settings.data.overlayBg };
		// Get and set prompter text
		prompt.innerHTML = decodeURIComponent(session.html);
		
		// Set focus area according to settings.
		switch (focus) {
			case 1:
				document.querySelector("#overlayTop").classList.add("disable");
				break;
			case 2:
				document.querySelector("#overlayBottom").classList.add("disable");
				break;
			case 3:
				document.querySelector("#overlay").classList.add("hide");
				break;
		}

		// Get flip settings
		if (inIframe())
			flip = settings.data.primary;
		else
			flip = settings.data.secondary;
		
		// Wheel settings
		invertedWheel = false;//settings.data.invertedWheel;
		// Font Size
		fontSize = 100;

		// Initialize flip values
		flipH = false;
		flipV = false;
		// Set flip values to prompter settings
		switch (flip) {
			case 2:
				flipH = true;
				break;
			case 3:
				flipV = true;
				break;
			case 4:
				flipH = true;
				flipV = true;
				break;
		}
		// Set flip and styles to values from settings.
		setFlips();
		setStyle( promptStyleOption, customStyle );

		// Save current screen position related settings for when resize and screen rotation ocurrs.
		previousPromptHeight = getPromptHeight();
		previousScreenHeight = getScreenHeight();
		previousScreenHeight = getScreenHeight();
		previousVerticalDisplacementCorrector = focusVerticalDisplacementCorrector();

		// Add pointer controls
		// Stop animation while pressing on the screen, resume on letting go.
		overlay.addEventListener( "pointerdown", pointerActive );
		overlay.addEventListener( "pointerup", pointerInactive );
		overlay.addEventListener( "pointerleave", pointerInactive );
		overlay.addEventListener( "pointermove", pointerMove );

		// Wait a moment to prevent possible asynchronic CSS issues.
		window.setTimeout( function() {
			// If flipped vertically, set start at inverted top.
			if (flipV)
				animate(0,-getPromptHeight()+getScreenHeight());
			
			// Sync prompter positions to smallest at start.
			syncPrompters();

			// Begin animation
			internalIncreaseVelocity();
		}, 500);
	}

	function pointerActive(event) {
		if (!pointer.active) {
			if (debug) console.log("Pointer active");
			internalPauseAnimation();
			pointer.prompterstart = getCurrPos();
			pointer.startposition = event.clientY;
			pointer.previousposition = pointer.startposition;
			pointer.active = true;
		}
	}

	function pointerInactive() {
		if (pointer.active) {
			if (debug) console.log("Pointer inactive");
			pointer.active = false;
			//letGoAnimation();
			internalPlayAnimation();
		}
	}

	function letGoAnimation() {
		var fallPosition = getCurrPos()+pointer.delta*9,
			fallDelay = pointer.delta*1000;
		animate(fallDelay, fallPosition, "ease-out");
	}

	function pointerMove(event) {
		if (pointer.active) {
			// Get current point location
			var pointerCurrPos = event.clientY,
				distance = pointerCurrPos-pointer.startposition;
			pointer.delta = pointerCurrPos-pointer.previousposition
			pointer.deltaTime = pointer.deltaTime;
			// time and last time ?
			argument = pointer.prompterstart+distance;
			// Update previous position value.
			pointer.previousposition = pointerCurrPos;
			// Debug info
			if (debug) console.log("Pointer start: "+pointer.startposition+"\nPointer at: "+pointerCurrPos+"\nDistance: "+distance+"\nDelta: "+pointer.delta);
			// Move to pointed position.
			setCurrPosStill(argument);
			//requestAnimationFrame(touchUpdate);
		}
	}

	function touchUpdate() {
		setCurrPosStill(argument);
	}

	/*
	function atRest() {
		if (debug) console.log("At rest");
		requestAnimationFrame(restorePointer);
		syncPrompters();
		internalPlayAnimation();
	}

	function restorePointer() {
		if (debug) console.log("Restoring pointer position");
		setCurrPosStill( getCurrPos()-getCurrPos( document.getElementById("prompt") ) );
		setCurrPosStill( 0, document.getElementById("prompt") );
	}
	*/

	function restoreRequest() {
		// "closing" mutex prevents infinite loop.
		if (debug) console.log("Restore request.");
		// Locate editor
		var editor;
		if (window.opener)
			editor = window.opener;
		else if (window.top)
			editor = window.top;
		// If we have normal access to the editor, request it to restore the prompters.
		if (editor)
			editor.postMessage( "restoreEditor", getDomain() );
	}

	function closeInstance() {
		if (!closing) {
			closing = true;
			// Finally, close this window or clear iFrame. The editor must not be the one who closes cause it could cause an infinite loop.
			if ( inIframe() ) {
				if (debug) console.log("Closing iFrame prompter.");
				document.location = "about:blank";//"blank.html";
			}
			else {
				if (debug) console.log("Closing window prompter.");
				window.close();
			}
		}
	}

	// On close
	window.addEventListener("beforeunload", restoreRequest);

	function getDomain() {
		// Get current domain.
		var domain = document.domain;
		// If not running on a server, return catchall.
		if ( domain.indexOf("http://")!=0 || domain.indexOf("https://")!=0 )
			domain = "*";
		return domain;
	}

	function inIframe() {
		try {
			return window.self !== window.top;
		} catch (e) {
			return true;
		}
	}

	function setFlips() {
		//dev@javi: Add support for real-time flipping.
		// Both flips
		if (flipH&&flipV) {
			//prompt.classList.add("flipHV");
			overlay.classList.add("flipV");
			//overlay.classList.add("flipHV"); // Currently unnecesary. Uncomment if overlay isn't symetric.
		}
		// Vertical flip
		else if (flipV) {
			//prompt.classList.add("flipV"); // Not necesary if using css transform based animations.
			overlay.classList.add("flipV");
		}
		// Horizontal flip
		//else if (flipH) {
			//prompt.classList.add("flipH"); // Not necesary if using css transform based animations.
			//overlay.classList.add("flipH"); // Currently unnecesary. Uncomment if overlay isn't symetric.
		//}
	}

	function syncPrompters() {
		localStorage.setItem("sync", getProgress());
	}

	function updateVelocity() {
		// (|x|^sensitivity) * (+|-)
		velocity = unit*speedMultip*Math.pow(Math.abs(x),sensitivity)*(x>=0?1:-1);
		if (debug) console.log("Velocity: "+velocity);
	}
	
	function atEnd() {
		var flag;
		if (flipV)
			flag = getCurrPos() >= 0;
		else
			flag = getCurrPos() <= -(getPromptHeight()-getScreenHeight());
		if (debug&&flag) console.log("At top");
		return flag;
	}

	function atStart() {
		var flag;
		if (flipV)
			flag = getCurrPos() <= -(getPromptHeight()-getScreenHeight());
		else
			flag = getCurrPos() >= 0;
		if (debug&&flag) console.log("At bottom");
		return flag;
	}

	function stopAll() {
		localStorage.setItem("direction", 0);
		x=0;
		updateVelocity();
	}

	function firstValidProperty( properties ) {
		var property;
		for ( var i=0; i<properties.length; i++ )
			if (properties[i])
				property = properties[i];
		return property;
	}

	function getTransitionEnd() {
		// Transition var and transition list.
		var transitionEnd = ['webkitTransitionEnd',
					"oTransitionEnd",
					'MSTransitionEnd',
					'transitionend'];
		return firstValidProperty( transitionEnd );
	}

	document.addEventListener( getTransitionEnd(), function() {
		if(atStart()||atEnd())
			stopAll();
		if (debug) console.log("Reached end");
	}, false);

	// Gets variables from HTTP GET.
	function getUrlVars() {
		var vars = {};
		var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
			vars[key] = value;
		});
		return vars;
	}
/*
	function getAspectRatio() {
		return getScreenWidth()/getScreenHeight();
	}
*/
	// Solve for time to reach end.
	function getRemainingTime() {
		var destination = getDestination(),
			paddingDifference = 0,//(destination===0?getScreenHeight():-getScreenHeight()),
			time = Math.abs((destination+paddingDifference-getCurrPos())/velocity);
		if ( isNaN(time) )
			time = 0;
		return time;
	}

	function getScreenHeight() {
		return overlay.clientHeight;
	}

	function getScreenWidth() {
		return overlay.clientWidth;
	}

	function getPromptHeight() {
		return prompt.clientHeight;
	}

	function getFocusHeight() {
		return overlayFocus.clientHeight;
	}
	
	function getCurrPos(obj) {
		if (!obj)
			obj=prompt;
		var computedStyle = window.getComputedStyle(obj, null),
			theMatrix = computedStyle.getPropertyValue("-webkit-transform") ||
				computedStyle.getPropertyValue("-moz-transform") ||
				computedStyle.getPropertyValue("-ms-transform") ||
				computedStyle.getPropertyValue("-o-transform") ||
				computedStyle.getPropertyValue("transform"),
		// Reading data from matrix.
			mat = theMatrix.match(/^matrix3d\((.+)\)$/);
		if(mat) return parseFloat(mat[1].split(', ')[13]);
			mat = theMatrix.match(/^matrix\((.+)\)$/);
		return mat ? parseFloat(mat[1].split(', ')[5]) : 0;
	}

	function setCurrPosStill( theCurrPos, obj ) {
		if (!theCurrPos)
			theCurrPos = getCurrPos();
		if (!obj)
			obj = prompt;
		// If animation is running...
		if (prompt.classList.contains("move")) {
			// Stop animation by removing move class.
			obj.classList.remove("move");
			// Delete animation rules before setting new ones.
			styleSheet.deleteRule(0);
		}
		//prompt.style.top = theCurrPos+'px';
		obj.style.WebkitTransform = 'translateY('+theCurrPos+'px) scale('+(flipH?-1:1)+','+(flipV?-1:1)+')'; 
		obj.style.MozTransform = 'translateY('+theCurrPos+'px) scale('+(flipH?-1:1)+','+(flipV?-1:1)+')'; 
		obj.style.msTransform = 'translateY('+theCurrPos+'px) scale('+(flipH?-1:1)+','+(flipV?-1:1)+')'; 
		obj.style.OTransform = 'translateY('+theCurrPos+'px) scale('+(flipH?-1:1)+','+(flipV?-1:1)+')';  
		obj.style.transform = 'translateY('+theCurrPos+'px) scale('+(flipH?-1:1)+','+(flipV?-1:1)+')';
		//hack();
	}

	function getDestination() {
		// Set animation destination
		var whereTo;
		if (velocity>0) {
			if (flipV)
				whereTo = 0;
			else
				whereTo = -(getPromptHeight()-getScreenHeight());
		}
		else if (velocity<0) {
			if (flipV)
				whereTo = -(getPromptHeight()-getScreenHeight());
			else
				whereTo = 0;
		}
		else
			// Destination equals current position in animation.
			whereTo = getCurrPos();
		return whereTo;
	}

	function updateAnimation() {
		// Resumes animation with new destination and time values.
		if (play) {
			// Get new style variables.
			var time = getRemainingTime(),
				destination = getDestination();
			animate( time, destination );
		}
	}

	function animate( time, destination, curve ) {
		// If no curve parameter, default to linear. This is the equivalent of a function overload.
		if (!curve)
			curve = 'linear';
		// Retain current position.
		setCurrPosStill();
		// Set new animation rules.
		styleSheet.insertRule('\
			.prompt.move {\
				-moz-transform: translateY('+destination+'px) scale('+(flipH?-1:1)+','+(flipV?-1:1)+') !important;\
				-webkit-transform: translateY('+destination+'px) scale('+(flipH?-1:1)+','+(flipV?-1:1)+') !important;\
				-ms-transform: translateY('+destination+'px) scale('+(flipH?-1:1)+','+(flipV?-1:1)+') !important;\
				-o-transform: translateY('+destination+'px) scale('+(flipH?-1:1)+','+(flipV?-1:1)+') !important;\
				transform: translateY('+destination+'px) scale('+(flipH?-1:1)+','+(flipV?-1:1)+') !important;\
				-moz-transition: -moz-transform '+time+'s '+curve+';\
				-webkit-transition: -webkit-transform '+time+'s '+curve+';\
				-ms-transition: -ms-transform '+time+'s '+curve+';\
				-o-transition: -o-transform '+time+'s '+curve+';\
				transition: transform '+time+'s '+curve+';\
		}', 0);
		// Prevent race condition in Chrome by requesting for current position (not just transform) before resuming animation.
		hack();
		// Resume animation by re adding the class.
		prompt.classList.add("move");
		if (debug) console.log("Curr: "+getCurrPos()+"\nDest: "+destination+"\nRemTime "+time);
	}
	//https://css-tricks.com/controlling-css-animations-transitions-javascript/

	function hack() {
		return prompt.offsetTop;
	}

	function focusVerticalDisplacementCorrector() {
		var vDisp=0;
		switch (focus) {
			// None syncs to top
			case 3:
			// If top and flipped, take a bit above bottom
			case 1:
				if (flipV)
					vDisp += getScreenHeight()-getFocusHeight();
				else
					vDisp += getFocusHeight()/2;
				break;
			// If bottom and flipped, current position is correct
			case 2:
				if (!flipV)
					vDisp += getScreenHeight()-getFocusHeight()/2;
				break;
			// Sync to center by default
			default:
				// If center and flip. Take a little above center
				if (flipV)
					vDisp += getScreenHeight()/2-getFocusHeight()/2;
				// If no flip. Leave a little bellow center
				else
					vDisp += getScreenHeight()/2;
				break;
		}
		return vDisp;
	}

	function moveToCSSAnchor( theAnchor ) {
		var jump;
		if (flipV)
			jump = -getPromptHeight()+document.getElementById(theAnchor).offsetTop+focusVerticalDisplacementCorrector()+getFocusHeight()/2;
		else
			jump = -document.getElementById(theAnchor).offsetTop + focusVerticalDisplacementCorrector();
		if (debug) console.log("Jumped to: "+jump);
		// Jump to anchor
		animate(0, jump);
		// Resume animation
		updateAnimation();
	}

	function internalMoveToAnchor( theAnchor ) {
		// Proceed to anchor only if anchor is valid.
		if ( document.getElementById( theAnchor ) )
			moveToCSSAnchor( theAnchor );
		else
			if (debug) console.log("Invalid Anchor");
	}
	
	function moveToAnchor( theAnchor ) {
		localStorage.setItem("anchor", theAnchor);
		internalMoveToAnchor( theAnchor );
	}

	// Update unit and unit related meassurements
	function updateUnit() {
		unit = getFocusHeight() / 200;
		relativeLimit = limit*unit;
		if (debug) console.log("Unit updated: "+unit);
		updateVelocity();
	}

	function timeout( time, func ) {
		internalPauseAnimation();
		// If a timeout is already executing, reset it.
		if (timeoutStatus)
			window.clearTimeout(timeoutStatus);
		// Set: Wait one second before resuming animation
		timeoutStatus = window.setTimeout(func, time);
	}

	function getProgress() {
		// The "previous" values used in getProgress are consistant values that update only during resize or screen rotate.
		// By using these we are able to recalculate position on correctVerticalDisplacement() and improve performance.
		// Solve for current progress. P = (-(currPos+screenHeight-valToCenterAtFocusArea)) / (promptHeight-screenHeight)
		var progress;
		if (flipV)
			progress = (getCurrPos()+previousPromptHeight-previousScreenHeight-previousVerticalDisplacementCorrector)/(previousPromptHeight-previousScreenHeight*2);
		else
			progress = -(getCurrPos()+previousScreenHeight-previousVerticalDisplacementCorrector)/(previousPromptHeight-previousScreenHeight*2);
		if (debug) console.log("Progress: "+(progress*100)+"%");
		return progress;
	}
	
	// Wait timeoutDelay after calling event before continuing.
	function correctVerticalDisplacement(percentage, transitionDelay) {
		// Update relative screen values.
		timeout( timeoutDelay, function() {
			// Get current screen settings. To be used multiple times.
			var updatedPos,
				promptHeight = getPromptHeight(),
				screenHeight = getScreenHeight(),
				valToCenterAtFocusArea = focusVerticalDisplacementCorrector();
			if (!percentage)
				percentage=getProgress();
			if (!transitionDelay)
				transitionDelay = transitionDelays;
			//
			if (flipV)
				updatedPos = -((-percentage*(promptHeight-screenHeight*2))+promptHeight-screenHeight-valToCenterAtFocusArea);
			else
				// Solve for updated position. K=(-percentage*actualPromptHeight)-screenHeight+valToCenterAtFocusArea
				updatedPos = (-percentage*(promptHeight-screenHeight*2))-screenHeight+valToCenterAtFocusArea;
			// Update "previous" values to current ones.
			previousPromptHeight = promptHeight;
			previousScreenHeight = screenHeight;
			previousVerticalDisplacementCorrector = valToCenterAtFocusArea;
			// Correct vertical displacement with a smooth animation.
			animate( transitionDelays/1000, updatedPos, 'ease' );
			// After that animation is done...
			window.setTimeout( function() {
				// Check if current position is out of bounds and if it is, correct it.
				var currPos = getCurrPos(),
					maxPos = -(promptHeight-screenHeight);
				if ( currPos>0 ) {
					animate( 0, 0 );
					syncPrompters();
				}
				else if ( currPos<maxPos ) {
					animate( 0, maxPos );
					stopAll();
					syncPrompters();
				}
				// Then resume prompter playback.
				internalPlayAnimation();
			}, transitionDelay );
		});
	}

	window.addEventListener("resize", function() {
		if (debug) console.log("Resize");
		// In case of resolution change, update density unit.
		updateUnit();
		// You can guess what the next line does.
		correctVerticalDisplacement();
	}, false);

	window.addEventListener("orientationchange", function() {
		//http://stackoverflow.com/questions/5284878/how-do-i-correctly-detect-orientation-change-using-javascript-and-phonegap-in-io
		if (debug) console.log("Orientation Change");
		// No need to updateUnit on this one as it should remain the same.
		correctVerticalDisplacement();
	}, false);

	window.addEventListener("wheel", function(evt) {
		evt=evt||window.event;
		if (invertedWheel) {
			if (evt.deltaY>0)
				increaseVelocity();
			else
				decreaseVelocity();
		}
		else {
			if (evt.deltaY>0)
				decreaseVelocity();
			else
				increaseVelocity();
		}
		evt.preventDefault();
	}, false);

	// CONTROL RELATED FUNCTIONS
	// FONT SIZE
	function increaseFontSize() {
		fontSize++;
		updateFont();
	}

	function decreaseFontSize() {
		fontSize--;
		updateFont();
	}

	function updateFont() {
		prompt.classList.add();
	}

	function toc() {
		tic = !tic;
	}

	function decreaseVelocity() {
		// Save setting to storage sends storage event to other windows.
		localStorage.setItem("direction", tic?"-1":"-2" );
		// Store events aren't sent if changed value is the same that was before. We use a tic toc mechanism so this value is always different.
		toc();
		// Then take action locally.
		internalDecreaseVelocity();
	}

	function increaseVelocity() {
		// Save setting to storage sends storage event to other windows.
		localStorage.setItem("direction", tic?"1":"2" );
		// Store events aren't sent if changed value is the same that was before. We use a tic toc mechanism so this value is always different.
		toc();
		// Then take action locally.
		internalIncreaseVelocity();
	}

	function internalDecreaseVelocity() {
		if (!atStart()) {
			if (velocity>relativeLimit*-1) {
				x--;
				updateVelocity();
				requestAnimationFrame(updateAnimation);
			}
		}
		else
			stopAll();
	}

	function internalIncreaseVelocity() {
		if (!atEnd()) {
			if (velocity<relativeLimit) {
				x++;
				updateVelocity();
				requestAnimationFrame(updateAnimation);
			}
		}
		else
			stopAll();
	}

	function toggleAnimation() {
		if ( play )
			pauseAnimation();
		else
			playAnimation();
	}

	function pauseAnimation() {
		// Save setting to storage sends storage event to other windows.
		localStorage.setItem("play", "pause");
		// Then take action locally.
		requestAnimationFrame(localPauseAnimation);
		// Stop, then set play to false.
		play = false;
		syncPrompters();
		if (debug) console.log("Paused");
	}

	function playAnimation() {
		// Save setting to storage sends storage event to other windows.
		localStorage.setItem("play", "play");
		// Play must be set to true before resuming playback.
		play = true;
		// Then take action locally.
		localPlayAnimation();
		if (debug) console.log("Playing");
	}
	
	function internalPauseAnimation() {
		// Save setting to storage sends storage event to other windows.
		localStorage.setItem("play", "internalPause");
		// Then take action locally.
		requestAnimationFrame(localPauseAnimation);
		if (debug) console.log("Internal Pause");
	}

	function internalPlayAnimation() {
		// Save setting to storage sends storage event to other windows.
		localStorage.setItem("play", "internalPlay");
		// Then take action locally.
		localPlayAnimation();
		if (debug) console.log("Internal Play");
	}

	function localPauseAnimation() {
		animate(0, getCurrPos());
	}

	function localPlayAnimation() {
		requestAnimationFrame(updateAnimation);
	}

	window.addEventListener("storage", function(evt) {
		if (debug) console.log("Storage event key: "+evt.key);
			switch (evt.key) {
				// Uncomment this to enable full localstorage based synchronization (experimental).
				/*
				case "direction":
					var direction = evt.newValue;
					if (direction>0)
						internalIncreaseVelocity();
					else if (direction<0)
						internalDecreaseVelocity();
					else {
						x=0;
						updateVelocity();
						updateAnimation();
					}
					break;
				case "play":
					switch (evt.newValue) {
						case "play":
							play=true;
							localPlayAnimation(); // Webkit won't run without a break. 
							break;
						case "internalPlay":
							localPlayAnimation();
							break;
						case "pause":
							requestAnimationFrame(localPauseAnimation);
							play=false;
							break;
						case "internalPause":
							requestAnimationFrame(localPauseAnimation;
							break;
					} break;
				*/
				case "anchor":
					internalMoveToAnchor(evt.newValue);
					break;
				case "sync":
					correctVerticalDisplacement(evt.newValue, 0);
					break;
			} // end switch
	}, false); // end event

	document.onkeydown = function( evt ) {
		evt = evt || window.event;
		// keyCode is announced to be deprecated but not all browsers support key as of 2015.
		if (evt.key === undefined)
			evt.key = evt.keyCode;
		if (debug) console.log("Key: "+evt.key);
		switch ( evt.key ) {
			case "s":
			case "ArrowDown":
			case 40: // Down
			case 68: // S
				increaseVelocity();
				break;
			case "w":
			case "ArrowUp":
			case 38: // Up
			case 87: // W
				decreaseVelocity();
				break;
			case "d":
			case "ArrowRight":
			case 83: // S
			case 39: // Right
				increaseFontSize();
				break;
			case "a":
			case "ArrowLeft":
			case 37: // Left
			case 65: // A
				decreaseFontSize();
				break;
			case " ":
			case 32: // Spacebar
				toggleAnimation();
				break;
			case ".":
			case 110: // Numpad dot
			case 190: // Dot
				syncPrompters();
				break;
			case "Escape":
			case 27: // ESC
				closeInstance();
				break;
			default: // Move to anchor.
				// If pressed any number from 0 to 9.
				if ( evt.key>=48 && evt.key<=57 )
					moveToAnchor( evt.key-48 );
				else if ( evt.key>=96 && evt.key<=105 )
					moveToAnchor( evt.key-96 );
				// Or if pressed any other key.
				else
					moveToAnchor( evt.key );
		}
		// Prevent arrow and spacebar scroll bug.
		if ([" ","ArrowUp","ArrowDown","ArrowLeft","ArrowRight",32,37,38,39,40].indexOf(evt.key) > -1) evt.preventDefault();
	};

	function listener(event) {
		// If the event comes from the same domain...
		//if (event.domain==getDomain())
			// Act according to the message.
			switch (event.data) {
				// Close prompters.
				case "close":
					closeInstance();
					break;
				// Notify unknown message received.
				default : if (debug) console.log("Unknown post message received: "+event.data);
			}
	}

	// Initialize postMessage event listener.
	addEventListener("message", listener, false);

	function inElectron() {
		return navigator.userAgent.indexOf("Electron")!=-1;
	}

	// Initialize objects after DOM is loaded
	if (document.readyState === "interactive" || document.readyState === "complete")
		// Call init if the DOM (interactive) or document (complete) is ready.
		init();
	else
		// Set init as a listener for the DOMContentLoaded event.
		document.addEventListener("DOMContentLoaded", init);

}());
