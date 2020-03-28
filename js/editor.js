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

"use strict";
var debug = false;

(function() {
    // Use JavaScript Strict Mode.

    // Import Electron libraries.
    if (inElectron()){
        var {ipcRenderer} = require('electron'),
        remote = require('electron').remote, // Allows IPC with main process in Electron.
        elecScreen = require('electron').screen; // Allows Smart Fullscreens in Electron.
        window.jQuery = require('./js/jquery.min.js');
        window.$ = window.jQuery;
        window.Slider = require('./js/bootstrap-slider.min.js');
    }
    
    // Global objects
    var promptIt, updateIt, prompterWindow, frame, currentScript, canvas, canvasContext, slider, promptWidth,
        syncMethods = {"instance":0, "canvas":1, "follow":2};

    // Global variables
    var syncMethod = syncMethods.instance,
        forceSecondaryDisplay = false,
        domain, tic, instance = [false, false],
        htmldata, editorFocused=false;

    if ( syncMethod === syncMethods.canvas ) {
        forceSecondaryDisplay = true;
    }

    //SideBar
    var sidebar = new SIDEBAR();

    // Enums
    var command = Object.freeze({
        "incVelocity": 1,
        "decVelocity": 2,
        "iSync": 3,
        "sync": 4,
        "togglePlay": 5,
        "internalPlay": 6,
        "internalPause": 7,
        "play": 8,
        "pause": 9,
        "stopAll": 10,
        "incFont": 11,
        "decFont": 12,
        "anchor": 13,
        "close": 14,
        "restoreEditor": 15,
        "resetTimer":16
    });

    function init() {
        // Set globals
        tic = false;

        // Set DOM javascript controls
        promptIt = document.getElementById("promptIt");
        updateIt = document.getElementById("updateIt");
        promptIt.onclick = submitTeleprompter;
        updateIt.onclick = updateTeleprompter;
        document.getElementById("prompterStyle").setAttribute("onchange", "setStyleEvent(value);");
        document.getElementById("credits-link").onclick = credits;

        frame = document.getElementById("teleprompterframe");
        canvas = document.getElementById("telepromptercanvas");
        canvasContext = canvas.getContext('2d');
        // Set default style and option style
        //setStyle(document.getElementById("prompterStyle").value);
        // Set initial configuration to prompter style
        styleInit(document.getElementById("prompterStyle"));
        slider = [
            new Slider("#speed", {}),
            new Slider("#acceleration", {}),
            new Slider("#fontSize", {}),
            new Slider("#promptWidth", {})
        ];
        // Data binding for advanced options
        slider[0].on("change", function(input) {
            document.getElementById("speedValue").textContent = parseFloat(Math.round(input.newValue * 10) / 10).toFixed(1);
        });
        slider[1].on("change", function(input) {
            document.getElementById("accelerationValue").textContent = parseFloat(Math.round(input.newValue * 100) / 100).toFixed(2);
        });
        slider[2].on("change", function(input) {
            document.getElementById("fontSizeValue").textContent = input.newValue;
            updateFont(input.newValue);
        });
        slider[3].on("change", function(input) {
            document.getElementById("promptWidthValue").textContent = input.newValue;
            updateWidth(input.newValue);
        });
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

        // Initialize file management features.
        initScripts();
        //initImages();
        loadLastUseSettings();
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
                            dataToMigrate[0]["id"] = sidebar.createIDTag(dataToMigrate[0].name, true);
                            sidebar.getSaveMode().setItem(sidebar.getDataKey(), JSON.stringify(dataToMigrate));
                        }
                        // Continue with rest of the data
                        for (var i = 1; i < dataToMigrate.length; i++)
                            if (dataToMigrate[i].hasOwnProperty("name")) {
                                dataToMigrate[i]["id"] = sidebar.createIDTag(dataToMigrate[i].name);
                                sidebar.getSaveMode().setItem(sidebar.getDataKey(), JSON.stringify(dataToMigrate));
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

    // Instance Editor
    if (typeof tinymce !== "undefined") {
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
            editor_css: "css/tinymce.css",
            plugins: "advlist anchor save charmap code colorpicker contextmenu directionality emoticons fullscreen hr image media lists nonbreaking paste print searchreplace spellchecker table textcolor wordcount imagetools insertdatetime",
            toolbar: ['anchor | save | undo redo | styleselect | bold italic underline strikethrough | superscript subscript | forecolor backcolor | bullist numlist | alignleft aligncenter alignright | charmap image | searchreplace fullscreen'],
            contextmenu: "copy cut paste pastetext | anchor | image charmap",
            menu: {
                file: {
                    title: 'File',
                    items: 'newdocument print'
                },
                edit: {
                    title: 'Edit',
                    items: 'undo redo | cut copy paste pastetext | selectall'
                },
                insert: {
                    title: 'Insert',
                    items: 'anchor insertdatetime | image media emoticons | hr charmap'
                },
                format: {
                    title: 'Format',
                    items: 'bold italic underline strikethrough | superscript subscript | formats | removeformat | ltr rtl'
                },
                table: {
                    title: 'Table',
                    items: 'inserttable tableprops deletetable | cell row column'
                },
                tools: {
                    title: 'Tools',
                    items: 'searchreplace spellchecker code'
                }
            },
            directionality: "ltr",
            setup: function(editor) {
                // Don't close editor when out of focus.
                editor.on("blur", function() {
                    editorFocused = false;
                    return false;
                });
                editor.on("focus", function() {
                    editorFocused = true;
                });
            },
            style_formats: [{
                title: 'Paragraph',
                block: 'p'
            }, {
                title: 'Heading 1',
                block: 'h1'
            }, {
                title: 'Heading 2',
                block: 'h2'
            }, {
                title: 'Heading 3',
                block: 'h3'
            }, {
                title: 'Heading 4',
                block: 'h4'
            }, ],
            //image_list: [
            //  {title: 'My image 1', value: 'http://www.tinymce.com/my1.gif'},
            //  {title: 'My image 2', value: 'http://www.moxiecode.com/my2.gif'}
            //],
            save_enablewhendirty: false,
            save_onsavecallback: save,
            nonbreaking_force_tab: true
        });
    }

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
        var settings = '{ "data": {"secondary":0,"primary":1,"prompterStyle":2,"focusMode":3,"background":"#3CC","color":"#333","overlayBg":"#333","speed":"13","acceleration":"1.2","fontSize":"100","timer":"false","voice":"false"}}',
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
        if (typeof CKEDITOR !== "undefined")
            htmldata = CKEDITOR.instances.prompt.getData()
        else if (typeof tinymce !== "undefined")
            htmldata = tinymce.get("prompt").getContent();
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
            if ( document.getElementById("timer").children[0].classList.contains("btn-primary") )
                timer = true;
            else
                timer = false;
        }
        if (override!==undefined && override.voice!==undefined)
            voice = override.voice;
        else
            voice = false;
        // Merge all settings into one.
        var settings = '{ "data": {"primary":'+primary+',"secondary":'+secondary+',"prompterStyle":'+style+',"focusMode":'+focusArea+',"speed":'+speed+',"acceleration":'+acceleration+',"fontSize":'+fontSize+',"promptWidth":'+promptWidth+',"timer":'+timer+',"voice":'+voice+'}}',
        session = '{ "html":"' + encodeURIComponent(htmldata) + '" }';

        // Store data locally for prompter to use
        dataManager.setItem("IFTeleprompterSettings", settings, 1);
        // If we use sessionStorage we wont be able to update the contents.
        dataManager.setItem("IFTeleprompterSession", session, 1);
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
            var displays = elecScreen.getAllDisplays(), // Returns an array of displays that are currently  available.
                primaryDisplay = elecScreen.getPrimaryDisplay(),
                currentDisplay = 0, // 0 means primary and 1 means secondary
                cursorLocation = elecScreen.getCursorScreenPoint();
            // Find the first display that isn't the primary display.
            if (debug) console.log("Displays amount: "+displays.length);
            for (var i=0; i<displays.length; i++) {
                if ( !(displays[i].bounds.x===primaryDisplay.bounds.x && displays[i].bounds.y===primaryDisplay.bounds.y) ) {
                    secondaryDisplay = displays[i]; // externalDisplay recives all available displays.
                    break;
                }
            }
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

    document.onkeydown = function(event) {
        // keyCode is announced to be deprecated but not all browsers support key as of 2016.
        if (event.key === undefined)
            event.key = event.keyCode;
        if (!editorFocused) {
            if (debug) console.log(event.key);
            switch (event.key) {
                // TELEPROMPTER COMMANDS
                case "s":
                case "S":
                case "ArrowDown":
                case 40: // Down
                case 68: // S
                listener({
                    data: {
                        request: command.incVelocity
                    }
                });
                break;
                    // prompterWindow.postMessage( message, getDomain())
                    case "w":
                    case "W":
                    case "ArrowUp":
                case 38: // Up
                case 87: // W
                listener({
                    data: {
                        request: command.decVelocity
                    }
                });
                break;
                case "d":
                case "D":
                case "ArrowRight":
                case 83: // S
                case 39: // Right
                listener({
                    data: {
                        request: command.incFont
                    }
                });
                break;
                case "a":
                case "A":
                case "ArrowLeft":
                case 37: // Left
                case 65: // A
                listener({
                    data: {
                        request: command.decFont
                    }
                });
                break;
                case " ":
                case "Space": // Spacebar
                case 32: // Spacebar
                listener({
                    data: {
                        request: command.togglePlay
                    }
                });
                break;
                case ".":
                case "Period": // Numpad dot
                case 110: // Numpad dot
                case 190: // Dot
                listener({
                    data: {
                        request: command.sync
                    }
                });
                break;
                case 8:
                case "Backspace":
                listener({
                    data: {
                        request: command.resetTimer
                    }
                });                    
                break;
                // EDITOR COMMANDS
                case 116:
                case "F5":
                if (debug)
                    refresh();
                else
                    console.log("Debug mode must be active to use 'F5' refresh in Electron. 'F10' enters and leaves debug mode.");
                break;
                case 117:
                case "F6":
                clearAllRequest();
                break;
                case 119:
                case "F8":
                togglePrompter();
                break;
                case 122:
                case "F11":
                event.preventDefault();
                toggleFullscreen();
                break;
                case 120:
                case "F10":
                toggleDebug();
                break;
                case 27: // ESC
                case "Escape":
                restoreEditor();
                closeModal();
                break;
                // Electron Commands
                /*
                case 17, 91, 70:
                case "ctrl" + "" + "f":
                if(inElectron()){
                event.preventDefault();
                toggleFullscreen();
                break;
                } else{
                break;
                }
                */
                default:
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
    };

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
        var sideBar = document.querySelector("#wrapper");
        if (!sideBar.classList.contains("toggled"))
            sideBar.classList.toggle("toggled");
    }

    // Save last use settings
    window.addEventListener("beforeunload", updatePrompterData);

    function updateFont(value) {
        if (debug) console.log("Updating font.");
        document.getElementById("prompt").style.fontSize = "calc(5vw * "+(value/100+0.05)+")";
    }

    function updateWidth(value) {
        if (debug) console.log("Updating width.");
        const prompt = document.getElementById("prompt");
        prompt.style.width = value+"vw";
        prompt.style.left = "calc("+(50-value/2)+"vw - 14px)";
    }

    function loadLastUseSettings() {
        // Get last used settings.
        var settings = function ( lastSettings ) {
            if (lastSettings!==undefined && lastSettings!==null) {
                if (debug) console.log(lastSettings);
                lastSettings = JSON.parse(lastSettings);
                document.getElementById("primary").value = lastSettings.data.primary;
                document.getElementById("secondary").value = lastSettings.data.secondary;
                // document.getElementById("prompterStyle").value = lastSettings.data.prompterStyle;
                document.getElementById("focus").value = lastSettings.data.focusMode;
                // If no last used value, leave default values.
                if (!isNaN(lastSettings.data.speed))
                    slider[0].setValue(lastSettings.data.speed);
                else
                    lastSettings.data.speed = slider[0].getValue();
                if (!isNaN(lastSettings.data.acceleration))
                    slider[1].setValue(lastSettings.data.acceleration);
                else
                    lastSettings.data.acceleration = slider[1].getValue();
                if (!isNaN(lastSettings.data.fontSize))
                    slider[2].setValue(lastSettings.data.fontSize);
                else
                    lastSettings.data.fontSize = slider[2].getValue();
                document.getElementById("speedValue").textContent = parseFloat(Math.round(lastSettings.data.speed * 10) / 10).toFixed(1);
                document.getElementById("accelerationValue").textContent = parseFloat(Math.round(lastSettings.data.acceleration * 100) / 100).toFixed(2);
                document.getElementById("fontSizeValue").textContent = lastSettings.data.fontSize;
                updateFont(lastSettings.data.fontSize);
                // Set timer value
                var timer = document.getElementById("timer")
                if (lastSettings.data.timer) {
                    timer.children[0].classList.add("btn-primary");
                    timer.children[0].classList.remove("btn-default");
                    timer.children[1].classList.add('btn-default');
                    timer.children[1].classList.remove('btn-primary');
                }
                // Set voice value
                // var voice = document.getElementById("voice")
                // if (lastSettings.data.timer) {
                //     voice.children[0].classList.toggle("btn-primary");
                //     voice.children[0].classList.toggle("btn-default");
                //     voice.children[0].classList.innerHTML("Active");
                // }
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

    /*function insertAtCaret(el,text){
        var element = document.getElementById(el);
        var scrollPos = element.scrollTop;
        var strPos = 0;
        var br = ((element.selectionStart || element.selectionStart == '0') ? "ff" : (document.selection ? "ie" : "false"));
        if(br == "ie"){
            element.focus();
            var range = document.selection.createRange();
            range.moveStart('character',-element.value.length);
            strPos = range.text.length;
        }else if(br == "ff")
            strPos = element.selectionStart;

        var front = (element.value).substring(0,strPos);
        var back = (element.value).substring(strPos,element.value.length);
        element.value=front+text+back;
        strPos = strPos + text.length;

        if(br == "ie"){
            element.focus();
            var range = document.selection.createRange();
            range.moveStart('character',-element.value.length);
            range.moveStart('character',strPos);
            range.moveEnd('character',0);
            range.select();
        }else if(br == "ff"){
            element.selectionStart = strPos;
            element.selectionEnd = strPos;
            element.focus();
        }
        element.scrollTop = scrollPos;
    }*/

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

    /*function initImages() {
        var imagesNode = document.getElementById("images");
        if (imagesNode) {
            var li = document.createElement("li");
            var div = document.createElement("div");
            var span2 = document.createElement("span");
            span2.id = "addMode";
            span2.classList.add("glyphicon");
            span2.classList.add("glyphicon-plus");
            div.appendChild(span2);

            var p = document.createElement("p");
            p.id = "textBlock";
            p.style.display = "inline";
            p.setAttribute("contentEditable", false);
            p.appendChild(document.createTextNode(" Add Image"))
            div.appendChild(p);

            li.onclick = function(e) {
                e.stopImmediatePropagation();
                this.querySelector("#uploadImage").click();
            };

            li.appendChild(div);

            var _createObjectURL = window.URL.createObjectURL;
            Object.defineProperty(window.URL, 'createObjectURL', {
                set: function(value) {
                    _createObjectURL = value;
                },
                get: function() {
                    return _createObjectURL;
                }
            });
            var _URL = window.URL;
            Object.defineProperty(window, 'URL', {
                set: function(value) {
                    _URL = value;
                },
                get: function() {
                    return _URL;
                }
            });

            var input = document.createElement("input");
            input.id = "uploadImage";
            input.type = "file";
            input.style.display = "none";
            input.onchange = function(e) {

                var file = this.parentNode.querySelector('input[type=file]').files[0];
                var reader = new FileReader();

                reader.onloadend = function() {
                    //console.log("Name: "+file.name+" Re: "+reader.result);
                    var img = document.createElement("img");

                    //navigator.saveOrOpenBlob = navigator.saveOrOpenBlob || navigator.msSaveOrOpenBlob || navigator.mozSaveOrOpenBlob || navigator.webkitSaveOrOpenBlob;
                    //navigator.saveOrOpenBlob(file, 'msSaveBlob_testFile.txt');

                    img.src = reader.result//_createObjectURL(file);
                    document.getElementById('prompt').focus();
                    insertTextAtCursor(img);
                    document.querySelector("#wrapper").classList.toggle("toggled");
                    document.getElementById("uploadImage").value = "";

                    if (debug) console.log(img);
                }

                if (file) {
                    reader.readAsDataURL(file); //reads the data as a URL
                }

            };
            li.appendChild(input);
            imagesNode.appendChild(li);
        }
    }*/

    function addQRConnection(ip) {
        var wrapper = document.querySelector("#wrapper");
        var sidebarWrapper = wrapper.querySelector("#sidebar-wrapper");

        var div = document.createElement("div");
        div.id = "sidebar-connect";
        
        var p = document.createElement("p");
        var text = document.createTextNode('Please use Web Connect on Teleprompter App to use the Remote Control');
        p.appendChild(text);
        div.appendChild(p);
        var image = document.createElement("img");
        image.src = "data:image/png;base64,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"
        var defaults = {
            // render method: 'canvas', 'image' or 'div'
            render: 'image',

            // version range somewhere in 1 .. 40
            minVersion: 6,
            maxVersion: 40,

            // error correction level: 'L', 'M', 'Q' or 'H'
            ecLevel: 'H',

            // offset in pixel if drawn onto existing canvas
            left: 0,
            top: 0,

            // size in pixel
            size: 400,

            // code color or image element
            fill: '#6D5599',

            // background color or image element, null for transparent background
            background: null,

            // content
            text: 'http://' + ip + ':3000/',

            // corner radius relative to module width: 0.0 .. 0.5
            radius: 0.5,

            // quiet zone in modules
            quiet: 1,

            // modes
            // 0: normal
            // 1: label strip
            // 2: label box
            // 3: image strip
            // 4: image box
            mode: 4,

            mSize: 0.3,
            mPosX: 0.5,
            mPosY: 0.5,

            label: 'no label',
            fontname: 'sans',
            fontcolor: '#000',

            image: image
        };

        var s = new qrcodeGen(defaults);
        s.style.width = 75+ '%';
        s.style.marginLeft = 12.5 + '%';
        s.style.backgroundColor = '#fff';
        div.appendChild(s);

        sidebarWrapper.insertBefore(div, sidebarWrapper.childNodes[0]);
    }

    // Teleprompter Scripts File Manager
    function initScripts() {
        //initialize SideBar
        var sid = sidebar.on('scripts',{
            "name":"Files",
            "elementName":"Script",
            "newElementName":"Untitled",
            "dataKey":"IFTeleprompterSideBar",
            "preloadData":[{
                "name": "Instructions",
                "data": '<h3>Welcome to Imaginary Teleprompter!</h3>\n<p>Are you ready to tell a story?</p>\n<br>\n<p>"Teleprompter" is the most complete, free software, professional teleprompter for anyone to use. Click on "Prompt It!" whenever you\'re ready and control the speed with the arrow keys.</p>\n<br>\n<h3>Here are some of our features:</h3>\n<ol>\n<li>Control the speed and text-size with the \'Up\' and \'Down\' arrow keys, the \'W\' and \'S\' keys or the mouse wheel. You may press \'Spacebar\' to pause at anytime.</li>\n<li>Dynamically change the font-size by pressing \'Left\' and \'Right\' or the \'A\' and \'D\' keys.</li>\n<li>Flip modes allow <em>mirroring</em> the prompter in every possible way.</li>\n<li>You can use one or two instances. Mirror one, monitor on the other one.</li>\n<li><a id="5" name="5">Set almost any key as an <em>anchor</em> and instantly jump to any part of the script. Try pressing \'5\' now!</a></li>\n<li>Different focus areas allow you to easily use Teleprompter with a webcam, a tablet, or professional teleprompter equipment.</li>\n<li>Time your segments with the built in <em>timer</em>. Press \'Backspace\' to reset the timer.</li>\n<li>Tweak the <em>Speed</em>, <em>Acceleration Curve</em> and <em>Font Size</em> settings to fit your hosts\' needs.</li>\n<li>The Rich Text Editor, derived from the highly customizable CKeditor, gives unlimited possibilities on what you can prompt.</li>\n<ul>\n<!--\n <li>Add emoticons to indicate feelings and expressions to your hosts.\n</li>\n-->\n<li>\nYou may generate and display mathematical equations using the integrated CodeCogs equation editor.<br>\n<table border="1" cellpadding="1" cellspacing="1">\n<tbody>\n<tr>\n<td>&nbsp;</td>\n<td><img alt="\bg_white \huge \sum_{heta+\Pi }^{80} sin(heta)" src="http://latex.codecogs.com/gif.latex?%5Cdpi%7B300%7D%20%5Cbg_white%20%5Chuge%20%5Csum_%7B%5CTheta&amp;plus;%5CPi%20%7D%5E%7B80%7D%20sin%28%5CTheta%29" /></td>\n<td>&nbsp;</td>\n</tr>\n</tbody>\n</table>\n</li>\n<li>Insert images from the web or copy and paste them into the prompter.\n<img alt="Picture: Arecibo Sky" src="img/arecibo-sky.jpg">\n</li>\n </ul>\n<li>There are various <em>Prompter Styles</em> to choose from. You may also create your own.</li>\n<li>Press \'F11\' to enter and leave fullscreen.\nYou may fullscreen the text editor for greater concentration.</li>\n<!-- <li>Download our mobile app, <em>Teleprompter X</em>, to remote control Teleprompter instalations.</li>\n --><li>Run the "External prompter" on a second screen, add new contents into the editor, then "Update" your prompter in realtime without having to halt your script.</li>\n<li>Teleprompter works across screens with different resolutions and aspect ratios.</li>\n<li>Using calculus and relative measurement units, Teleprompter is built to age gracefully. Speed and contents remain consistent from your smallest screen up to 4k devices and beyond.</li>\n<li>Animations are hardware accelerated for a smooth scroll. A quad-core computer with dedicated graphics and, at least, 2GB RAM is recommended for optimal results.</li>\n<li>Teleprompter doesn\'t stretch a lower quality copy of your prompt for monitoring, instead it renders each instance individually at the highest quality possible. You should lower your resolution to increase performance on lower end machines.</li>\n<li>Text can be pasted from other word processors such as Libre Office Writer&trade; and Microsoft Word&reg;.</li>\n<li>All data is managed locally. We retain no user data.</li>\n<li>Use the standalone install for greater performance and automatic fullscreen prompting.</li>\n<li>The standalone version comes for Linux, OS X, Microsoft Windows and Free BSD.</li>\n<li>Close prompts and return to the editor by pressing \'ESC\'.</li>\n</ol>\n<hr>\n<h4>How to use anchor shortcuts:</h4>\n<ol>\n<li>Select a keyword or line you want to jump to on your text in the editor.</li>\n<li>Click on the <strong>Flag Icon</strong> on the editor\'s tool bar.</li>\n<li>A box named "Anchor Properties" should have appeared. Type any single key of your choice and click \'Ok\'.<br>Note preassigned keys, such as WASD and Spacebar will be ignored.</li>\n<li>Repeat as many times as you wish.</li>\n<li>When prompting, press on the shortcut key to jump into the desired location.</li>\n</ol>\n<p>###</p>',
                "editable": false
            }],

        });

       function save() {
            if (sid.currentElement != 0) {
                var scriptsData = sid.getElements();
                scriptsData[sid.currentElement]["data"] = document.getElementById("prompt").innerHTML;
                sid.getSaveMode().setItem(sid.getDataKey(), JSON.stringify(scriptsData));
            }
        }

        sid.selectedElement = function(element) {
            var scriptsData = sid.getElements();
            if (scriptsData[sid.currentElement].hasOwnProperty('data'))
                document.getElementById("prompt").innerHTML = scriptsData[sid.currentElement]['data'];
            else
                document.getElementById("prompt").innerHTML = "";
            document.querySelector("#wrapper").classList.toggle("toggled");
        }

        sid.addElementEnded = function(element) {
            if (debug) console.log(element);
            sid.selectedElement(element);
        }

        sid.setEvent('input','prompt',function() {
            save();
        });

        CKEDITOR.on('instanceReady', function(event) {
            var editor = event.editor,
            scriptsData = sid.getElements();
            if (scriptsData[sid.currentElement].hasOwnProperty('data'))
                document.getElementById("prompt").innerHTML = scriptsData[sid.currentElement]['data'];
            else
                document.getElementById("prompt").innerHTML = "";

            editor.on('key', function(event) {
                if (event.key === undefined)
                    event.key = event.data.keyCode;
                if (debug) console.log(event.key);
                if (sid.instructionsAreLoaded() && -1===[1114129,1114177,1114179,1114121,5570578,1114337,4456466,2228240,91,225,27,112,113,114,115,116,117,118,119,120,121,122,123,45,20,33,34,35,36,37,38,39,40].indexOf(event.key)) {
                    window.location = '#sidebarAddElement';
                    document.getElementById("inputName").focus();
                } else if (event.key===122 || event.key==="F11") {
                    toggleFullscreen();
                } else if (event.key===119 || event.key==="F8") {
                    togglePrompter();
                }
                return true;
            });

            editor.on('focus', function() {
                editorFocused = true;
                if (debug) console.log('Editor focused.');
                save();
            });

            editor.on('blur', function() {
                editorFocused = false;
                if (debug) console.log('Editor out of focus.');
                save();
            });
        });

        var menuToggle = document.querySelector("#menu-toggle");
        menuToggle.onclick = function(event) {
            event.preventDefault();
            document.querySelector("#wrapper").classList.toggle("toggled");
            save();
        };
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
}());

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
// On change Prompter Style
function setStyleEvent(prompterStyle) {
    if (setStyle) {
        if (debug) console.log(prompterStyle);
        setStyle(prompterStyle);
    }
}
