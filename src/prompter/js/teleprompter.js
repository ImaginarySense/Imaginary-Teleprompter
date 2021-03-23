/*
    Imaginary Teleprompter
    Copyright (C) 2015-2021 Imaginary Sense Inc. and contributors

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

// Global constants
const transitionDelays = 500,
    timeoutDelay = 250,
    inputCapDelay = 100,
    limit = 2600;

class Prompter {
    constructor() {
        // Import Electron libraries.
        if (inElectron() && !inIframe()) {
            const electron = require('electron');
            this.remote = require('@electron/remote'); // Allow IPC with main process in Electron.
            this.ipcRenderer = electron.ipcRenderer;
        }
    }

    initCSS() {
        // Create style elements.
        var styleElement = document.createElement('style');
        // Append style elements to head.
        document.head.appendChild(styleElement);
        // Grab element's style sheet.
        this.styleSheet = styleElement.sheet;
    }

    get prompt() {
        return document.getElementsByClassName("prompt")[0];
    }

    get overlay() {
        return document.getElementById("overlay");
    }

    get overlayFocus() {
        return document.getElementById("overlayFocus");
    }

    get clock() {
        return document.getElementsByClassName("clock")[0];
    }

    init() {
        // Initialize commands mapping
        teleprompter.commandsMapping = new CommandsMapping(this);

        // Initialize objects
        this.pointer = {};
    
        // Initialize variables
        // HTTP GET debug option...
        this.debug = this.getUrlVars()["debug"];
        // Evaluate it to boolean expresion.
        this.debug = this.debug > 0 || this.debug == "true";
        // Load debug tools if debug is enabled.
        if (this.debug) {
            this.debug = false;
            this.toggleDebug();
        }
    
        // Init variables. Do not change these unless you know what you are doing.
        this.x = 0;
        this.velocity = 0;
        this.closing = false;
        this.cap = false;
        this.syncDelay = 12;
        this.resetSteps();
        
        // Local Storage and Session data
        this.updateDatamanager();
    
        // Set initial relative values.
        this.setFocusHeight();
        this.setScreenHeight();
        this.setScreenWidth();
        this.updateUnit();
        
        // Initialize domain for interprocess communication
        this.setDomain();
    
        // Initialize CSS
        this.initCSS();
    
        // Locate and set editor
        if (window.opener)
            this.editor = window.opener;
        else if (window.top)
            this.editor = window.top;
        else if (ipcRenderer!==undefined) {
            // Untested code
            this.editor = {};
            this.editor.postMessage = function(event, domain) {
                this.ipcRenderer.send('asynchronous-message', event);
            }.bind(this);
        }
        this.resetSteps();
        // Animation settings
        this.play = true;
        // Get focus mode
        this.focus = this.settings.data.focusMode;
    
        this.timer = $('.clock').timer({
            stopVal: 10000,
            direction: 'ccw'
        });
        // Get and set prompter text
        this.updateContents();
        this.setPromptHeight();
        
        // Get prompter style
        this.promptStyleOption = this.settings.data.prompterStyle;
        this.customStyle = { "background": this.settings.data.background, "color": this.settings.data.color, "overlayBg": this.settings.data.overlayBg };
        // Get flip settings
        if (this.inIframe())
            this.flip = this.settings.data.primary;
        else
            this.flip = this.settings.data.secondary;
        
        // Initialize flip values
        this.flipH = false;
        this.flipV = false;
        // Set flip values to prompter settings
        switch (this.flip) {
            case 2:
                this.flipH = true;
                break;
            case 3:
                this.flipV = true;
                break;
            case 4:
                this.flipH = true;
                this.flipV = true;
                break;
        }
        // Set focus area according to settings.
        switch (this.focus) {
            case 1:
                if (this.flipV)
                    document.querySelector("#overlayBottom").classList.add("disable");
                else
                    document.querySelector("#overlayTop").classList.add("disable");
                break;
            case 2:
                if (this.flipV)
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
        this.setFlips();
    
        // Initialize themes
        teleprompter.themes = new Themes();
    
        teleprompter.themes.styleInit();
        teleprompter.themes.setStyle(this.promptStyleOption);
    
        // Wheel settings
        this.invertedWheel = false; //settings.data.invertedWheel;
    
        // Add pointer controls
        // Stop animation while pressing on the screen, resume on letting go.
        var touchOverlay = document.getElementById("touchOverlay");
        touchOverlay.addEventListener("pointerdown", function(event) {
            this.pointerActive(event);
        }.bind(this));
        touchOverlay.addEventListener("pointerup", function(event) {
            this.pointerInactive(event);
        }.bind(this));
        touchOverlay.addEventListener("pointerleave", function(event) {
            this.pointerInactive(event);
        }.bind(this));
        touchOverlay.addEventListener("pointermove", function(event) {
            this.pointerMove(event);
        }.bind(this));

        console.log("promptHeight", this.promptHeight);
    
        // Wait a moment to prevent possible asynchronic CSS issues.
        window.setTimeout(function() {
            this.setScreenHeight();
            this.setPromptHeight();
            // If flipped vertically, set start at inverted top.
            if (this.flipV) {
                this.animate(0,-this.promptHeight+this.screenHeight);
            }
    
            // Save current screen position related settings for when resize and screen rotation ocurrs.
            this.previousPromptHeight = this.promptHeight;
            this.previousScreenHeight = this.screenHeight;
            this.previousScreenHeight = this.screenHeight;
            this.previousVerticalDisplacementCorrector = this.focusVerticalDisplacementCorrector();
            
            // Sync prompter positions to smallest at start.
            this.syncPrompters();
    
            window.setTimeout( function() {
                // Begin animation at i speed.
                for (var i=0; i<2; i++)
                    this.increaseVelocity();
                this.instaSync();
            }.bind(this), transitionDelays*4.2);
            
        }.bind(this), 750);

        // On close
        window.addEventListener("beforeunload", function() {
            this.restoreRequest()
        }.bind(this));

        document.addEventListener( 'transitionend', function() {
            if(this.atStart() || this.atEnd()) {
                this.stopAll();
                this.timer.stopTimer();
            }
            if (this.debug) console.log("Reached end") && false;
        }.bind(this), false);

        window.addEventListener("resize", function() {
            this.onResize();
        }.bind(this), false);

        window.addEventListener("orientationchange", function() {
            //http://stackoverflow.com/questions/5284878/how-do-i-correctly-detect-orientation-change-using-javascript-and-phonegap-in-io
            if (this.debug) console.log("Orientation Change") && false;
            this.updateUnit();
            this.correctVerticalDisplacement();
        }.bind(this), false);

        window.addEventListener("wheel", function(event) {
            if (this.debug) console.log(event);
            if (this.invertedWheel) {
                if (event.deltaY > 0)
                    this.increaseVelocity();
                else
                    this.decreaseVelocity();
            }
            else {
                if (event.deltaY > 0)
                    this.decreaseVelocity();
                else
                    this.increaseVelocity();
            }
            event.preventDefault();
        }.bind(this), false);

        // Initialize postMessage event listener.
        addEventListener("message", function(event) {
            this.listener(event);
        }.bind(this), false);

        // When calling from main process, run function to...
        if (this.ipcRenderer !== undefined)
            this.ipcRenderer.on('asynchronous-reply', function(event, arg) {
                if (arg.option === "message") {
                    this.listener({
                        data: arg.data, 
                        domain: this.getDomain()
                    });
                }
            }.bind(this));
        
        document.addEventListener('keydown', function(event) {
            this.commandsListener(event);
        }.bind(this));
    }

    updateDatamanager() {
        dataManager.getItem('IFTeleprompterSettings', function(data){
            this.settings = JSON.parse(data);
        }.bind(this), 1, false);
        
        dataManager.getItem('IFTeleprompterSession', function(data){
            this.session = JSON.parse(data);
        }.bind(this), 1, false);
        // Ensure content is being passed
        // console.log(session);
    }

    updateContents() {
        // 
        // prompt = document.getElementsByClassName("prompt")[0];
        // overlay = document.getElementById("overlay");
        // overlayFocus = document.getElementById("overlayFocus");
        // 
        if (this.debug) console.log("Updating prompter");
        this.updateDatamanager();

        var oldFontSize = this.fontSize,
            oldPromptWidth = this.promptWidth;
        this.fontSize = this.settings.data.fontSize/100;
        this.speedMultip = this.settings.data.speed;
        this.sensitivity = this.settings.data.acceleration;
        this.promptWidth = this.settings.data.promptWidth;
        // If updating font, update it and resync
        if (oldFontSize !== this.fontSize)
            this.updateFont();
        if (oldPromptWidth !== this.promptWidth)
            this.updateWidth();
        // If screen is vertically flipped, resync
        else if (this.flipV) {
            this.onResize();
            window.setTimeout(function() {
                this.onResize();
            }.bind(this), transitionDelays*1.1);
        }
        this.prompt.innerHTML = decodeURIComponent(this.session.html);
        this.updateVelocity();
        
        // Enable timer
        if (this.settings.data.timer===true) {
            if (this.timer.data().timer.currentVal===0)
            this.timer.startTimer();
            this.clock.style.opacity = '1';
        }
        else {
            this.clock.style.opacity = '0';
            setTimeout(function() {
                this.timer.resetTimer();
                this.timer.stopTimer();
            }.bind(this), 800);
        }
    }

    pointerActive(event) {
        if (!this.pointer.active) {
            if (this.debug) console.log("Pointer active") && false;
            this.internalPauseAnimation();
            this.pointer.prompterstart = this.getCurrPos();
            this.pointer.startposition = event.clientY;
            this.pointer.previousposition = this.pointer.startposition;
            this.pointer.active = true;
        }
    }
    
    pointerInactive() {
        if (this.pointer.active) {
            if (!this.pointer.moved)
                this.toggleTouchControls();
            if (this.debug) console.log("Pointer inactive") && false;
            this.pointer.moved = false;
            this.pointer.active = false;
            //letGoAnimation();
            this.timeout(0, function() {
                this.syncPrompters();
            }.bind(this));
            this.internalPlayAnimation();
        }
    }

    letGoAnimation() {
        var fallPosition = this.getCurrPos()+this.pointer.delta * 9,
            fallDelay = this.pointer.delta * 1000;
        this.animate(fallDelay, fallPosition, "ease-out");
    }
    
    pointerMove(event) {
        if (this.pointer.active) {
            // Get current point location
            var argument,
                pointerCurrPos = event.clientY,
                distance = pointerCurrPos - this.pointer.startposition;
            this.pointer.moved = true;
            this.pointer.delta = pointerCurrPos - this.pointer.previousposition;
            this.pointer.deltaTime = this.pointer.deltaTime;
            argument = this.pointer.prompterstart + distance;
            // Update previous position value.
            this.pointer.previousposition = pointerCurrPos;
            // Debug info
            if (debug) console.log("Pointer start: "+this.pointer.startposition+"\nPointer at: "+this.pointerCurrPos+"\nDistance: "+distance+"\nDelta: "+this.pointer.delta) && false;
            // Move to pointed position.
            this.setCurrPosStill(argument);
        }
    }
    
    toggleDebug() {
        // I do these the long way because debug could also be a numeric.
        if (this.debug) {
            this.debug = false;
            console.log("Leaving debug mode.");
        }
        else {
            this.debug = true;
            if (inElectron() && !this.inIframe())
                this.remote.getCurrentWindow().toggleDevTools();
            console.log("Entering debug mode.");
        }
    }
    
    restoreRequest() {
        // "closing" mutex prevents infinite loop.
        if (this.debug) console.log("Restore request.") && false;
        // If we have normal access to the editor, request it to restore the prompters.
        if (this.editor)
            this.editor.postMessage( {'request': teleprompter.commandsMapping.command.restoreEditor}, this.getDomain() );
        else if (!this.inIframe() && this.ipcRenderer!==undefined)
            this.ipcRenderer.send('asynchronous-message', 'restoreEditor');
        // In all cases, clean emulated session storage before leaving.
        dataManager.removeItem('IFTeleprompterSession',1);
    }

    closeInstance() {
        if (!this.closing) {
            this.closing = true;
            // Finally, close this window or clear iFrame. The editor must not be the one who closes cause it could cause an infinite loop.
            if (this.inIframe()) {
                if (this.debug) console.log("Closing iFrame prompter.") && false;
                document.location = "about:blank";//"blank.html";
            }
            else {
                if (this.debug) console.log("Closing window prompter.") && false;
                window.close();
            }
        }
    }

    setDomain() {  
        // Get current domain from browser
        this.domain = document.domain;
        // If site not running on a server, set as catchall.
        if (this.domain.indexOf("http://") != 0 || this.domain.indexOf("https://") != 0)
            this.domain = "*";
    }
    
    getDomain() {
        return this.domain;
    }
    
    setFlips() {
        //dev@javi: Add support for real-time flipping.
        // Both flips
        if (this.flipH && this.flipV) {
            this.prompt.classList.add("flipHV");
            this.clock.classList.add("flipHV");
        }
        // Vertical flip
        else if (this.flipV) {
            this.prompt.classList.add("flipV");
            this.clock.classList.add("flipV");
        }
        // Horizontal flip
        else if (this.flipH) {
            this.prompt.classList.add("flipH");
            this.clock.classList.add("flipH");
        }
    }
    
    syncPrompters() {
        this.editor.postMessage({
            'request':teleprompter.commandsMapping.command.sync,
            'data': this.getProgress()
        }, this.getDomain());
    }

    instaSync() {
        if (this.steps > this.syncDelay)
            this.editor.postMessage({
                'request': teleprompter.commandsMapping.command.iSync,
                'data': this.getProgress()
            }, this.getDomain());
    }
    
    updateVelocity() {
        this.velocity = this.speedMultip * Math.pow(Math.abs(this.x), this.sensitivity) * (this.x>=0 ? 1 : -1);
        if (this.debug) setTimeout(function(){
            console.log("Velocity: " + this.velocity);
        }.bind(this)), 0;
    }
    
    atEnd() {
        var flag;
        if (this.flipV)
            flag = this.getCurrPos() >= 0;
        else
            flag = this.getCurrPos() <= -(this.promptHeight-this.screenHeight);
        if (this.debug && flag) console.log("At top") && false;
        return flag;
    }
    
    atStart() {
        var flag;
        if (this.flipV)
            flag = this.getCurrPos() <= -(this.promptHeight-this.screenHeight);
        else
            flag = this.getCurrPos() >= 0;
        if (this.debug && flag) console.log("At bottom") && false;
        return flag;
    }

    stopAll() {
        this.editor.postMessage({
            'request': teleprompter.commandsMapping.command.stopAll
        }, this.getDomain());
    }
    
    stopInstance() {
        this.x = 0;
        this.updateVelocity();
        this.resumeAnimation();
        this.timer.stopTimer();
    }

    // Gets variables from HTTP GET.
    getUrlVars() {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = value;
        });
        return vars;
    }

    // Solve for time to reach end.
    getRemainingTime(destination, currPos) {
        return (this.velocity ? Math.abs(1000*(destination - currPos) / (this.velocity * this.unit)) : 0);
    }

    setScreenHeight( ) {
        this.screenHeight = overlay.clientHeight;
    }

    setScreenWidth( ) {
        this.screenWidth = overlay.clientWidth;
    }

    setPromptHeight( ) {
        this.promptHeight = this.prompt.clientHeight;
    }

    setFocusHeight( ) {
        if (this.overlayFocus !== undefined)
            this.focusHeight = this.overlayFocus.clientHeight;
        else
            this.focusHeight = 0;
    }

    getCurrPos(obj) {
        // There's more than a way to calculate the current position.
        // This is the original method, slower and more reliable. Used only for Intergalactic Style, where the other method fails.
        if (this.promptStyleOption===4) {
            if (!obj)
                obj = this.prompt;
            var computedStyle = window.getComputedStyle(obj, null),
                theMatrix = computedStyle.getPropertyValue("transform"),
                // Reading data from matrix.
                max = theMatrix.match(/^matrix3d\((.+)\)$/);
            if (mat) return parseFloat(mat[1].split(', ')[13]);
                mat = theMatrix.match(/^matrix\((.+)\)$/);
            return mat ? parseFloat(mat[1].split(', ')[5]) : 0;
        }
        // This method is faster, and it's prefered because it generates less lag. Unfortunatelly it fails to calculate in 3D space.
        else {
            return this.prompt.getBoundingClientRect().top;
        }  
    }
    
    setCurrPosStill(theCurrPos) {
        if (this.theCurrPos===undefined)
            this.theCurrPos = this.getCurrPos();
            this.prompt.style.transform = 'translateY('+theCurrPos+'px) scale('+(this.flipH?-1:1)+','+(this.flipV?-1:1)+')';
        // If animation is running...
        if (this.prompt.classList.contains("move")) {
            // Stop animation by removing move class.
            this.prompt.classList.remove("move");
            // Delete animation rules before setting new ones.
            this.styleSheet.deleteRule(0);
        }
    }
    
    getDestination(currPos) {
        // Set animation destination
        var whereTo;
        if (this.velocity > 0) {
            if (this.flipV)
                whereTo = 0;
            else
                whereTo = -(this.promptHeight-this.screenHeight);
        }
        else if (this.velocity < 0) {
            if (this.flipV)
                whereTo = -(this.promptHeight-this.screenHeight);
            else
                whereTo = 0;
        }
        else
            // Destination equals current position in animation.
            whereTo = currPos;
        return whereTo;
    }
    
    resumeAnimation() {
        // Resumes animation with new destination and time values.
        if (this.play) {
            // Restart timer.
            this.timer.startTimer();
            // Get new style variables.
            var currPos = this.getCurrPos(),
                destination = this.getDestination(currPos),
                time = this.getRemainingTime(destination, currPos);
            this.animate(time, destination);
        }
    }
    
    animate(time, destination, curve = undefined) {
        // If no curve parameter, default to linear. This is the equivalent of a function overload.
        if (curve === undefined)
            curve = 'linear';
        // Retain current position.
        this.setCurrPosStill();
        // Set new animation rules.
        this.styleSheet.insertRule('\
            .prompt.move {\
                transform: translateY('+destination+'px) scale('+(this.flipH?-1:1)+','+(this.flipV?-1:1)+') !important;\
                transition: transform '+time+'ms '+curve+';\
        }', 0);
        // Prevent race condition in Chrome by requesting for current position (not just transform) before resuming animation.
        this.hack();
    
        // Resume animation by re adding the class.
        this.prompt.classList.add("move");
        if (this.debug) setTimeout( function(){ console.log(/*"Curr: "+getCurrPos()+"\n*/"Dest: "+destination+"\nRemTime "+time) && false; }, 0);
    }
    //https://css-tricks.com/controlling-css-animations-transitions-javascript/
    
    hack() {
        return this.prompt.getBoundingClientRect().top;
        // return prompt.offsetTop;
    }
    
    focusVerticalDisplacementCorrector() {
        var vDisp;
        switch (this.focus) {
            // "None" syncs to top.
            case 3:
            // Sync to "Top".
            case 1:
                vDisp = this.focusHeight / 2;
                break;
            // Sync to "Bottom".
            case 2:
                vDisp = this.screenHeight - this.focusHeight / 2;
                break;
            // Sync to "Center" by default
            default:
                // If center and flip. Take a little above center
                vDisp = this.screenHeight / 2;
                break;
        }
        //if (debug) window.setTimeout( function() { console.log("Vertical displacement: "+vDisp) && false; };
        return vDisp;
    }
    
    moveToCSSAnchor(theAnchor) {
        var jump;
        if (this.flipV)
            jump = -this.promptHeight + document.getElementById(theAnchor).offsetTop + this.screenHeight - this.focusVerticalDisplacementCorrector();
        else
            jump = -document.getElementById(theAnchor).offsetTop + this.focusVerticalDisplacementCorrector();
        if (this.debug) console.log("Jumped to: " + jump) && false;
        // Jump to anchor
        this.animate(0, jump);
        // Resume animation
        this.resumeAnimation();
    }
    
    internalMoveToAnchor(theAnchor) {
        // Proceed to anchor only if anchor is valid.
        if (document.getElementById(theAnchor))
            this.moveToCSSAnchor(theAnchor);
        else
            if (this.debug) console.log("Invalid Anchor") && false;
    }
    
    moveToAnchor(theAnchor) {
        this.editor.postMessage( {'request':teleprompter.commandsMapping.command.anchor,'data':theAnchor}, this.getDomain());
    }
    
    moveToNextAnchor(theAnchor) {
        this.editor.postMessage( {'request':teleprompter.commandsMapping.command.anchor,'data':theAnchor}, this.getDomain());
    }
    
    internalMoveToNextAnchor(next) {
        const anchors = document.getElementsByTagName("a"),
                currPos = -this.getCurrPos(),
                verticalDisplacement = this.focusVerticalDisplacementCorrector();
        let jump = 0;
        if (this.debug) console.log("currPos", currPos);
        if (next)
            // Check flipV before loop to reduce cycles.
            if (this.flipV) {
                jump = -this.promptHeight + this.screenHeight;
                for (let i=0; i<anchors.length; i++) {
                    if (this.debug) console.log("i", i);
                    if (this.debug) console.log('offsetTop', anchors[i].offsetTop);
                    if (this.promptHeight - anchors[i].offsetTop + verticalDisplacement - this.screenHeight < currPos) {
                        jump = -this.promptHeight + anchors[i].offsetTop + this.screenHeight - verticalDisplacement;
                        break;
                    }
                }
            }
            else
                for (let i=0; i<anchors.length; i++) {
                    if (this.debug) console.log("i", i);
                    if (this.debug) console.log('offsetTop', anchors[i].offsetTop);
                    if (anchors[i].offsetTop - verticalDisplacement > currPos) {
                        jump = -anchors[i].offsetTop + verticalDisplacement;
                        break;
                    }
                }
        else {
            // Add width based padding when jumping to previous evaluations.
            const padding = x && !next >= 0 ? this.screenWidth / 4.8 : 0;
            if (this.flipV) {
                jump = -this.promptHeight + this.screenHeight;
                for (let i=anchors.length-1; i>=0; i--) {
                    if (this.debug) console.log("i", i);
                    if (this.debug) console.log('offsetTop', anchors[i].offsetTop);
                    if (this.promptHeight - anchors[i].offsetTop + verticalDisplacement - this.screenHeight - padding - 1 > currPos) {
                        jump = -this.promptHeight + anchors[i].offsetTop + this.screenHeight - verticalDisplacement;
                        break;
                    }
                }
            }
            else
                for (let i=anchors.length-1; i>=0; i--) {
                    if (this.debug) console.log("i", i);
                    if (this.debug) console.log('offsetTop', anchors[i].offsetTop);
                    if (anchors[i].offsetTop - verticalDisplacement + padding < currPos) {
                        jump = -anchors[i].offsetTop + verticalDisplacement;
                        break;
                    }
                }
        }
        // Move within movable area or from top to start.
        if (!this.flipV && jump < 0 || this.flipV && jump > -this.promptHeight + this.screenHeight || !this.flipV && !next || this.flipV && !next) {
            this.animate(0, jump);
            this.resumeAnimation();
            this.timeout(0.5, this.syncPrompters);
        }
    }
    
    internalFastForward() {
        const currPos = this.getCurrPos();
        if (this.flipV) {
            if (currPos < 0 - this.screenHeight * 0.5) {
                const nextPos = currPos + this.screenHeight / 2;
                this.animate(0, nextPos);
                this.resumeAnimation();
                this.timeout(0.5, this.syncPrompters);
            }
        }
        else
            if (currPos > -this.promptHeight + this.screenHeight * 1.5) { // < 0 || flipV && jump > -promptHeight + screenHeight || !flipV && !next || flipV && !next ) {
                const nextPos = currPos - this.screenHeight / 2;
                this.animate(0, nextPos);
                this.resumeAnimation();
                this.timeout(0.5, this.syncPrompters);
            }
    }
    
    internalRewind() {
        const currPos = this.getCurrPos();
        if (flipV) {
            if (currPos > -this.promptHeight + this.screenHeight*1.5) { // < 0 || flipV && jump > -promptHeight + screenHeight || !flipV && !next || flipV && !next ) {
                const nextPos = currPos - this.screenHeight / 2;
                this.animate(0, nextPos);
                this.resumeAnimation();
                this.timeout(0.5, this.syncPrompters);
            }
        }
        else 
            if (currPos < 0 - this.screenHeight * 0.5) { // < 0 || flipV && jump > -promptHeight + screenHeight || !flipV && !next || flipV && !next ) {
                const nextPos = currPos + this.screenHeight / 2;
                this.animate(0, nextPos);
                this.resumeAnimation();
                this.timeout(0.5, this.syncPrompters);
            }
    }
    
    // Update unit and unit related measurements
    updateUnit() {
        console.log("focusHeight", this.focusHeight);
        this.unit = this.focusHeight / 80;
        this.relativeLimit = limit * this.unit;
        if (this.debug) setTimeout( function(){ console.log("Unit updated: "+this.unit) && false; }.bind(this));
        this.resumeAnimation();
    }
    
    animationTimeout(time, func) {
        this.internalPauseAnimation();
        this.timeout(time, func);
    }
    
    timeout( time, func ) {
        // If a timeout is already executing, reset it.
        if (this.timeoutStatus)
            window.clearTimeout(this.timeoutStatus);
        // Set: Wait time second before resuming animation
        this.timeoutStatus = window.setTimeout(function() {
            if (func)
                func();
        }.bind(this), time);
    }

    getProgress() {
        // The "previous" values used in getProgress are consistant values that update only during resize or screen rotate.
        // By using these we are able to recalculate position on correctVerticalDisplacement() and improve performance.
        // Solve for current progress. P = (-(currPos+screenHeight-valToCenterAtFocusArea)) / (promptHeight-screenHeight)
        // If flipV solve for...       P = (-(currPos+screenHeight-valToCenterAtFocusArea)) / (promptHeight-screenHeight)
        var progress,
            currPos = this.getCurrPos();
        if (this.flipV)
            progress = (-(this.previousPromptHeight-this.previousScreenHeight+currPos)-this.previousVerticalDisplacementCorrector+this.previousScreenHeight)/-(this.previousPromptHeight-this.previousScreenHeight*2);
        else
            progress = (currPos-this.previousVerticalDisplacementCorrector+this.previousScreenHeight)/-(this.previousPromptHeight-this.previousScreenHeight*2);
        if (this.debug) { console.log("Progress:") && false; console.log(progress) && false; }
        return progress;
    }
        
    // Wait timeoutDelay after calling event before continuing.
    correctVerticalDisplacement(percentage, transitionDelay) {
        var delay;
        if (transitionDelay === undefined) {
            transitionDelay = transitionDelays;
            delay = timeoutDelay;
        }   
        else
            delay = transitionDelay / 2;
        this.setPromptHeight();
        // setFocusHeight();
        this.setScreenHeight();
        // internalPauseAnimation();
        this.animationTimeout( delay, function() {
            // Get current screen settings. To be used multiple times.
            var updatedPos,
                valToCenterAtFocusArea = this.focusVerticalDisplacementCorrector();
            if (percentage === undefined)
                percentage = this.getProgress();
            // Solve
            if (this.flipV)
                updatedPos = -(-percentage*(this.promptHeight-this.screenHeight*2)+this.valToCenterAtFocusArea-this.screenHeight)-this.promptHeight+this.screenHeight;
            else
                updatedPos = -percentage*(this.promptHeight-this.screenHeight*2)+this.valToCenterAtFocusArea-this.screenHeight;
            // Update "previous" values to current ones.
            this.previousPromptHeight = this.promptHeight;
            this.previousScreenHeight = this.screenHeight;
            this.previousVerticalDisplacementCorrector = this.valToCenterAtFocusArea;
            // Reset steps
            this.resetSteps();
            // Correct vertical displacement with a smooth animation.
            this.animate(transitionDelay, updatedPos, 'ease');
            // After that animation is done...
            window.setTimeout( function() {
                // Check if current position is out of bounds and if it is, correct it.
                var currPos = this.getCurrPos(),
                    maxPos = -(this.promptHeight-this.screenHeight);
                if (currPos > 0) {
                    this.animate(0, 0);
                    this.syncPrompters();
                }
                else if (currPos < maxPos) {
                    this.animate( 0, maxPos);
                    this.stopAll();
                    this.syncPrompters();
                }
                // Then resume prompter playback.
                this.internalPlayAnimation();
            }.bind(this), transitionDelay);
        }.bind(this));
    }
    
    onResize() {
        if (this.debug) console.log("Resize") && false;
        // In case of resolution change, update density unit.
        this.setPromptHeight();
        this.setFocusHeight();
        this.setScreenHeight();
        this.setScreenWidth();
        this.updateUnit();
        // You can guess what the next line does.
        this.correctVerticalDisplacement();        
    }

    // FONT SIZE
    increaseFontSize() {
        this.editor.postMessage({
            'request': 11,
            'data': this.getProgress()
        }, this.getDomain());
    }
    decreaseFontSize() {
        this.editor.postMessage({
            'request': 12,
            'data': this.getProgress()
        }, this.getDomain());
    }

    internalIncreaseFontSize() {
        if (this.debug) console.log("Increasing font size.");
        if (this.fontSize < 2.5)
            this.fontSize += 0.04;
        this.updateFont();
    }

    internalDecreaseFontSize() {
        if (this.debug) console.log("Decreasing font size.");
        if (this.fontSize > 0.01)
            this.fontSize -= 0.04;
        this.updateFont();
    }

    updateFont() {
        this.prompt.style.fontSize = this.fontSize + 'em';
        this.overlayFocus.style.fontSize = this.fontSize + 'em';
        this.onResize();
    }

    updateWidth() {
        this.prompt.style.width = this.promptWidth+"vw";
        this.prompt.style.left = 50-this.promptWidth/2+"vw";
        // prompt.style.right = 50-promptWidth/2+"%";
        this.onResize();
    }

    decreaseVelocity() {
        this.editor.postMessage({
            'request': 2,
            'data': this.getProgress()
        }, this.getDomain());
    }

    increaseVelocity() {
        this.editor.postMessage({
            'request': 1,
            'data': this.getProgress()
        }, this.getDomain());
    }

    incSteps() {
        this.steps++;
        if (this.steps > 140)
        this.instaSync();
        this.timeout(250, );
    }

    resetSteps() {
        this.steps = 0;
    }

    internalDecreaseVelocity() {
        if (!this.atStart()) {
            if (this.velocity > this.relativeLimit *- 1) {
                this.x--;
                this.updateVelocity();
                this.resumeAnimation();
                this.incSteps();
            }
        }
        else
            this.stopAll();
    }

    internalIncreaseVelocity() {
        if (!this.atEnd()) {
            if (this.velocity < this.relativeLimit) {
                this.x++;
                this.updateVelocity();
                this.resumeAnimation();
                this.incSteps();
            }
        }
        else
            this.stopAll();
    }

    toggleAnimation() {
        if (this.play)
            this.pauseAnimation();
        else
            this.playAnimation();
    }

    pauseAnimation() {
        this.editor.postMessage({
            'request': teleprompter.commandsMapping.command.pause
        }, this.getDomain());
        if (this.debug) console.log("Paused") && false;
    }
    
    playAnimation() {
        this.editor.postMessage({
            'request': teleprompter.commandsMapping.command.play
        }, this.getDomain());
        if (this.debug) console.log("Playing") && false;
    }
    
    internalPauseAnimation() {
        this.editor.postMessage({
            'request': teleprompter.commandsMapping.command.internalPause
        }, this.getDomain());
    }
    
    internalPlayAnimation() {
        this.editor.postMessage({
            'request':teleprompter.commandsMapping.command.internalPlay
        }, this.getDomain());
    }
    
    localPauseAnimation() {
        this.animate(0, this.getCurrPos());
        this.timer.stopTimer();
    }
    
    localPlayAnimation() {
        this.resumeAnimation();
    }
    
    resetTimer() {
        this.editor.postMessage({
            'request':teleprompter.commandsMapping.command.resetTimer
        }, this.getDomain());
    }
    
    internalResetTimer() {
        this.timer.resetTimer();
        this.playAnimation();
        if (this.debug) console.log("Timer reset.");
    }
    
    launchIntoFullscreen(element) {
        var requestFullscreen = element.requestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen || element.msRequestFullscreen;
        if (requestFullscreen!==undefined)
            requestFullscreen.call(element);
    }
    
    exitFullscreen() {
        var exitFullscreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullscreen;
        if (exitFullscreen!==undefined)
            exitFullscreen.call(document);
    }
    
    toggleFullscreen() {
        if (this.debug) console.log("Toggle fullscreen");
        var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
        if (fullscreenElement) {
    
            if (this.debug) console.log("Entering fullscreen");
            this.exitFullscreen();
        }
        else {
    
            if (this.debug) console.log("Leaving fullscreen");
            this.launchIntoFullscreen(document.documentElement);
        }
    }

    listener(event) {
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
        if (!this.cap && !event.domain || event.domain === this.getDomain()) {
            // Act according to the message.
            var message = event.data;
            var command = teleprompter.commandsMapping.command;
            if(message.request == command.increaseVelocity || message.request == command.decreaseVelocity)
                this.setCap();
            switch (message.request) {
                case 1 :
                    this.internalIncreaseVelocity();
                    //requestAnimationFrame(internalIncreaseVelocity);
                    break;
                case 2 :
                    this.internalDecreaseVelocity();
                    //requestAnimationFrame(internalDecreaseVelocity);
                    break;
                case command.iSync :
                    requestAnimationFrame(function(){
                        this.correctVerticalDisplacement(message.data,0);
                    }.bind(this));
                    break;
                case command.sync :
                    requestAnimationFrame(function(){
                        this.correctVerticalDisplacement(message.data);
                    }.bind(this));
                    break;
                case command.stopAll :
                    requestAnimationFrame(function() {
                        this.stopInstance();
                    }.bind(this));
                    break;
                case command.play :
                    this.play=true;
                case command.internalPlay :
                    requestAnimationFrame(function() {
                        this.localPlayAnimation();
                    }.bind(this));
                    break;
                case command.pause :
                    requestAnimationFrame(function() {
                        this.localPauseAnimation();
                    }.bind(this));
                    this.play=false;
                    this.syncPrompters();
                    break;
                case command.internalPause :
                    requestAnimationFrame(function() {
                        this.localPauseAnimation();
                    }.bind(this));
                    break;
                case command.togglePlay :
                    this.toggleAnimation();
                    break;
                case command.resetTimer :
                    this.internalResetTimer();
                    break;
                case command.anchor :
                    requestAnimationFrame(function(){
                        this.internalMoveToAnchor(message.data);
                    }.bind(this));
                    break;
                case command.incFont :
                    this.internalIncreaseFontSize();
                    break;
                case command.decFont :
                    this.internalDecreaseFontSize();
                    break;
                case command.update :
                    this.updateContents();
                    break;
                case command.close :
                    this.closeInstance();
                    break;
                case command.nextAnchor :
                    this.internalMoveToNextAnchor(true);
                    break;
                case command.previousAnchor :
                    this.internalMoveToNextAnchor(false);
                    break;
                case command.fastForward :
                    this.internalFastForward();
                    break;
                case command.rewind :
                    this.internalRewind();
                    break;
                default :
                    // Notify unknown message received.
                    if (this.debug) console.log("Unknown post message received: "+message.request) && false;
            }
        }
    }

    resetCap() {
        this.cap = false;
    }
    
    setCap() {
        this.cap = true;
        setTimeout(function() {
            this.resetCap();
        }.bind(this), this.inputCapDelay);
    }
    
    toggleTouchControls() {
    
    }

    commandsListener (event) {
        var mapping = teleprompter.commandsMapping.mapping;
        if (mapping[event.code]) {
            teleprompter.commandsMapping.actions[mapping[event.code]]["method"]();
        } else if (event.key) {
            var key;
            // If key is not a string
            if (!this.isFunction(event.key.indexOf))
                key = String.fromCharCode(event.key);
            else
                key = event.key;
            //if ( key.indexOf("Key")===0 || key.indexOf("Digit")===0 )
            //      key = key.charAt(key.length-1);
            if (!this.is_int(key))
                key = key.toLowerCase();
            if (debug) console.log(key);
            this.moveToAnchor( key );
        }
        // Prevent arrow and spacebar scroll bug.
        if ([" ","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(event.key) > -1 && event.preventDefault)
        event.preventDefault();
    }

    remoteControls() {
        var res;
        dataManager.getItem("IFTeleprompterControl", function(data){
            res = JSON.parse(data);
        },0,false);
        if(typeof res !== "undefined"){
            if(res.hasOwnProperty('key') > 0){
                document.onkeydown(res);
            }
        }
        setTimeout(this.remoteControls, 0);
    }
    
    isFunction(possibleFunction) {
        return typeof(possibleFunction) === typeof(Function)
    }
    
    is_int(value) {
        if (parseFloat(value) == parseInt(value) && !isNaN(value))
            return true;
        else
            return false;
    }

    inIframe() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }
}

teleprompter.prompter = new Prompter()

// Initialize objects after DOM is loaded
if (document.readyState === "interactive" || document.readyState === "complete")
    // Call init if the DOM (interactive) or document (complete) is ready.
    teleprompter.prompter.init();
else
    // Set init as a listener for the DOMContentLoaded event.
    document.addEventListener("DOMContentLoaded", function() {
        teleprompter.prompter.init();
    }.bind(this));

