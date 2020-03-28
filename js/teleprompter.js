/*
    Imaginary Teleprompter
    Copyright (C) 2015 Imaginary Sense Inc. and contributors

    This file is part of Imaginary Teleprompter.

    Imaginary Teleprompter is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Imaginary Teleprompter is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Imaginary Teleprompter.  If not, see <https://www.gnu.org/licenses/>.
*/

/*  References:
https://github.com/jquery/PEP
https://github.com/briangonzalez/jquery.pep.js/
http://stackoverflow.com/questions/18240107/make-background-follow-the-cursor
https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/onversionchange
*/

// Use JavaScript Strict Mode.
"use strict";

// Encapsulate the code in an anonymous self-invoking function.
(function () {
    // Import Electron libraries.
    if (inElectron() && !inIframe()) {
        var {ipcRenderer} = require('electron');
        window.jQuery = require('./js/jquery.min.js');
        window.$ = window.jQuery;
        // Manually import jQuery from javascript when running in a CommonsJS environment.
        // Ref: https://github.com/electron/electron/issues/254 
        remote = require('electron').remote; // Allow IPC with main process in Electron.
    }
    // Global objects
    var settings, session, prompt, pointer, overlay, overlayFocus, styleSheet, editor, timer, clock, remote;
    // Global variables
    var unit, x, velocity, sensitivity, speedMultip, relativeLimit, steps, play, timeoutStatus, invertedWheel, focus, promptStyleOption, customStyle, flipV, flipH, fontSize, promptWidth, focusHeight, promptHeight, previousPromptHeight, screenHeight, previousScreenHeight, previousScreenWidth, previousVerticalDisplacementCorrector, domain, debug, closing, cap, syncDelay, isMobileApp;

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
        "restoreEditor":15,
        "resetTimer":16
    });

    // Global constants
    const transitionDelays = 500,
        timeoutDelay = 250,
        inputCapDelay = 100,
        limit = 2600;
    
    function initCSS() {
        // Create style elements.
        var styleElement = document.createElement('style');
        // Append style elements to head.
        document.head.appendChild(styleElement);
        // Grab element's style sheet.
        styleSheet = styleElement.sheet;
    }

    function init() {
        // Local variables
        var flip;

        // Initialize objects
        prompt = document.getElementsByClassName("prompt")[0];
        overlay = document.getElementById("overlay");
        overlayFocus = document.getElementById("overlayFocus");
        clock = document.getElementsByClassName("clock")[0];

        pointer = {};

        // Initialize variables
        // HTTP GET debug option...
        debug = getUrlVars()["debug"];
        // Evaluate it to boolean expresion.
        debug = debug>0||debug=="true";
        // Load debug tools if debug is enabled.
        if (debug) {
            debug = false;
            toggleDebug();
        }

        // Init variables. Do not change these unless you know what you are doing.
        x = 0;
        velocity = 0;
        closing = false;
        cap = false;
        syncDelay = 12;
        isMobileApp = false;
        
        // Local Storage and Session data
        updateDatamanager();

        // Set initial relative values.
        setFocusHeight();
        setScreenHeight();
        // setScreenWidth();
        updateUnit();
        
        // Initialize domain for interprocess communication
        setDomain();

        // Initialize CSS
        initCSS();

        // Locate and set editor
        if (window.opener)
            editor = window.opener;
        else if (window.top)
            editor = window.top;
        else if (ipcRenderer!==undefined) {
            // Untested code
            editor = {};
            editor.postMessage = function(event, domain) {
                ipcRenderer.send('asynchronous-message', event);
            }
        }
        resetSteps();
        // Animation settings
        play = true;
        // Get focus mode
        focus = settings.data.focusMode;

        timer = $('.clock').timer({ stopVal: 10000 });
        // Get and set prompter text
        updateContents();
        setPromptHeight();
        
        // Get prompter style
        promptStyleOption = settings.data.prompterStyle;
        customStyle = { "background": settings.data.background, "color": settings.data.color, "overlayBg": settings.data.overlayBg };
        // Get flip settings
        if (inIframe())
            flip = settings.data.primary;
        else
            flip = settings.data.secondary;
        
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
        // Set focus area according to settings.
        switch (focus) {
            case 1:
                if (flipV)
                    document.querySelector("#overlayBottom").classList.add("disable");
                else
                    document.querySelector("#overlayTop").classList.add("disable");
                break;
            case 2:
                if (flipV)
                    document.querySelector("#overlayTop").classList.add("disable");
                else
                    document.querySelector("#overlayBottom").classList.add("disable");
                break;
            case 4:
                document.querySelector("#touchOverlay").classList.add("hide");
            case 3:
                document.querySelector("#overlay").classList.add("hide");
                break;
        }
        // Set flip and styles to values from settings.
        setFlips();
        styleInit();
        setStyle( promptStyleOption );

        // Wheel settings
        invertedWheel = false;//settings.data.invertedWheel;

        // Add pointer controls
        // Stop animation while pressing on the screen, resume on letting go.
        var touchOverlay = document.getElementById("touchOverlay");
        touchOverlay.addEventListener( "pointerdown", pointerActive );
        touchOverlay.addEventListener( "pointerup", pointerInactive );
        touchOverlay.addEventListener( "pointerleave", pointerInactive );
        touchOverlay.addEventListener( "pointermove", pointerMove );

        // Wait a moment to prevent possible asynchronic CSS issues.
        window.setTimeout( function() {
            setScreenHeight();
            setPromptHeight();
            // If flipped vertically, set start at inverted top.
            if (flipV) {
                animate(0,-promptHeight+screenHeight);
            }

            // Save current screen position related settings for when resize and screen rotation ocurrs.
            previousPromptHeight = promptHeight;
            previousScreenHeight = screenHeight;
            previousScreenHeight = screenHeight;
            previousVerticalDisplacementCorrector = focusVerticalDisplacementCorrector();
            
            // Sync prompter positions to smallest at start.
            syncPrompters();

            window.setTimeout( function() {
                // Begin animation at i speed.
                for (var i=0; i<2; i++)
                    increaseVelocity();
                instaSync();
            },transitionDelays*4.2);

            //Init Remote Controllers
            if (isMobileApp)
                remoteControls();
            
        }, 750);
    }

    function updateDatamanager() {
        dataManager.getItem('IFTeleprompterSettings',function(data){
            settings = JSON.parse(data);
        },1,false);
        
        dataManager.getItem('IFTeleprompterSession',function(data){
            session = JSON.parse(data);
        },1,false);
        // Ensure content is being passed
        // console.log(session);
    }

    function updateContents() {
        // 
        // prompt = document.getElementsByClassName("prompt")[0];
        // overlay = document.getElementById("overlay");
        // overlayFocus = document.getElementById("overlayFocus");
        // 
        if (debug) console.log("Updating prompter");
        updateDatamanager();
        var oldFontSize = fontSize,
            oldPromptWidth = promptWidth;
        fontSize = settings.data.fontSize/100;
        speedMultip = settings.data.speed;
        sensitivity = settings.data.acceleration;
        promptWidth = settings.data.promptWidth;
        // If updating font, update it and resync
        if (oldFontSize !== fontSize)
            updateFont();
        if (oldPromptWidth !== promptWidth)
            updateWidth();
        // If screen is vertically flipped, resync
        else if (flipV) {
            onResize();
            window.setTimeout(onResize, transitionDelays*1.1);
        }
        prompt.innerHTML = decodeURIComponent(session.html);
        updateVelocity();
        
        // Enable timer
        if (settings.data.timer===true) {
            if (timer.data().timer.currentVal===0)
            timer.startTimer();
            clock.style.opacity = '1';
        }
        else {
            clock.style.opacity = '0';
            setTimeout(function() {
                timer.resetTimer();
                timer.stopTimer();
            }, 800);
        }
    }

    function pointerActive(event) {
        if (!pointer.active) {
            if (debug) console.log("Pointer active") && false;
            internalPauseAnimation();
            pointer.prompterstart = getCurrPos();
            pointer.startposition = event.clientY;
            pointer.previousposition = pointer.startposition;
            pointer.active = true;
        }
    }

    function pointerInactive() {
        if (pointer.active) {
            if ( !pointer.moved )
                toggleTouchControls();
            if (debug) console.log("Pointer inactive") && false;
            pointer.moved = false;
            pointer.active = false;
            //letGoAnimation();
            timeout(0, syncPrompters);
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
            var argument,
                pointerCurrPos = event.clientY,
                distance = pointerCurrPos-pointer.startposition;
            pointer.moved = true;
            pointer.delta = pointerCurrPos-pointer.previousposition;
            pointer.deltaTime = pointer.deltaTime;
            argument = pointer.prompterstart+distance;
            // Update previous position value.
            pointer.previousposition = pointerCurrPos;
            // Debug info
            if (debug) console.log("Pointer start: "+pointer.startposition+"\nPointer at: "+pointerCurrPos+"\nDistance: "+distance+"\nDelta: "+pointer.delta) && false;
            // Move to pointed position.
            setCurrPosStill(argument);
        }
    }

    /*
    function atRest() {
        if (debug) console.log("At rest") && false;
        requestAnimationFrame(restorePointer);
        syncPrompters();
        internalPlayAnimation();
    }

    function restorePointer() {
        if (debug) console.log("Restoring pointer position") && false;
        setCurrPosStill( getCurrPos()-getCurrPos( document.getElementById("prompt") ) );
        setCurrPosStill( 0, document.getElementById("prompt") );
    }
    */

    function toggleDebug() {
        // I do these the long way because debug could also be a numeric.
        if (debug) {
            debug = false;
            console.log("Leaving debug mode.");
        }
        else {
            debug = true;
            if (inElectron() && !inIframe())
                remote.getCurrentWindow().toggleDevTools();
            console.log("Entering debug mode.");
        }
    }

    function restoreRequest() {
        // "closing" mutex prevents infinite loop.
        if (debug) console.log("Restore request.") && false;
        // If we have normal access to the editor, request it to restore the prompters.
        if (editor)
            editor.postMessage( {'request':command.restoreEditor}, getDomain() );
        else if (!inIframe() && ipcRenderer!==undefined)
            ipcRenderer.send('asynchronous-message', 'restoreEditor');
        // In all cases, clean emulated session storage before leaving.
        dataManager.removeItem('IFTeleprompterSession',1);
    }

    function closeInstance() {
        if (!closing) {
            closing = true;
            // Finally, close this window or clear iFrame. The editor must not be the one who closes cause it could cause an infinite loop.
            if ( inIframe() ) {
                if (debug) console.log("Closing iFrame prompter.") && false;
                document.location = "about:blank";//"blank.html";
            }
            else {
                if (debug) console.log("Closing window prompter.") && false;
                window.close();
            }
        }
    }

    // On close
    window.addEventListener("beforeunload", restoreRequest);

    function setDomain() {  
        // Get current domain from browser
        domain = document.domain;
        // If site not running on a server, set as catchall.
        if ( domain.indexOf("http://")!=0 || domain.indexOf("https://")!=0 )
            domain = "*";
    }

    function getDomain() {
        return domain;
    }

    function setFlips() {
        //dev@javi: Add support for real-time flipping.
        // Both flips
        if (flipH&&flipV) {
            prompt.classList.add("flipHV");
            clock.classList.add("flipHV");
        }
        // Vertical flip
        else if (flipV) {
            prompt.classList.add("flipV");
            clock.classList.add("flipV");
        }
        // Horizontal flip
        else if (flipH) {
            prompt.classList.add("flipH");
            clock.classList.add("flipH");
        }
    }

    function syncPrompters() {
        editor.postMessage( {'request':command.sync,'data':getProgress()}, getDomain() );
    }

    function instaSync() {
        if (steps>syncDelay)
            editor.postMessage( {'request':command.iSync,'data':getProgress()}, getDomain() );
    }

    function updateVelocity() {
        // (|x|^sensitivity) * (+|-)
        velocity = speedMultip*Math.pow(Math.abs(x),sensitivity)*(x>=0?1:-1);
        if (debug) setTimeout( function(){ console.log("Velocity: "+velocity); }), 0;
    }
    
    function atEnd() {
        var flag;
        if (flipV)
            flag = getCurrPos() >= 0;
        else
            flag = getCurrPos() <= -(promptHeight-screenHeight);
        if (debug&&flag) console.log("At top") && false;
        return flag;
    }

    function atStart() {
        var flag;
        if (flipV)
            flag = getCurrPos() <= -(promptHeight-screenHeight);
        else
            flag = getCurrPos() >= 0;
        if (debug&&flag) console.log("At bottom") && false;
        return flag;
    }

    function stopAll() {
        editor.postMessage( {'request':command.stopAll}, getDomain() );
    }

    function stopInstance() {
        x=0;
        updateVelocity();
        resumeAnimation();
        timer.stopTimer();
    }

    document.addEventListener( 'transitionend', function() {
        if(atStart()||atEnd()) {
            stopAll();
            timer.stopTimer();
        }
        if (debug) console.log("Reached end") && false;
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
        return screenWidth/screenHeight;
    }
*/
    // Solve for time to reach end.
    function getRemainingTime( destination, currPos ) {
        return (velocity ? Math.abs(1000*(destination-currPos)/(velocity*unit)) : 0 );
    }

    function setScreenHeight( ) {
        screenHeight = overlay.clientHeight;
    }

    function setScreenWidth( ) {
        screenWidth = overlay.clientWidth;
    }

    function setPromptHeight( ) {
        promptHeight = prompt.clientHeight;
    }

    function setFocusHeight( ) {
        if (overlayFocus!==undefined)
            focusHeight = overlayFocus.clientHeight;
        else
            focusHeight = 0;
    }
    
    function getCurrPos(obj) {
        // There's more than a way to calculate the current position.
        // This is the original method, slower and more reliable. Used only for Intergalactic Style, where the other method fails.
        if (promptStyleOption===4) {
            if (!obj)
                obj=prompt;
            var computedStyle = window.getComputedStyle(obj, null),
                theMatrix = computedStyle.getPropertyValue("transform"),
            // Reading data from matrix.
                mat = theMatrix.match(/^matrix3d\((.+)\)$/);
            if (mat) return parseFloat(mat[1].split(', ')[13]);
                mat = theMatrix.match(/^matrix\((.+)\)$/);
            return mat ? parseFloat(mat[1].split(', ')[5]) : 0;
        }
        // This method is faster, and it's prefered because it generates less lag. Unfortunatelly it fails to calculate in 3D space.
        else
            return prompt.getBoundingClientRect().top;
    }

    function setCurrPosStill( theCurrPos ) {
        if (theCurrPos===undefined)
            theCurrPos = getCurrPos();
        prompt.style.transform = 'translateY('+theCurrPos+'px) scale('+(flipH?-1:1)+','+(flipV?-1:1)+')';
        // If animation is running...
        if (prompt.classList.contains("move")) {
            // Stop animation by removing move class.
            prompt.classList.remove("move");
            // Delete animation rules before setting new ones.
            styleSheet.deleteRule(0);
        }
    }

    function getDestination( currPos ) {
        // Set animation destination
        var whereTo;
        if (velocity>0) {
            if (flipV)
                whereTo = 0;
            else
                whereTo = -(promptHeight-screenHeight);
        }
        else if (velocity<0) {
            if (flipV)
                whereTo = -(promptHeight-screenHeight);
            else
                whereTo = 0;
        }
        else
            // Destination equals current position in animation.
            whereTo = currPos;
        return whereTo;
    }

    function resumeAnimation() {
        // Resumes animation with new destination and time values.
        if (play) {
            // Restart timer.
            timer.startTimer();
            // Get new style variables.
            var currPos = getCurrPos(),
                destination = getDestination(currPos),
                time = getRemainingTime(destination, currPos);
            animate( time, destination );
        }
    }

    function animate( time, destination, curve ) {
        // If no curve parameter, default to linear. This is the equivalent of a function overload.
        if (curve===undefined)
            curve = 'linear';
        // Retain current position.
        setCurrPosStill();
        // Set new animation rules.
        styleSheet.insertRule('\
            .prompt.move {\
                transform: translateY('+destination+'px) scale('+(flipH?-1:1)+','+(flipV?-1:1)+') !important;\
                transition: transform '+time+'ms '+curve+';\
        }', 0);
        // Prevent race condition in Chrome by requesting for current position (not just transform) before resuming animation.
        hack();

        // Resume animation by re adding the class.
        prompt.classList.add("move");
        if (debug) setTimeout( function(){ console.log(/*"Curr: "+getCurrPos()+"\n*/"Dest: "+destination+"\nRemTime "+time) && false; }, 0);
    }
    //https://css-tricks.com/controlling-css-animations-transitions-javascript/

    function hack() {
        return prompt.getBoundingClientRect().top;
        // return prompt.offsetTop;
    }

    function focusVerticalDisplacementCorrector() {
        var vDisp;
        switch (focus) {
            // "None" syncs to top.
            case 3:
            // Sync to "Top".
            case 1:
                vDisp = focusHeight/2;
                break;
            // Sync to "Bottom".
            case 2:
                vDisp = screenHeight-focusHeight/2;
                break;
            // Sync to "Center" by default
            default:
                // If center and flip. Take a little above center
                vDisp = screenHeight/2;
                break;
        }
        //if (debug) window.setTimeout( function() { console.log("Vertical displacement: "+vDisp) && false; };
        return vDisp;
    }

    function moveToCSSAnchor( theAnchor ) {
        var jump;
        if (flipV)
            jump = -promptHeight+document.getElementById(theAnchor).offsetTop + screenHeight-focusVerticalDisplacementCorrector();
        else
            jump = -document.getElementById(theAnchor).offsetTop + focusVerticalDisplacementCorrector();
        if (debug) console.log("Jumped to: "+jump) && false;
        // Jump to anchor
        animate(0, jump);
        // Resume animation
        resumeAnimation();
    }

    function internalMoveToAnchor( theAnchor ) {
        // Proceed to anchor only if anchor is valid.
        if ( document.getElementById( theAnchor ) )
            moveToCSSAnchor( theAnchor );
        else
            if (debug) console.log("Invalid Anchor") && false;
    }
    
    function moveToAnchor( theAnchor ) {
        editor.postMessage( {'request':command.anchor,'data':theAnchor}, getDomain() );
    }

    // Update unit and unit related measurements
    function updateUnit() {
        unit = focusHeight/80;
        relativeLimit = limit*unit;
        if (debug) setTimeout( function(){ console.log("Unit updated: "+unit) && false; });
        resumeAnimation();
    }

    function animationTimeout(time, func) {
        internalPauseAnimation();
        timeout(time, func);
    }

    function timeout( time, func ) {
        // If a timeout is already executing, reset it.
        if (timeoutStatus)
            window.clearTimeout(timeoutStatus);
        // Set: Wait time second before resuming animation
        timeoutStatus = window.setTimeout(func, time);
    }

    function getProgress() {
        // The "previous" values used in getProgress are consistant values that update only during resize or screen rotate.
        // By using these we are able to recalculate position on correctVerticalDisplacement() and improve performance.
        // Solve for current progress. P = (-(currPos+screenHeight-valToCenterAtFocusArea)) / (promptHeight-screenHeight)
        // If flipV solve for...       P = (-(currPos+screenHeight-valToCenterAtFocusArea)) / (promptHeight-screenHeight)
        var progress,
            currPos = getCurrPos();
        if (flipV)
            progress = (-(previousPromptHeight-previousScreenHeight+currPos)-previousVerticalDisplacementCorrector+previousScreenHeight)/-(previousPromptHeight-previousScreenHeight*2);
        else
            progress = (currPos-previousVerticalDisplacementCorrector+previousScreenHeight)/-(previousPromptHeight-previousScreenHeight*2);
        if (debug) { console.log("Progress:") && false; console.log(progress) && false; }
        return progress;
    }
        
    // Wait timeoutDelay after calling event before continuing.
    function correctVerticalDisplacement(percentage, transitionDelay) {
        var delay;
        if (transitionDelay===undefined) {
            transitionDelay = transitionDelays;
            delay = timeoutDelay;
        }   
        else
            delay = transitionDelay/2;
        setPromptHeight();
        // setFocusHeight();
        setScreenHeight();
        // internalPauseAnimation();
        animationTimeout( delay, function() {
            // Get current screen settings. To be used multiple times.
            var updatedPos,
                valToCenterAtFocusArea = focusVerticalDisplacementCorrector();
            if (percentage===undefined)
                percentage = getProgress();
            // Solve
            if (flipV)
                updatedPos = -(-percentage*(promptHeight-screenHeight*2)+valToCenterAtFocusArea-screenHeight)-promptHeight+screenHeight;
            else
                updatedPos = -percentage*(promptHeight-screenHeight*2)+valToCenterAtFocusArea-screenHeight;
            // Update "previous" values to current ones.
            previousPromptHeight = promptHeight;
            previousScreenHeight = screenHeight;
            previousVerticalDisplacementCorrector = valToCenterAtFocusArea;
            // Reset steps
            resetSteps();
            // Correct vertical displacement with a smooth animation.
            animate( transitionDelay, updatedPos, 'ease' );
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

    function onResize() {
        if (debug) console.log("Resize") && false;
        // In case of resolution change, update density unit.
        setPromptHeight();
        setFocusHeight();
        setScreenHeight();
        // setScreenWidth();
        updateUnit();
        // You can guess what the next line does.
        correctVerticalDisplacement();        
    }
    window.addEventListener("resize", onResize, false);

    window.addEventListener("orientationchange", function() {
        //http://stackoverflow.com/questions/5284878/how-do-i-correctly-detect-orientation-change-using-javascript-and-phonegap-in-io
        if (debug) console.log("Orientation Change") && false;
        updateUnit();
        correctVerticalDisplacement();
    }, false);

    window.addEventListener("wheel", function(event) {
        if (debug) console.log(event);
        if (invertedWheel) {
            if (event.deltaY>0)
                increaseVelocity();
            else
                decreaseVelocity();
        }
        else {
            if (event.deltaY>0)
                decreaseVelocity();
            else
                increaseVelocity();
        }
        event.preventDefault();
    }, false);

    // CONTROL RELATED FUNCTIONS

    // FONT SIZE

    function increaseFontSize() {
        editor.postMessage( {'request':11, 'data':getProgress()}, getDomain() );
    }
    function decreaseFontSize() {
        editor.postMessage( {'request':12, 'data':getProgress()}, getDomain() );
    }

    function internalIncreaseFontSize() {
        if (debug) console.log("Increasing font size.");
        if (fontSize<2.5)
            fontSize+=0.05;
        updateFont();
    }

    function internalDecreaseFontSize() {
        if (debug) console.log("Decreasing font size.");
        if (fontSize>0.5)
        fontSize-=0.05;
        updateFont();
    }

    function updateFont() {
        prompt.style.fontSize = fontSize+'em' ;
        overlayFocus.style.fontSize = fontSize+'em' ;
        onResize();
    }

    function updateWidth() {
        prompt.style.width = promptWidth+"vw";
        prompt.style.left = 50-promptWidth/2+"vw";
        // prompt.style.right = 50-promptWidth/2+"%";
        onResize();
    }

    function decreaseVelocity() {
        editor.postMessage( {'request':2,'data':getProgress()}, getDomain() );
    }

    function increaseVelocity() {
        editor.postMessage( {'request':1,'data':getProgress()}, getDomain() );
    }

    function incSteps() {
        steps++;
        if (steps>140)
            instaSync();
        timeout(250, instaSync);
    }

    function resetSteps() {
        steps = 0;
    }

    function internalDecreaseVelocity() {
        if (!atStart()) {
            if (velocity>relativeLimit*-1) {
                x--;
                updateVelocity();
                resumeAnimation();
                incSteps();
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
                resumeAnimation();
                incSteps();
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
        editor.postMessage( {'request':command.pause}, getDomain() );
        if (debug) console.log("Paused") && false;
    }

    function playAnimation() {
        editor.postMessage( {'request':command.play}, getDomain() );
        if (debug) console.log("Playing") && false;
    }
    
    function internalPauseAnimation() {
        editor.postMessage( {'request':command.internalPause}, getDomain() );
    }

    function internalPlayAnimation() {
        editor.postMessage( {'request':command.internalPlay}, getDomain() );
    }

    function localPauseAnimation() {
        animate(0, getCurrPos());
        timer.stopTimer();
    }

    function localPlayAnimation() {
        resumeAnimation();
    }

    function resetTimer() {
        editor.postMessage( {'request':command.resetTimer}, getDomain() );
    }

    function internalResetTimer() {
        timer.resetTimer();
        playAnimation();
        if (debug) console.log("Timer reset.");
    }

    function listener(event) {
        // Message data. Uncommenting will give you valuable information and decrease performance dramatically.
        /*
        setTimeout(function() {
            if (debug) {
                console.log("Editor:") && false;
                console.log(event) && false;
            }
        }, 0);
        */
        // If the event comes from the same domain...
        if (!cap&&!event.domain||event.domain===getDomain()) {
            // Act according to the message.
            var message = event.data;
            if(message.request==command.increaseVelocity||message.request==command.decreaseVelocity)
                setCap();
            switch (message.request) {
                case 1 :
                    internalIncreaseVelocity();
                    //requestAnimationFrame(internalIncreaseVelocity);
                    break;
                case 2 :
                    internalDecreaseVelocity();
                    //requestAnimationFrame(internalDecreaseVelocity);
                    break;
                case command.iSync :
                    requestAnimationFrame(function(){
                        correctVerticalDisplacement(message.data,0);
                    });
                    break;
                case command.sync :
                    requestAnimationFrame(function(){
                        correctVerticalDisplacement(message.data);
                    });
                    break;
                case command.stopAll :
                    requestAnimationFrame(stopInstance);
                    break;
                case command.play :
                    play=true;
                case command.internalPlay :
                    requestAnimationFrame(localPlayAnimation);
                    break;
                case command.pause :
                    requestAnimationFrame(localPauseAnimation);
                    play=false;
                    syncPrompters();
                    break;
                case command.internalPause :
                    requestAnimationFrame(localPauseAnimation);
                    break;
                case command.togglePlay :
                    toggleAnimation();
                    break;
                case command.resetTimer :
                    internalResetTimer();
                    break;
                case command.anchor :
                    requestAnimationFrame(function(){
                        internalMoveToAnchor(message.data);
                    });
                    break;
                case command.incFont :
                    internalIncreaseFontSize();
                    break;
                case command.decFont :
                    internalDecreaseFontSize();
                    break;
                case command.update :
                    updateContents();
                    break;
                case command.close :
                    closeInstance();
                    break;
                default :
                    // Notify unknown message received.
                    if (debug) console.log("Unknown post message received: "+message.request) && false;
            }
        }
    }

    // Initialize postMessage event listener.
    addEventListener("message", listener, false);

    // When calling from main process, run function to...
    if (ipcRenderer!==undefined)
        ipcRenderer.on('asynchronous-reply', function(event, arg) {
            if (arg.option === "message") {
                listener( {data:arg.data, domain:getDomain()} );
            }
        });

    addEventListener("message", listener, false);

    function resetCap() {
        cap = false;
    }

    function setCap() {
        cap = true;
        setTimeout(resetCap, inputCapDelay);
    }

    function toggleTouchControls() {

    }

    document.onkeydown = function( event ) {
        var key;
        // keyCode is announced to be deprecated but not all browsers support key as of 2016.
        if (event.key === undefined)
            event.key = event.keyCode;
        if (debug) console.log("Key: "+event.key) && false;
        switch ( event.key ) {
            case "s":
            case "S":
            case "ArrowDown":
            case 40: // Down
            case 68: // S
                increaseVelocity();
                break;
            case "w":
            case "W":
            case "ArrowUp":
            case 38: // Up
            case 87: // W
                decreaseVelocity();
                break;
            case "d":
            case "D":
            case "ArrowRight":
            case 83: // S
            case 39: // Right
                increaseFontSize();
                break;
            case "a":
            case "A":
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
            case 121:
            case "F10":
            case 123:
            case "F12":
                if (!inIframe())
                    toggleDebug();
                break;
            case 8:
            case "Backspace":
            case "backspace":
                resetTimer();
                break;
            default: // Move to anchor.
                // If key is not a string
                if(!isFunction(event.key.indexOf))
                    key = String.fromCharCode(event.key);
                else
                    key = event.key;
                //if ( key.indexOf("Key")===0 || key.indexOf("Digit")===0 )
                //      key = key.charAt(key.length-1);
                if ( !is_int(key) )
                    key = key.toLowerCase();
                if (debug) console.log(key);
                moveToAnchor( key );
        }
        // Prevent arrow and spacebar scroll bug.
        if ([" ","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(event.key) > -1 && event.preventDefault)
            event.preventDefault();
    };

    function remoteControls() {
        var res;
        dataManager.getItem("IFTeleprompterControl",function(data){
            res = JSON.parse(data);
        },0,false);
        if(typeof res !== "undefined"){
            if(res.hasOwnProperty('key') > 0){
                document.onkeydown(res);
            }
        }
        setTimeout(remoteControls, 0);
    }

    function isFunction( possibleFunction ) {
        return typeof(possibleFunction)===typeof(Function)
    }

    function is_int(value){
        if (parseFloat(value) == parseInt(value) && !isNaN(value))
            return true;
        else
            return false;
    }

    // Initialize objects after DOM is loaded
    if (document.readyState === "interactive" || document.readyState === "complete")
        // Call init if the DOM (interactive) or document (complete) is ready.
        init();
    else
        // Set init as a listener for the DOMContentLoaded event.
        document.addEventListener("DOMContentLoaded", init);

}());

function inIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

function inElectron() {
    return navigator.userAgent.indexOf("Electron")!=-1;
}
