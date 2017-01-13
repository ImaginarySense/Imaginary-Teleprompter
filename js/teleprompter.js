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
    var settings, session, prompt, pointer, overlay, overlayFocus, styleElement, styleSheet, editor;
    // Global variables
    var unit, x, velocity, sensitivity, speedMultip, relativeLimit, steps, play, timeoutStatus, invertedWheel, focus, promptStyleOption, customStyle, flipV, flipH, fontSize, previousPromptHeight, previousScreenHeight, previousScreenWidth, previousVerticalDisplacementCorrector, domain, debug, closing, cap, syncDelay, isMobileApp;
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

    // Global constants
    const transitionDelays = 500,
        timeoutDelay = 250,
        inputCapDelay = 100,
        limit = 2600;
    
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
        pointer = {};

        // Initialize CSS
        initCSS();

        // Initialize variables
        // HTTP GET debug option...
        debug = getUrlVars()["debug"];
        // Evaluate it to boolean expresion.
        debug = debug>0||debug=="true";

        // Init variables. Do not change these unless you know what you are doing.
        x = 0;
        velocity = 0;
        closing = false;
        cap = false;
        syncDelay = 12;
        isMobileApp = false;
        
        // Animation settings
        play = true;
        sensitivity = 1.2;
        speedMultip = 13;

        // Local Storage and Session data
        updateDatamanager();

        // Set values relative to unit size.
        updateUnit();
        
        // Initialize domain for interprocess communication
        setDomain();

        // Locate and set editor
        if (window.opener)
            editor = window.opener;
        else if (window.top)
            editor = window.top;

        // Sync delay control.
        resetSteps();
        // Get focus mode
        focus = settings.data.focusMode;
        // Get and set prompter text
        updateContents();
        // Get prompter style
        promptStyleOption = settings.data.prompterStyle;
        customStyle = { "background": settings.data.background, "color": settings.data.color, "overlayBg": settings.data.overlayBg };
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
        styleInit();
        setStyle( promptStyleOption );

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
        if (debug) console.log("Updating prompter");
        updateDatamanager();
        internalPauseAnimation();
        //var currProgress = getProgress();
        prompt.innerHTML = decodeURIComponent(session.html);
        //correctVerticalDisplacement( currProgress );
        internalPlayAnimation();
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
            console.log("Entering debug mode.");
        }
    }

    function restoreRequest() {
        // "closing" mutex prevents infinite loop.
        if (debug) console.log("Restore request.") && false;
        // If we have normal access to the editor, request it to restore the prompters.
        if (editor)
            editor.postMessage( {'request':command.restoreEditor}, getDomain() );
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
        editor.postMessage( {'request':command.sync,'data':getProgress()}, getDomain() );
    }

    function instaSync( forceSync ) {
        if (forceSync||steps>syncDelay) {
            editor.postMessage( {'request':command.iSync,'data':getProgress()}, getDomain() );
            resetSteps();
        }
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
            flag = getCurrPos() <= -(getPromptHeight()-getScreenHeight());
        if (debug&&flag) console.log("At top") && false;
        return flag;
    }

    function atStart() {
        var flag;
        if (flipV)
            flag = getCurrPos() <= -(getPromptHeight()-getScreenHeight());
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
        updateAnimation();
    }

    document.addEventListener( 'transitionend', function() {
        if(atStart()||atEnd())
            stopAll();
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
        return getScreenWidth()/getScreenHeight();
    }
*/
    // Solve for time to reach end.
    function getRemainingTime(destination) {
        if ( destination===undefined )
            destination = getDestination();
        var paddingDifference = 0,
            time = Math.abs(1000*(destination-getCurrPos())/(velocity*unit));
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
        // There's more than a way to calculate the current position.
        // This is the original method, slower and more reliable. Used only for Intergalactic Style, where the other method fails.
        if (promptStyleOption===3) {
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

    function setCurrPosStill( theCurrPos, obj ) {
        if (obj===undefined)
            obj = prompt;
        if (theCurrPos===undefined)
            theCurrPos = getCurrPos();
        // If animation is running...
        //prompt.style.top = theCurrPos+'px';
        obj.style.transform = 'translateY('+theCurrPos+'px) scale('+(flipH?-1:1)+','+(flipV?-1:1)+')';
        if (prompt.classList.contains("move")) {
            // Stop animation by removing move class.
            obj.classList.remove("move");
            // Delete animation rules before setting new ones.
            styleSheet.deleteRule(0);
        }
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
            var destination = getDestination(),
                time = getRemainingTime(destination);
            
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
        if (debug) setTimeout( function(){ console.log("Curr: "+getCurrPos()+"\nDest: "+destination+"\nRemTime "+time) && false; }, 0);
    }
    //https://css-tricks.com/controlling-css-animations-transitions-javascript/

    function hack() {
        return prompt.offsetTop;
    }

    function focusVerticalDisplacementCorrector() {
        var vDisp;
        switch (focus) {
            // "None" syncs to top.
            case 3:
            // Sync to "Top".
            case 1:
                vDisp = getFocusHeight()/2;
                break;
            // Sync to "Bottom".
            case 2:
                vDisp = getScreenHeight()-getFocusHeight()/2;
                break;
            // Sync to "Center" by default
            default:
                // If center and flip. Take a little above center
                vDisp = getScreenHeight()/2;
                break;
        }
        //if (debug) window.setTimeout( function() { console.log("Vertical displacement: "+vDisp) && false; };
        return vDisp;
    }

    function moveToCSSAnchor( theAnchor ) {
        var jump;
        if (flipV)
            jump = -getPromptHeight()+document.getElementById(theAnchor).offsetTop + getScreenHeight()-focusVerticalDisplacementCorrector();
        else
            jump = -document.getElementById(theAnchor).offsetTop + focusVerticalDisplacementCorrector();
        if (debug) console.log("Jumped to: "+jump) && false;
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
            if (debug) console.log("Invalid Anchor") && false;
    }
    
    function moveToAnchor( theAnchor ) {
        editor.postMessage( {'request':command.anchor,'data':theAnchor}, getDomain() );
    }

    // Update unit and unit related meassurements
    function updateUnit() {
        unit = getFocusHeight()/80;
        relativeLimit = limit*unit;
        if (debug) setTimeout( function(){ console.log("Unit updated: "+unit) && false; });
        updateAnimation();
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
        internalPauseAnimation();
        animationTimeout( delay, function() {
            // Get current screen settings. To be used multiple times.
            var updatedPos,
                promptHeight = getPromptHeight(),
                screenHeight = getScreenHeight(),
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

    window.addEventListener("resize", function() {
        if (debug) console.log("Resize") && false;
        // In case of resolution change, update density unit.
        updateUnit();
        // You can guess what the next line does.
        correctVerticalDisplacement();
    }, false);

    window.addEventListener("orientationchange", function() {
        //http://stackoverflow.com/questions/5284878/how-do-i-correctly-detect-orientation-change-using-javascript-and-phonegap-in-io
        if (debug) console.log("Orientation Change") && false;
        updateUnit();
        correctVerticalDisplacement();
    }, false);

    window.addEventListener("wheel", function(event) {
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
        fontSize++;
        updateFont();
    }

    function decreaseFontSize() {
        fontSize--;
        updateFont();
    }

    function updateFont() {
        //dev: ToDo
        //prompt.classList.add();
    }

    function decreaseVelocity() {
        editor.postMessage( {'request':2,'data':getProgress()}, getDomain() );
    }

    function increaseVelocity() {
        editor.postMessage( {'request':1,'data':getProgress()}, getDomain() );
    }

    function incSteps() {
        steps++;
        if (steps>40) {
            instaSync();
            resetSteps();
        }
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
                updateAnimation();
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
                updateAnimation();
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
    }

    function localPlayAnimation() {
        updateAnimation();
    }

    /*
    function storageEvents(event) {
        switch (event.key) {
            case 'html' :
                //updateContents(event.newValue);
                break;
        }
    }
    window.addEventListener("storage", storageEvents, true);
    */

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
                case command.anchor :
                    requestAnimationFrame(function(){
                        internalMoveToAnchor(message.data);
                    });
                    break;
                case command.incFont :
                    increaseFontSize();
                    break;
                case command.decFont :
                    decreaseFontSize();
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
            case 119:
            case "F8":
            case 123:
            case "F12":
                toggleDebug();
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
