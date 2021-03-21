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

"use strict";
var debug = false;

var editorList = [
    // oficial
    "ckeditor",
    // testing alternatives
    "tinymce",
    "summernote"
]
var currentEditor = editorList[0];

// (function() {
    // Use JavaScript Strict Mode.
    var elecScreen, ipcRenderer, remote;

    // Import Electron libraries.
    if (inElectron()){
        const electron = require('electron');
        remote = require('@electron/remote');  // Allows IPC with main process in Electron.
        elecScreen = remote.screen; // Allows Smart Fullscreens in Electron.
        ipcRenderer = electron.ipcRenderer;

        window.jQuery = require('./assets/jquery/jquery.min.js');
        window.$ = window.jQuery;
        window.Slider = require('./assets/bootstrap-slider/js/bootstrap-slider.min.js');
    }
    
    // Global objects
    var promptIt, updateIt, prompterWindow, frame, currentScript, canvas, canvasContext, slider, promptWidth,
        syncMethods = {"instance":0, "canvas":1, "follow":2};

    // Global variables
    var syncMethod = syncMethods.instance,
        forceSecondaryDisplay = false,
        domain, tic, instance = [false, false],
        htmldata, editorFocused = false;

    if ( syncMethod === syncMethods.canvas ) {
        forceSecondaryDisplay = true;
    }

    // File Manager
    var fileManager = new FileManager();

    // Settings
    var settingsModal;

    function init() {
        // Set globals
        tic = false;

        // Initialize commands mapping
        teleprompter.commandsMapping = new CommandsMapping();

        // Initialize themes
        teleprompter.themes = new Themes();
        teleprompter.themes.setColorPicker();

        // Set DOM javascript controls
        promptIt = document.getElementById("promptIt");
        updateIt = document.getElementById("updateIt");
        promptIt.onclick = submitTeleprompter;
        updateIt.onclick = updateTeleprompter;
        document.getElementById("prompterStyle").addEventListener('change', function(e) {
            teleprompter.themes.setStyle(e.target.value);
        }.bind(this));
        document.getElementById("prompterStyleControl").addEventListener('change', function(e) {
            teleprompter.themes.setStyle(e.target.value);
        }.bind(this));
        document.getElementById("credits-link").onclick = credits;

        frame = document.getElementById("teleprompterframe");
        canvas = document.getElementById("telepromptercanvas");
        canvasContext = canvas.getContext('2d');

        // Set initial configuration to prompter style
        teleprompter.themes.styleInit(document.getElementById("prompterStyle"));

        // Set credits button
        document.getElementById("credits-link").onclick = credits;
        // Set domain to current domain.
        setDomain();

        // If running inside Electron...
        if (inElectron()) {
            var compare = require("deb-version-compare");
            const remote = require('electron').remote;

            //Check, Update and Migrate Teleprompter Data
            dataManager.getItem("IFTeleprompterVersion",function(item) {
                if (item == null || compare(currentVersion, item) == 1) {
                    //fix 
                    item = "0";

                    //check if is going to use a develoment version 
                    if (!isADevVersion(item) && isADevVersion(currentVersion)) {
                        //migrarate from official version to a development version
                        window.location = "#devWarning";
                        var agreeButton = document.getElementById("agreeWarningButton");
                        agreeButton.onclick = function(e) {
                            applyMigration(item);
                            dataManager.setItem("IFTeleprompterVersion",currentVersion);
                            closeModal();
                        };
                        document.getElementById("cancelWarningButton").onclick = closeWindow;
                        document.getElementById("closeWarning").onclick = closeWindow;
                        agreeButton.focus();
                    } else {
                        //migrate from previous versions 
                        applyMigration(item);
                        dataManager.setItem("IFTeleprompterVersion",currentVersion);

                        //make sure all modal closes after reload the page
                        //place this here to avoid problems with the warning and the newest modal
                        closeModal();
                    }
                    
                } else if(compare(item, currentVersion) == 1) {
                    window.location = "#devNewestVersion";
                    var cancelButton = document.getElementById("cancelNewestButton");
                    cancelButton.onclick = function(e){
                        var window = remote.getCurrentWindow();
                        window.close();
                    };
                    cancelButton.focus();
                } 
            },0,0);
            // When asynchronous reply from main process, run function to...
            ipcRenderer.on('asynchronous-reply', function(event, arg) {
                // Update Canvas
                if (arg.option === "c") {
                    // Render picture as is
                    resizeCanvas(arg.size);
                    var clampedArray = new Uint8ClampedArray(arg.bitmap),
                        imageData;
                    try {
                        imageData = new ImageData(clampedArray, arg.size[0], arg.size[1]);
                    }
                    catch (err) {
                        // Remove error from command line by passing blank frame.
                        imageData = new ImageData(arg.size[0], arg.size[1]);
                        /*
                        // Attempt to prevent blank frame by calculating correct width and height using total area and aspect ratio.
                        var area = arg.bitmap.length/4,
                            aspectRatio = arg.size[1]/arg.size[0],
                            height = Math.sqrt(area*aspectRatio),
                            width = area/height;
                        imageData = new ImageData(clampedArray, width, height);
                        */
                    }
                    requestAnimationFrame(function() {
                        canvasContext.putImageData(imageData, 0, 0);
                    });
                    /*
                    // Render dirty area only. (Deprecated as inneficient. Uncomment for cool VFX on resize)
                    resizeCanvas(arg.size);
                    var width = arg.size[0],
                        height = arg.size[1],
                        croppedImage = new Uint8ClampedArray(arg.dirty.width*arg.dirty.height*4),
                        yProcessLength = arg.dirty.height+arg.dirty.y,
                        xProcessLength = arg.dirty.width+arg.dirty.x,
                        count = 0;
                    for (var i=arg.dirty.y; i<yProcessLength; i++)
                        for (var j=arg.dirty.x; j<xProcessLength; j++) {
                            var curr = (i*width+j)*4;
                            croppedImage[count+0] = arg.bitmap[curr+0];
                            croppedImage[count+1] = arg.bitmap[curr+1];
                            croppedImage[count+2] = arg.bitmap[curr+2];
                            croppedImage[count+3] = 255;
                            count+=4;
                        }
                    requestAnimationFrame(function() {
                        canvasContext.putImageData(new ImageData(croppedImage, arg.dirty.width, arg.dirty.height), arg.dirty.x, arg.dirty.y);
                    });
                    */
                }
                // Show QR Codes.
                // Initiate QRs for Remote Control.
                else if (arg.option === "qr")
                    addQRConnection(arg.data);
                // Restore instances
                else if (arg.option === "restoreEditor")
                    restoreEditor();
                // Forward remote control commands.
                else if (arg.option === "command")
                    document.onkeydown(arg.data);
                // 
                // Get the "exteral" classes and update each link to load on an actual browser.
                else if (arg.option === "prepareLinks") {
                    var classTags = document.getElementsByClassName('external');
                    for (var i = 0; i < classTags.length; i++)
                        if (classTags[i].href != " ") {
                            classTags[i].setAttribute("onclick", "shell.openExternal('" + classTags[i].href + "'); return false;");
                            classTags[i].href = "#";
                            classTags[i].target = "_parent";
                        }
                }
            });
            // Scan network for remote control.
            ipcRenderer.send('asynchronous-message', 'prepareLinks');
            //ipcRenderer.send('asynchronous-message', 'network');
        } // end if

        // Initialize controls
        teleprompter.controls = new Controls();
        //initImages();
        loadLastUseSettings();
        // Initialize prompt styles
        teleprompter.themes.draw();
        // Initialize file management features.
        initScripts();
        // Initialize commands mapping editor
        teleprompter.commandsMapping.draw();
    } // end init()

    function closeWindow() {
        var window = remote.getCurrentWindow();
        window.close();
    }

    // Resize canvas size
    function resizeCanvas(size) {
        if ( !(canvas.width===size[0] && canvas.height===size[1]) ) {
            canvas.width = size[0];
            canvas.height = size[1];
        }
    }

    function isADevVersion(version) {
        if(version.includes("rc") || version.includes("alpha") || version.includes("beta"))
            return true;
        return false;
    }

    //Apply migration by versions
    function applyMigration(version) {
        switch (version) {
            // "default" at top for unnacaunted developer versions. I didn't thought this was possible! xD
            default:
            // 2.2 or bellow
            case null:
            case "0":
            case "2.2.0":
                dataManager.getItem("IFTeleprompterSideBar",function(dataToMigrate) {
                    if (dataToMigrate) {
                        // Convert Data
                        dataToMigrate = JSON.parse(dataToMigrate);
                        if (dataToMigrate.length > 0) {
                            // Fix to not do more dirty work
                            dataToMigrate[0]["id"] = fileManager.createIDTag(dataToMigrate[0].name, true);
                            fileManager.getSaveMode().setItem(fileManager.getDataKey(), JSON.stringify(dataToMigrate));
                        }
                        // Continue with rest of the data
                        for (var i = 1; i < dataToMigrate.length; i++)
                            if (dataToMigrate[i].hasOwnProperty("name")) {
                                dataToMigrate[i]["id"] = fileManager.createIDTag(dataToMigrate[i].name);
                                fileManager.getSaveMode().setItem(fileManager.getDataKey(), JSON.stringify(dataToMigrate));
                            }
                    }
                }, 0, 0);
            case "2.3.0": // Nothing to do here, issues solved elsewhere.
            // Next itteration
            case "2.4.0":
            break;
        }
    }

    // Initialize postMessage event listener.
    addEventListener("message", listener, false);

    function save() {
        if (debug) console.log("Save pressed");
    }

    function inElectron() {
        return navigator.userAgent.indexOf("Electron") != -1;
    }

    function setDomain() {
        // Get current domain from browser
        domain = document.domain;
        // If not running on a server, return catchall.
        if (domain.indexOf("http://") != 0 || domain.indexOf("https://") != 0 || domain.indexOf("localhost") != 0)
            domain = "*";
    }

    function getDomain() {
        return domain;
    }

    function launchIntoFullscreen(element) {
        var requestFullscreen = element.requestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen || element.msRequestFullscreen;
        if (requestFullscreen!==undefined)
            requestFullscreen.call(element);
    }

    function exitFullscreen() {
        var exitFullscreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullscreen;
        if (exitFullscreen!==undefined)
            exitFullscreen.call(document);
    }

    function toggleFullscreen() {
        var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement,
        elem;
        if (fullscreenElement)
            exitFullscreen();
        else {
            if (promptIt.onclick === submitTeleprompter)
                elem = document.getElementById("editorcontainer");
            else
                elem = document.documentElement;
            launchIntoFullscreen(elem);
        }
    }

    function togglePrompter() {
        if (promptIt.onclick === submitTeleprompter)
            submitTeleprompter();
        else
            restoreEditor();
    }

    function togglePromptIt() {
        if (promptIt.onclick === submitTeleprompter) {
            // Update button
            promptIt.textContent = "Close It...";
            promptIt.onclick = restoreEditor;
            // Hide stuff
            if (instance[0]) {
                document.getElementById("content").style.display = "none";
                document.getElementById("editorcontainer").style.display = "none";
                document.getElementById("footer").style.display = "none";
                // Show prompter instance
                document.getElementById("framecontainer").style.display = "block";
                if (instance[1] && syncMethod===syncMethods.canvas) {
                    canvas.style.display = "block";
                    frame.style.display = "none";
                }
                else {
                    frame.style.display = "block";
                    canvas.style.display = "none";
                }
                launchIntoFullscreen(document.documentElement);
            } else if (instance[1]) {
                updateIt.classList.remove("hidden");
            }
        } else {
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
                if (instance[1] && syncMethod===syncMethods.canvas)
                    canvas.style.display = "none";
                else
                    frame.style.display = "none";
                exitFullscreen();
            } else if (instance[1]) {
                updateIt.classList.add("hidden");
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
        var settings = '{ "data": {"secondary":0,"primary":1,"prompterStyle":2,"focusMode":3,"background":"#3CC","color":"#333","overlayBg":"#333","speed":"13","acceleration":"1.2","fontSize":"100","promptWidth":"84","timer":"false","voice":"false"}, "quickConfig": {}}',
            session = '{ "html":"' + encodeURIComponent(htmldata) + '" }';

        // Store data locally for prompter to use
        dataManager.setItem("IFTeleprompterSettings", settings, 1);
        dataManager.setItem("IFTeleprompterSession", session);

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

    function updatePrompterData( override ) {
        // Get html from editor
    
        htmldata = teleprompter.editor.getEditorContent();

        // Define possible values
        var primary, secondary, style, focusArea, speed, acceleration, fontSize, timer, voice;
        // Get form values
        if (override!==undefined && typeof override==='string' || override instanceof String)
            override = JSON.parse(override);
        // Set corresponding values.
        if (override!==undefined && override.primary!==undefined)
            primary = override.primary;
        else
            primary = document.getElementById("primary").value;
        if (override!==undefined && override.secondary!==undefined)
            secondary = override.secondary;
        else
            secondary = document.getElementById("secondary").value;
        if (override!==undefined && override.style!==undefined)
            style = override.style;
        else
            style = document.getElementById("prompterStyle").value;
        if (override!==undefined && override.focusArea!==undefined)
            focusArea = override.focusArea;
        else
            focusArea = document.getElementById("focus").value;
        if (override!==undefined && override.speed!==undefined)
            speed = override.speed;
        else
            speed = slider[0].getValue();
        if (override!==undefined && override.acceleration!==undefined)
            acceleration = override.acceleration;
        else
            acceleration = slider[1].getValue();
        if (override!==undefined && override.fontSize!==undefined)
            fontSize = override.fontSize;
        else
            fontSize = slider[2].getValue();
        if (override!==undefined && override.promptWidth!==undefined)
            promptWidth = override.promptWidth;
        else
            promptWidth = slider[3].getValue();
        if (override!==undefined && override.timer!==undefined)
            timer = override.timer;
        else {
            timer = document.getElementById("timerOn").checked;
        }
        if (override!==undefined && override.voice!==undefined)
            voice = override.voice;
        else
            voice = false;
        // Merge all settings into one.
        var settings = '{ "quickConfig": '+JSON.stringify(teleprompter.controls.quickConfig)+', "commandsMapping": '+JSON.stringify(teleprompter.commandsMapping.mapping)+', "data": {"primary":'+primary+',"secondary":'+secondary+',"prompterStyle":'+style+',"focusMode":'+focusArea+',"speed":'+speed+',"acceleration":'+acceleration+',"fontSize":'+fontSize+',"promptWidth":'+promptWidth+',"timer":'+timer+',"voice":'+voice+'}}',
        session = '{ "html":"' + encodeURIComponent(htmldata) + '" }';

        // Store data locally for prompter to use
        dataManager.setItem("IFTeleprompterSettings", settings, 1);
        // If we use sessionStorage we wont be able to update the contents.
        dataManager.setItem("IFTeleprompterSession", session, 1);

        teleprompter.controls.updateQuickConfig(teleprompter.controls.quickConfig);
    }

    function restoreEditor(event) {
        if (promptIt.onclick === restoreEditor) {
            if (debug) console.log("Restoring editor.");
            // Request to close prompters:
            // Close frame.
            if (frame.src.indexOf("teleprompter.html") != -1)
                frame.contentWindow.postMessage({
                    'request': command.close
                }, getDomain());
            // Close window.
            if (prompterWindow)
                prompterWindow.postMessage({
                    'request': command.close
                }, getDomain());
            if (syncMethod === syncMethods.canvas)
                ipcRenderer.send('asynchronous-message', 'closeInstance');
            // Clear contents from frame
            frame.src = "about:blank";
            // Stops the event but continues executing current function.
            if (event && event.preventDefault)
                event.preventDefault();
            togglePromptIt();
        }
    }

    // On "Prompt It!" clicked
    function submitTeleprompter(event) {
        if (debug) console.log("Submitting to prompter");

        // Stops the event but continues executing the code.
        if (!(event===undefined||event.preventDefault===undefined))
            event.preventDefault();

        var secondaryDisplay = null;
        
        updatePrompterData();

        // Determine whether to load "Primary".
        instance[0] = (document.getElementById("primary").value > 0) ? true : false; 
        // Determine whether to load "Secondary".
        instance[1] = (document.getElementById("secondary").value > 0) ? true : false; 
        // Checks if is running on electron app...
        if (inElectron()) {
            // Check display availabillity.
            const displays = elecScreen.getAllDisplays()
            
            // of displays that are currently  available.
            var primaryDisplay = elecScreen.getPrimaryDisplay(),
            currentDisplay = 0, // 0 means primary and 1 means secondary
            cursorLocation = elecScreen.getCursorScreenPoint();
            // Find the first display that isn't the primary display.
            if (debug) console.log("Displays amount: "+displays.length);
            const secondaryDisplay = displays.find((display) => {
                return display.bounds.x !== 0 || display.bounds.y !== 0
            })
            if (debug) console.log( "Primary display:" );
            if (debug) console.log( primaryDisplay );
            if (debug) console.log( "Secondary display:" );
            if (debug) console.log( secondaryDisplay );
            // Determine the display in which the main window is at.
            if ( (cursorLocation.x < primaryDisplay.bounds.x) || (cursorLocation.x > primaryDisplay.bounds.width) || (cursorLocation.y < primaryDisplay.bounds.y) || (cursorLocation.y > primaryDisplay.bounds.height) )
                currentDisplay = 1;
            // If there are any externalDisplay; then create a new window for the display.
            if (instance[1]) {
                if (secondaryDisplay || forceSecondaryDisplay) {
                    // Open external prompter on a display where the editor is not located at.
                    if (currentDisplay===0) {
                        if (debug) console.log("Displaying external on secondary display.");
                        // Load external instance if in-frame prompter wont run.
                        if (instance[0] && syncMethod===syncMethods.canvas)
                            openCanvasPrompter();
                        // Otherwise run perfect sync painter.
                        else
                            prompterWindow = window.open("teleprompter.html" + (debug ? "?debug=1" : ""), 'TelePrompter Output', 'height=' + (secondaryDisplay.workArea.height-50) + ',width=' + (secondaryDisplay.workArea.width-50) + ',top='+ (secondaryDisplay.workArea.y+50) +',left=' + (secondaryDisplay.workArea.x+50) + ',fullscreen=1,status=0,location=0,menubar=0,toolbar=0' );
                    }
                    else if (currentDisplay>0) {
                        if (debug) console.log("Displaying external on primary display.");
                        // Load external instance if in-frame prompter wont run.
                        if (instance[0] && syncMethod===syncMethods.canvas)
                            openCanvasPrompter();
                        // Otherwise run perfect sync painter.
                        else
                            prompterWindow = window.open("teleprompter.html" + (debug ? "?debug=1" : ""), 'TelePrompter Output', 'height=' + (primaryDisplay.workArea.height-50) + ',width=' + (primaryDisplay.workArea.width-50) + ',top='+ (primaryDisplay.workArea.y+50) +',left=' + (primaryDisplay.workArea.x+50) + ',fullscreen=1,status=0,location=0,menubar=0,toolbar=0');
                    }
                }
                // If currentDisplay isn't the primaryDisplay or if there is no secondaryDisplay and the primary is unnocupied... Display on primaryDisplay.
                else if (!instance[0]) {
                    if (debug) console.log("Displaying external on primary display.");
                    prompterWindow = window.open("teleprompter.html" + (debug ? "?debug=1" : ""), 'TelePrompter Output', 'height=' + (primaryDisplay.workArea.height-50) + ',width=' + (primaryDisplay.workArea.width-50) + ',top='+ (primaryDisplay.workArea.y+50) +',left=' + (primaryDisplay.workArea.x+50) + ',fullscreen=1,status=0,location=0,menubar=0,toolbar=0');
                }
            }
            // Load InFrame prompter only if there's more than one screen or if the only screen available is free.
            if ( instance[0] && ( !instance[1] || secondaryDisplay ) )
                frame.src = "teleprompter.html" + (debug ? "?debug=1" : "");
        } else {
            if (instance[0])
                frame.src = "teleprompter.html" + (debug ? "?debug=1" : "");
            if (instance[1])
                prompterWindow = window.open("teleprompter.html" + (debug ? "?debug=1" : ""), 'TelePrompter Output', 'height=' + screen.availHeight + ',width=' + screen.width + ',top=0,left=' + screen.width + ',fullscreen=1,status=0,location=0,menubar=0,toolbar=0');
        }
        
        // If an external prompt is openned, focus on it.        
        if (prompterWindow!=undefined && window.focus)
            // Adviced to launch as separate event on a delay.
            prompterWindow.focus();
        else
            frame.focus();

        // In case of both instances active and not enough screens...
        if (!forceSecondaryDisplay && (inElectron() && !secondaryDisplay && instance[0] && instance[1])) {
            window.alert("You don't have any external Display.");
            instance[0] = false;
            instance[1] = false;
        }
        // In case that no instance is active...
        else if (!(instance[0] || instance[1]))
            window.alert("You must prompt at least to one display.");
        else
            togglePromptIt();
    }

    function openCanvasPrompter() {
        // Opening experimental prompter...
        if (debug) console.log("Opening experimental prompter.");
        ipcRenderer.send('asynchronous-message', 'openInstance');
    }

    function updateTeleprompter(event) {
        // Stops the event but continues executing the code.
        event.preventDefault();
        // Update data.
        updatePrompterData();
        if (debug) console.log("Updating prompter contents");
        // Request update on teleprompter other instance.
        listener({
            data: {
                request: command.updateContents
            }
        });
    }

    function toggleDebug() {
        if (inElectron())
            remote.getCurrentWindow().toggleDevTools();
        else
            toggleDebugMode();
    }

    function toc() {
        tic != tic;
    }

    function refresh() {
        location.reload();
    }

    function clearAllRequest() {
        if (confirm("You've pressed F6. Do you wish to perform a factory reset of Teleprompter? You will loose all saved scripts and custom styles.") ) {
            dataManager.clearAll();
            window.removeEventListener("beforeunload", updatePrompterData);
            refresh();
        }
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
        if (!event.domain || event.domain === getDomain()) {
            var message = event.data;
            // Special case. Restore editor message received.
            if (message.request === command.restoreEditor)
                restoreEditor();
            else {
                if ( syncMethod===syncMethods.canvas && instance[0] && instance[1] && inElectron() ) {
                    // IPC between main process directly.
                    ipcRenderer.send('asynchronous-message', message);
                }
                else {
                    // If this isn't a instant sync command, follow normal procedure.
                    if (!(message.request === command.iSync || message.request === command.sync)) {
                        // Tic toc mechanism symmetricaly distributes message request lag.
                        if (tic) {
                            // Redirect message to each prompter instance.
                            if (instance[1])
                                prompterWindow.postMessage(message, getDomain());
                            if (instance[0])
                                frame.contentWindow.postMessage(message, getDomain());
                        } else {
                            // Redirect message to each prompter instance.
                            if (instance[0])
                                frame.contentWindow.postMessage(message, getDomain());
                            if (instance[1])
                                prompterWindow.postMessage(message, getDomain());
                        }
                    }
                    // If requesting for sync, ensure both instances are open. Otherwise do nothing.
                    else if (instance[0] && instance[1]) {
                        // Tic toc mechanism symmetricaly distributes message request lag.
                        if (tic) {
                            // Redirect message to each prompter instance.
                            if (instance[1])
                                prompterWindow.postMessage(message, getDomain());
                            if (instance[0])
                                frame.contentWindow.postMessage(message, getDomain());
                        } else {
                            // Redirect message to each prompter instance.
                            if (instance[0])
                                frame.contentWindow.postMessage(message, getDomain());
                            if (instance[1])
                                prompterWindow.postMessage(message, getDomain());
                        }
                    }
                    // Update tic-toc bit.
                    setTimeout(toc, 10);
                }
            }
        }
    }

    function commandsListener (event) {
        // Temporal Solution, until descomposition
        if (event.target.hasAttribute("data-key")) {
            return;
        }

        if (mapping[event.code]) {
            actions[mapping[event.code]]["method"]();
        } else if (event.key) {
            var key;
            // If key is not a string
            if (!isFunction(event.key.indexOf))
                key = String.fromCharCode(event.key);
            else
                key = event.key;
            //if ( key.indexOf("Key")===0 || key.indexOf("Digit")===0 )
            //      key = key.charAt(key.length-1);
            if (!is_int(key))
                key = key.toLowerCase();
            if (debug) console.log(key);
            listener({
                data: {
                    request: command.anchor,
                    data: key
                }
            });
        }
    }
    document.addEventListener('keydown', commandsListener);

    function closeModal() {
        if (window.location.hash.slice(1) === "openCustomStyles")
            closePromptStyles();
        else if (window.location.hash.slice(1) === "devWarning") {
            var version = function(thisVersion) {
                console.log(thisVersion);
                if (thisVersion === currentVersion)
                    window.location = "#close";
                else
                    window.close();
            };
            dataManager.getItem("IFTeleprompterVersion",version,1);
        }
        else
            window.location = "#close";
        document.getElementById("prompt").focus();

        if (fileManager.modal) {
            fileManager.modal.hide()
            fileManager.modal = undefined;
        }
    }

    // Save last use settings
    window.addEventListener("beforeunload", updatePrompterData);

    function updateFont(value) {
        if (debug) console.log("Updating font.");
        document.getElementById("prompt").style.fontSize = "calc(5vw * "+(value/100)+")";
    }

    function updateWidth(value) {
        if (debug) console.log("Updating width.");
        const prompt = document.getElementById("prompt");
        prompt.style.width = value+"vw";
        prompt.style.left = "calc("+(50-value/2)+"vw - 14px)";
    }

    function loadLastUseSettings() {
        // Get last used settings.
        var settings = (lastSettings) => {
            if (lastSettings!==undefined && lastSettings!==null) {
                if (debug) console.log(lastSettings);
                lastSettings = JSON.parse(lastSettings);
                document.getElementById("primary").value = lastSettings.data.primary;
                document.getElementById("secondary").value = lastSettings.data.secondary;
                // document.getElementById("prompterStyle").value = lastSettings.data.prompterStyle;
                document.getElementById("focus").value = lastSettings.data.focusMode;
                // If no last used value, leave default values.
                if (!isNaN(lastSettings.data.speed))
                    teleprompter.controls.slider[0].setValue(lastSettings.data.speed);
                else
                    lastSettings.data.speed = slider[0].getValue();
                if (!isNaN(lastSettings.data.acceleration))
                    teleprompter.controls.slider[1].setValue(lastSettings.data.acceleration);
                else
                    lastSettings.data.acceleration = slider[1].getValue();
                if (!isNaN(lastSettings.data.fontSize))
                    teleprompter.controls.slider[2].setValue(lastSettings.data.fontSize);
                else
                    lastSettings.data.fontSize = slider[2].getValue();
                if (!isNaN(lastSettings.data.promptWidth))
                    teleprompter.controls.slider[3].setValue(lastSettings.data.promptWidth);
                else
                    lastSettings.data.promptWidth = slider[3].getValue();
                document.getElementById("speedValue").textContent = parseFloat(Math.round(lastSettings.data.speed * 10) / 10).toFixed(1);
                document.getElementById("accelerationValue").textContent = parseFloat(Math.round(lastSettings.data.acceleration * 100) / 100).toFixed(2);
                document.getElementById("fontSizeValue").textContent = lastSettings.data.fontSize;
                document.getElementById("promptWidthValue").textContent = lastSettings.data.promptWidth;
                updateFont(lastSettings.data.fontSize);
                updateWidth(lastSettings.data.promptWidth);
                // Set timer value
                document.getElementById("timerOn").checked = lastSettings.data.timer;
                document.getElementById("timerOff").checked = !lastSettings.data.timer;
                // Set voice value
                // var voice = document.getElementById("voice")
                // if (lastSettings.data.timer) {
                //     voice.children[0].classList.toggle("btn-primary");
                //     voice.children[0].classList.toggle("btn-default");
                //     voice.children[0].classList.innerHTML("Active");
                // }
                teleprompter.controls.updateQuickConfig(lastSettings.quickConfig);
                teleprompter.commandsMapping.mapping = lastSettings.commandsMapping;
            }
        };
        dataManager.getItem("IFTeleprompterSettings", settings, 1);
    }

    function isFunction(possibleFunction) {
        return typeof(possibleFunction) === typeof(Function)
    }

    function is_int(value) {
        if (parseFloat(value) == parseInt(value) && !isNaN(value))
            return true;
        else
            return false;
    }

    function insertTextAtCursor(node) {
        var sel, range, html;
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();
                range.insertNode(node);
            }
        } else if (document.selection && document.selection.createRange) {
            document.selection.createRange().text = text;
        }
    }

    function b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++)
                byteNumbers[i] = slice.charCodeAt(i);

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, {
            type: contentType
        });
        return blob;
    }

    // Teleprompter Scripts File Manager
    function initScripts() {
        //initialize SideBar
        teleprompter.fileManager = fileManager.on('v-pills-scriptsContent',{
            "name":"Files",
            "elementName":"Script",
            "newElementName":"Untitled",
            "dataKey":"IFTeleprompterSideBar",
            "preloadData":[{
                "name": "Instructions",
                "data": '<h3>Welcome to Imaginary Teleprompter!</h3><p>Are you ready to tell a story?</p><br><p>"Teleprompter" is the most complete, free software, professional teleprompter for anyone to use. Click on "Prompt It!" whenever you\'re ready and control the speed with the arrow keys.</p><br><h3>Here are some of our features:</h3><ol><li>Control the speed and text-size with the \'Up\' and \'Down\' arrow keys, the \'W\' and \'S\' keys or the mouse wheel. You may press \'Spacebar\' to pause at anytime.</li><li>Move half a screen backwards or forwards by pressing the \'PageUp\' and \'PageDown\' keys.</li><li>Dynamically change the font-size by pressing \'Left\' and \'Right\' or the \'A\' and \'D\' keys.</li><li>Flip modes allow <em>mirroring</em> the prompter in every possible way.</li><li>You can use one or two instances. Mirror one, monitor on the other one.</li><li><a id="5" name="5">Set almost any key as a <em>marker</em> and instantly jump to any part of the script. Try pressing \'5\' now!</a></li><li>Different focus areas allow you to easily use Teleprompter with a webcam, a tablet, or professional teleprompter equipment.</li><li>Time your segments with the built in <em>timer</em>. Press \'Backspace\' to reset the timer.</li><li><a name data-cke-saved-name src="#">You can also set nameless <em>markers</em> and move accross them using the Home and End buttons.</a></li><li>Tweak the <em>Speed</em>, <em>Acceleration Curve</em> and <em>Font Size</em> settings to fit your hosts\' needs.</li><li>Press \'F11\' to enter and leave fullscreen.You may fullscreen the text editor for greater concentration.</li><li>The Rich Text Editor, derived from the highly customizable CKeditor, gives unlimited possibilities on what you can prompt.</li><ul><!-- <li>Add emoticons to indicate feelings and expressions to your hosts.</li>--><li>You may generate and display mathematical equations using the integrated CodeCogs equation editor.<br><table border="1" cellpadding="1" cellspacing="1"><tbody><tr><td>&nbsp;</td><td><img alt="\bg_white \huge \sum_{heta+\Pi }^{80} sin(heta)" src="https://latex.codecogs.com/gif.latex?%5Cdpi%7B300%7D%20%5Cbg_white%20%5Chuge%20%5Csum_%7B%5CTheta&amp;plus;%5CPi%20%7D%5E%7B80%7D%20sin%28%5CTheta%29" /></td><td>&nbsp;</td></tr></tbody></table></li><li>Insert images from the web or copy and paste them into the prompter.<img alt="Picture: Arecibo Sky" src="assets/custom/img/arecibo-sky.jpg"></li> </ul><li>There are various <em>Prompter Styles</em> to choose from. You may also create your own.</li><!-- <li>Download our mobile app, <em>Teleprompter X</em>, to remote control Teleprompter instalations.</li> --><li>Run the "External prompter" on a second screen, add new contents into the editor, then "Update" your prompter in realtime without having to halt your script.</li><li>Teleprompter works across screens with different resolutions and aspect ratios.</li><li>Using calculus and relative measurement units, Teleprompter is built to age gracefully. Speed and contents remain consistent from your smallest screen up to 4k devices and beyond.</li><li>Animations are hardware accelerated for a smooth scroll. A quad-core computer with dedicated graphics and, at least, 2GB RAM is recommended for optimal results.</li><li>Teleprompter doesn\'t stretch a lower quality copy of your prompt for monitoring, instead it renders each instance individually at the highest quality possible. You should lower your resolution to increase performance on lower end machines.</li><li>Text can be pasted from other word processors such as Libre Office Writer&trade; and Microsoft Word&reg;.</li><li>All data is managed locally. We retain no user data.</li><li>Use the standalone installation for greater performance and automatic fullscreen prompting.</li><li>The standalone version comes for Linux, OS X, Microsoft Windows and Free BSD.</li><li>Close prompts and return to the editor by pressing \'ESC\'.</li></ol><hr><h4>How to use anchor shortcuts:</h4><ol><li>Select a keyword or line you want to jump to on your text in the editor.</li><li>Click on the <strong>Flag Icon</strong> on the editor\'s tool bar.</li><li>A box named "Anchor Properties" should have appeared. Type any single key of your choice and click \'Ok\'.<br>Note preassigned keys, such as WASD and Spacebar will be ignored.</li><li>Repeat as many times as you wish.</li><li>When prompting, press on the shortcut key to jump into the desired location.</li></ol><p>###</p>',
                "editable": false
            }],

        });

        teleprompter.editor.save = function() {
            if (teleprompter.fileManager.currentElement != 0) {
                var scriptsData = teleprompter.fileManager.getElements();
                scriptsData[teleprompter.fileManager.currentElement]["data"] = document.getElementById("prompt").innerHTML;
                teleprompter.fileManager.getSaveMode().setItem(teleprompter.fileManager.getDataKey(), JSON.stringify(scriptsData));
            }
        }

        teleprompter.fileManager.selectedElement = function(element) {
            var scriptsData = teleprompter.fileManager.getElements();
            if (scriptsData[teleprompter.fileManager.currentElement].hasOwnProperty('data'))
                document.getElementById("prompt").innerHTML = scriptsData[teleprompter.fileManager.currentElement]['data'];
            else
                document.getElementById("prompt").innerHTML = "";
            teleprompter.fileManager.closeModal()
        }

        teleprompter.fileManager.addElementEnded = function(element) {
            if (debug) console.log(element);
            teleprompter.fileManager.selectedElement(element);
        }

        teleprompter.fileManager.setEvent('input','prompt',function() {
            save();
        });

        function editorInit() {
            // Need failed verification
            loadScript(`editors/${currentEditor}.js`);
        }

        editorInit();

        var fileManagerToggle = document.querySelector("#fileManagerToggle");
        fileManagerToggle.onclick = function(event) {
            event.preventDefault();
            fileManager.openModal();
            teleprompter.editor.save();
        };
        var fileManagerClose = document.querySelector("#fileManagerClose");
        fileManagerClose.onclick = function(event) {
            fileManager.closeModal();
        }

        var settingsModalToggle = document.querySelector("#settingsToggle");
        settingsModalToggle.onclick = function(event) {
            event.preventDefault();
            settingsModal = new bootstrap.Modal(document.getElementById("settingsModal"), {
                keyboard: false,
                backdrop: 'static'
            });
            settingsModal.show();
        };
        var settingsClose = document.querySelector("#settingsClose");
        settingsClose.onclick = function(event) {
            settingsModal.hide();
        }
        
    }

    // Initialize objects after DOM is loaded
    if (document.readyState === "interactive" || document.readyState === "complete")
        // Call init if the DOM (interactive) or document (complete) is ready.
        init();              
    else
        // Set init as a listener for the DOMContentLoaded event.
        document.addEventListener("DOMContentLoaded", init);

    // Toogle control
    $('.btn-toggle').click(function() {
        $(this).find('.btn').toggleClass('active');  
        
        if ($(this).find('.btn-primary').length>0) {
            $(this).find('.btn').toggleClass('btn-primary');
        }
        if ($(this).find('.btn-danger').length>0) {
            $(this).find('.btn').toggleClass('btn-danger');
        }
        if ($(this).find('.btn-success').length>0) {
            $(this).find('.btn').toggleClass('btn-success');
        }
        if ($(this).find('.btn-info').length>0) {
            $(this).find('.btn').toggleClass('btn-info');
        }
        
        $(this).find('.btn').toggleClass('btn-default');
           
    });
    $('form').submit(function(){
        return false;
    });
// }());

// Global functions, to be accessed from Electron's main process.
function enterDebug() {
    debug = true;
    console.log("Entering debug mode.");    function updateFont() {
        prompt.style.fontSize = fontSize+'em' ;
        overlayFocus.style.fontSize = fontSize+'em' ;
        onResize();
    }
}
function exitDebug() {
    debug = false;
    console.log("Leaving debug mode.");
}
function toggleDebugMode() {
    if (debug) 
        exitDebug();
    else
        enterDebug();
}
