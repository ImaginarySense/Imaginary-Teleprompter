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

class Editor {
    constructor() {
        this.debug = false;
        this.contentEditor = {};

        var editorList = [
            // oficial
            "ckeditor",
            // testing alternatives
            "tinymce",
            "summernote"
        ]
        this.currentEditor = editorList[0];

        // Import Electron libraries.
        if (inElectron()){
            const electron = require('electron');
            this.remote = require('@electron/remote');  // Allows IPC with main process in Electron.
            this.electronScreen = remote.screen; // Allows Smart Fullscreens in Electron.
            this.ipcRenderer = electron.ipcRenderer;

            // window.jQuery = require('./assets/jquery/jquery.min.js');
            // window.$ = window.jQuery;
            // window.Slider = require('./assets/bootstrap-slider/js/bootstrap-slider.min.js');
        }

        this.syncMethods = {"instance": 0, "canvas": 1, "follow": 2};
        this.syncMethod = this.syncMethods.instance;
        this.forceSecondaryDisplay = false;
        this.instance = [false, false],
        this.editorFocused = false;

        if (this.syncMethod === this.syncMethods.canvas) {
            this.forceSecondaryDisplay = true;
        }
    }

    init() {
        // Set globals
        this.tic = false;

        // Initialize file Manager
        teleprompter.fileManager = new FileManager();

        // Initialize commands mapping
        teleprompter.commandsMapping = new CommandsMapping();

        // Initialize themes
        teleprompter.themes = new Themes();
        teleprompter.themes.setColorPicker();

        // Initialize controls
        teleprompter.controls = new Controls();

        // Set DOM javascript controls
        this.promptIt = document.getElementById("promptIt");
        this.updateIt = document.getElementById("updateIt");
        
        this.promptCanSubmitTeleprompter = true;
        this.promptIt.onclick = function(event) {
            this.submitTeleprompter(event);
        }.bind(this);
        this.updateIt.onclick = function(event) {
            this.updateTeleprompter(event);
        }.bind(this);

        document.getElementById("prompterStyle").addEventListener('change', function(e) {
            teleprompter.themes.setStyle(e.target.value);
        }.bind(this));

        document.getElementById("prompterStyleControl").addEventListener('change', function(e) {
            teleprompter.themes.setStyle(e.target.value);
        }.bind(this));

        this.frame = document.getElementById("teleprompterframe");
        this.canvas = document.getElementById("telepromptercanvas");
        this.canvasContext = this.canvas.getContext('2d');

        // Set initial configuration to prompter style
        teleprompter.themes.styleInit(document.getElementById("prompterStyle"));

        // Set credits button
        document.getElementById("credits-link").onclick = this.credits;

        // Set domain to current domain.
        this.setDomain();

        // If running inside Electron...
        if (inElectron()) {
            var compare = require("deb-version-compare");
            const remote = require('electron').remote;

            //Check, Update and Migrate Teleprompter Data
            dataManager.getItem("IFTeleprompterVersion", function(item) {
                if (item == null || compare(currentVersion, item) == 1) {
                    //fix 
                    item = "0";

                    //check if is going to use a develoment version 
                    if (!isADevVersion(item) && isADevVersion(currentVersion)) {
                        //migrarate from official version to a development version
                        window.location = "#devWarning";
                        var agreeButton = document.getElementById("agreeWarningButton");
                        agreeButton.onclick = function(e) {
                            this.applyMigration(item);
                            dataManager.setItem("IFTeleprompterVersion", currentVersion);
                            this.closeModal();
                        }.bind(this);
                        document.getElementById("cancelWarningButton").onclick = this.closeWindow;
                        document.getElementById("closeWarning").onclick = this.closeWindow;
                        agreeButton.focus();
                    } else {
                        //migrate from previous versions 
                        this.applyMigration(item);
                        dataManager.setItem("IFTeleprompterVersion",currentVersion);

                        //make sure all modal closes after reload the page
                        //place this here to avoid problems with the warning and the newest modal
                        this.closeModal();
                    }
                    
                } else if(compare(item, currentVersion) == 1) {
                    window.location = "#devNewestVersion";
                    var cancelButton = document.getElementById("cancelNewestButton");
                    cancelButton.onclick = function(e){
                        var window = this.remote.getCurrentWindow();
                        window.close();
                    }.bind(this);
                    cancelButton.focus();
                } 
            }, 0, 0);
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
                    this.restoreEditor();
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


        // Draw controls
        teleprompter.controls.draw();

        // Load latest values
        this.loadLastUseSettings();

        // Draw prompt styles
        teleprompter.themes.draw();

        // Draw file management
        teleprompter.fileManager.draw();

        // Load current editor
        loadScript(`editors/${this.currentEditor}.js`);

        // Initialize commands mapping editor
        teleprompter.commandsMapping.draw();

        // Maybe we need to move the listener to prompter
        // Initialize postMessage event listener.
        addEventListener("message", function(event) {
            this.listener(event);
        }.bind(this), false);

        // Credits
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                this.htmldata = xmlhttp.responseText;
                this.internalCredits();
            }
        }.bind(this);

        document.addEventListener('keydown', function(event) {
            this.commandsListener(event);
        }.bind(this));

        // Save last use settings
        window.addEventListener("beforeunload", this.updatePrompterData);

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
    }

    closeWindow() {
        var window = this.remote.getCurrentWindow();
        window.close();
    }

    // Resize canvas size
    resizeCanvas(size) {
        if ( !(this.canvas.width===size[0] && this.canvas.height===size[1]) ) {
            this.canvas.width = size[0];
            this.canvas.height = size[1];
        }
    }

    isADevVersion(version) {
        if(version.includes("rc") || version.includes("alpha") || version.includes("beta"))
            return true;
        return false;
    }

    //Apply migration by versions
    applyMigration(version) {
        switch (version) {
            // "default" at top for unnacaunted developer versions. I didn't thought this was possible! xD
            default:
            // 2.2 or bellow
            case null:
            case "0":
            case "2.2.0":
                dataManager.getItem("IFTeleprompterSideBar", function(dataToMigrate) {
                    if (dataToMigrate) {
                        // Convert Data
                        dataToMigrate = JSON.parse(dataToMigrate);
                        if (dataToMigrate.length > 0) {
                            // Fix to not do more dirty work
                            dataToMigrate[0]["id"] = teleprompter.fileManager.createIDTag(dataToMigrate[0].name, true);
                            teleprompter.fileManager.getSaveMode().setItem(teleprompter.fileManager.getDataKey(), JSON.stringify(dataToMigrate));
                        }
                        // Continue with rest of the data
                        for (var i = 1; i < dataToMigrate.length; i++)
                            if (dataToMigrate[i].hasOwnProperty("name")) {
                                dataToMigrate[i]["id"] = teleprompter.fileManager.createIDTag(dataToMigrate[i].name);
                                teleprompter.fileManager.getSaveMode().setItem(teleprompter.fileManager.getDataKey(), JSON.stringify(dataToMigrate));
                            }
                    }
                }, 0, 0);
            case "2.3.0": // Nothing to do here, issues solved elsewhere.
            // Next itteration
            case "2.4.0":
            break;
        }
    }

    setDomain() {
        // Get current domain from browser
        this.domain = document.domain;
        // If not running on a server, return catchall.
        if (this.domain.indexOf("http://") != 0 || this.domain.indexOf("https://") != 0 || this.domain.indexOf("localhost") != 0)
        this.domain = "*";
    }

    getDomain() {
        return this.domain;
    }

    launchIntoFullscreen(element) {
        var requestFullscreen = element.requestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen || element.msRequestFullscreen;
        if (requestFullscreen !== undefined)
            requestFullscreen.call(element);
    }

    exitFullscreen() {
        var exitFullscreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullscreen;
        if (exitFullscreen !== undefined)
            exitFullscreen.call(document);
    }

    toggleFullscreen() {
        var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement,
            elem;
        if (fullscreenElement)
            this.exitFullscreen();
        else {
            if (this.promptCanSubmitTeleprompter)
                elem = document.getElementById("editorcontainer");
            else
                elem = document.documentElement;
            this.launchIntoFullscreen(elem);
        }
    }

    togglePrompter() {
        if (this.promptCanSubmitTeleprompter)
            this.submitTeleprompter();
        else
            this.restoreEditor();
    }

    togglePromptIt() {
        if (this.promptCanSubmitTeleprompter) {
            // Update button
            this.promptIt.textContent = "Close It...";
            this.promptCanSubmitTeleprompter = false;
            this.promptIt.onclick = function(event) {
                this.restoreEditor(event);
            }.bind(this);
            // Hide stuff
            if (this.instance[0]) {
                document.getElementById("content").style.display = "none";
                document.getElementById("editorcontainer").style.display = "none";
                document.getElementById("footer").style.display = "none";
                // Show prompter instance
                document.getElementById("framecontainer").style.display = "block";
                if (this.instance[1] && this.syncMethod === this.syncMethods.canvas) {
                    this.canvas.style.display = "block";
                    this.frame.style.display = "none";
                }
                else {
                    this.frame.style.display = "block";
                    this.canvas.style.display = "none";
                }
                this.launchIntoFullscreen(document.documentElement);
            } else if (this.instance[1]) {
                this.updateIt.classList.remove("hidden");
            }
        } else {
            // Update button
            this.promptIt.innerHTML = "Prompt It!";
            this.promptCanSubmitTeleprompter = true;
            this.promptIt.onclick = function(event) {
                this.submitTeleprompter(event);
            }.bind(this);
            // Restore editor
            if (this.instance[0]) {
                document.getElementById("content").style.display = "";
                document.getElementById("editorcontainer").style.display = "";
                document.getElementById("footer").style.display = "";
                // Hide prompter frame
                document.getElementById("framecontainer").style.display = "none";
                if (this.instance[1] && this.syncMethod === this.syncMethods.canvas)
                    this.canvas.style.display = "none";
                else
                    this.frame.style.display = "none";
                this.exitFullscreen();
            } else if (this.instance[1]) {
                this.updateIt.classList.add("hidden");
            }
        }
    }

    internalCredits() {
        // Set primary instance as active.
        this.instance[0] = true;
        this.instance[1] = false;

        // Toggle editor interface
        this.togglePromptIt();

        // Set data to send.
        var settings = '{ "data": {"secondary":0,"primary":1,"prompterStyle":2,"focusMode":3,"background":"#3CC","color":"#333","overlayBg":"#333","speed":"13","acceleration":"1.2","fontSize":"100","promptWidth":"84","timer":"false","voice":"false"}, "quickConfig": {}}',
            session = '{ "html":"' + encodeURIComponent(htmldata) + '" }';

        // Store data locally for prompter to use
        dataManager.setItem("IFTeleprompterSettings", settings, 1);
        dataManager.setItem("IFTeleprompterSession", session);

        // Update frame and focus on it.
        //this.frame.src = "teleprompter.html";
        this.frame.src = "teleprompter.html?debug=1";
        this.frame.focus();

    }

    credits() {
        // Get credits page.
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", "credits.html", true);
        xmlhttp.send();
        this.toggleFullscreen();
    }

    updatePrompterData(override) {
        // Get html from editor
    
        this.htmldata = teleprompter.editor.contentEditor.getEditorContent();

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
            speed = teleprompter.controls.slider[0].getValue();
        if (override!==undefined && override.acceleration!==undefined)
            acceleration = override.acceleration;
        else
            acceleration = teleprompter.controls.slider[1].getValue();
        if (override!==undefined && override.fontSize!==undefined)
            fontSize = override.fontSize;
        else
            fontSize = teleprompter.controls.slider[2].getValue();
        if (override!==undefined && override.promptWidth!==undefined)
            this.promptWidth = override.promptWidth;
        else
            this.promptWidth = teleprompter.controls.slider[3].getValue();
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
        var settings = '{ "quickConfig": '+JSON.stringify(teleprompter.controls.quickConfig)+', "commandsMapping": '+JSON.stringify(teleprompter.commandsMapping.mapping)+', "data": {"primary":'+primary+',"secondary":'+secondary+',"prompterStyle":'+style+',"focusMode":'+focusArea+',"speed":'+speed+',"acceleration":'+acceleration+',"fontSize":'+fontSize+',"promptWidth":'+this.promptWidth+',"timer":'+timer+',"voice":'+voice+'}}',
        session = '{ "html":"' + encodeURIComponent(this.htmldata) + '" }';

        // Store data locally for prompter to use
        dataManager.setItem("IFTeleprompterSettings", settings, 1);
        // If we use sessionStorage we wont be able to update the contents.
        dataManager.setItem("IFTeleprompterSession", session, 1);

        teleprompter.controls.updateQuickConfig(teleprompter.controls.quickConfig);
    }

    restoreEditor(event) {
        if (!this.promptCanSubmitTeleprompter) {
            if (debug) console.log("Restoring editor.");
            // Request to close prompters:
            // Close frame.
            if (this.frame.src.indexOf("teleprompter.html") != -1)
                this.frame.contentWindow.postMessage({
                    'request': teleprompter.commandsMapping.command.close
                }, this.getDomain());
            // Close window.
            if (this.prompterWindow)
                this.prompterWindow.postMessage({
                    'request': teleprompter.commandsMapping.command.close
                }, this.getDomain());
            if (this.syncMethod === this.syncMethods.canvas)
                this.ipcRenderer.send('asynchronous-message', 'closeInstance');
            // Clear contents from frame
            this.frame.src = "about:blank";
            // Stops the event but continues executing current function.
            if (event && event.preventDefault)
                event.preventDefault();
            this.togglePromptIt();
        }
    }

    // On "Prompt It!" clicked
    submitTeleprompter(event) {
        if (debug) console.log("Submitting to prompter");

        // Stops the event but continues executing the code.
        if (!(event===undefined||event.preventDefault===undefined))
            event.preventDefault();

        var secondaryDisplay = null;
        
        this.updatePrompterData();

        // Determine whether to load "Primary".
        this.instance[0] = (document.getElementById("primary").value > 0) ? true : false; 
        // Determine whether to load "Secondary".
        this.instance[1] = (document.getElementById("secondary").value > 0) ? true : false; 
        // Checks if is running on electron app...
        if (inElectron()) {
            // Check display availabillity.
            const displays = this.electronScreen.getAllDisplays()
            
            // of displays that are currently  available.
            var primaryDisplay = this.electronScreen.getPrimaryDisplay(),
            currentDisplay = 0, // 0 means primary and 1 means secondary
            cursorLocation = this.electronScreen.getCursorScreenPoint();
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
            if (this.instance[1]) {
                if (secondaryDisplay || this.forceSecondaryDisplay) {
                    // Open external prompter on a display where the editor is not located at.
                    if (currentDisplay===0) {
                        if (debug) console.log("Displaying external on secondary display.");
                        // Load external instance if in-frame prompter wont run.
                        if (this.instance[0] && this.syncMethod===this.syncMethods.canvas)
                            this.openCanvasPrompter();
                        // Otherwise run perfect sync painter.
                        else
                            this.prompterWindow = window.open("teleprompter.html" + (debug ? "?debug=1" : ""), 'TelePrompter Output', 'height=' + (secondaryDisplay.workArea.height-50) + ',width=' + (secondaryDisplay.workArea.width-50) + ',top='+ (secondaryDisplay.workArea.y+50) +',left=' + (secondaryDisplay.workArea.x+50) + ',fullscreen=0,status=0,location=0,menubar=0,toolbar=0' );
                    }
                    else if (currentDisplay>0) {
                        if (debug) console.log("Displaying external on primary display.");
                        // Load external instance if in-frame prompter wont run.
                        if (this.instance[0] && this.syncMethod===this.syncMethods.canvas)
                            this.openCanvasPrompter();
                        // Otherwise run perfect sync painter.
                        else
                            this.prompterWindow = window.open("teleprompter.html" + (debug ? "?debug=1" : ""), 'TelePrompter Output', 'height=' + (primaryDisplay.workArea.height-50) + ',width=' + (primaryDisplay.workArea.width-50) + ',top='+ (primaryDisplay.workArea.y+50) +',left=' + (primaryDisplay.workArea.x+50) + ',fullscreen=0,status=0,location=0,menubar=0,toolbar=0');
                    }
                }
                // If currentDisplay isn't the primaryDisplay or if there is no secondaryDisplay and the primary is unnocupied... Display on primaryDisplay.
                else if (!this.instance[0]) {
                    if (debug) console.log("Displaying external on primary display.");
                    this.prompterWindow = window.open("teleprompter.html" + (debug ? "?debug=1" : ""), 'TelePrompter Output', 'height=' + (primaryDisplay.workArea.height-50) + ',width=' + (primaryDisplay.workArea.width-50) + ',top='+ (primaryDisplay.workArea.y+50) +',left=' + (primaryDisplay.workArea.x+50) + ',fullscreen=0,status=0,location=0,menubar=0,toolbar=0');
                }
            }
            // Load InFrame prompter only if there's more than one screen or if the only screen available is free.
            if (this.instance[0] && (!this.instance[1] || secondaryDisplay))
                this.frame.src = "teleprompter.html" + (debug ? "?debug=1" : "");
        } else {
            if (this.instance[0])
                this.frame.src = "teleprompter.html" + (debug ? "?debug=1" : "");
            if (this.instance[1])
                this.prompterWindow = window.open("teleprompter.html" + (debug ? "?debug=1" : ""), 'TelePrompter Output', 'height=' + screen.availHeight + ',width=' + screen.width + ',top=0,left=' + screen.width + ',fullscreen=0,status=0,location=0,menubar=0,toolbar=0');
        }
        
        // If an external prompt is openned, focus on it.        
        if (this.prompterWindow!=undefined && window.focus)
            // Adviced to launch as separate event on a delay.
            this.prompterWindow.focus();
        else
            this.frame.focus();

        // In case of both instances active and not enough screens...
        if (!this.forceSecondaryDisplay && (inElectron() && !secondaryDisplay && this.instance[0] && this.instance[1])) {
            window.alert("You don't have any external Display.");
            this.instance[0] = false;
            this.instance[1] = false;
        }
        // In case that no instance is active...
        else if (!(this.instance[0] || this.instance[1]))
            window.alert("You must prompt at least to one display.");
        else
            this.togglePromptIt();
    }

    openCanvasPrompter() {
        // Opening experimental prompter...
        if (debug) console.log("Opening experimental prompter.");
        this.ipcRenderer.send('asynchronous-message', 'openInstance');
    }

    updateTeleprompter(event) {
        // Stops the event but continues executing the code.
        event.preventDefault();
        // Update data.
        this.updatePrompterData();
        if (debug) console.log("Updating prompter contents");
        // Request update on teleprompter other instance.
        this.listener({
            data: {
                request: teleprompter.commandsMapping.command.updateContents
            }
        });
    }

    toggleDebug() {
        if (inElectron())
            this.remote.getCurrentWindow().toggleDevTools();
        else
            this.toggleDebugMode();
    }

    toc() {
        this.tic != this.tic;
    }

    refresh() {
        location.reload();
    }

    clearAllRequest() {
        if (confirm("You've pressed F6. Do you wish to perform a factory reset of Teleprompter? You will loose all saved scripts and custom styles.") ) {
            dataManager.clearAll();
            window.removeEventListener("beforeunload", function() {
                this.updatePrompterData();
            }.bind(this));
            refresh();
        }
    }

    listener(event) {
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
        if (!event.domain || event.domain === this.getDomain()) {
            var message = event.data;
            // Special case. Restore editor message received.
            if (message.request === teleprompter.commandsMapping.command.restoreEditor)
                this.restoreEditor();
            else {
                if (this.syncMethod===this.syncMethods.canvas && this.instance[0] && this.instance[1] && inElectron() ) {
                    // IPC between main process directly.
                    this.ipcRenderer.send('asynchronous-message', message);
                }
                else {
                    // If this isn't a instant sync command, follow normal procedure.
                    if (!(message.request === teleprompter.commandsMapping.command.iSync || message.request === teleprompter.commandsMapping.command.sync)) {
                        // Tic toc mechanism symmetricaly distributes message request lag.
                        if (this.tic) {
                            // Redirect message to each prompter instance.
                            if (this.instance[1])
                                this.prompterWindow.postMessage(message, this.getDomain());
                            if (instance[0])
                                this.frame.contentWindow.postMessage(message, this.getDomain());
                        } else {
                            // Redirect message to each prompter instance.
                            if (this.instance[0])
                                this.frame.contentWindow.postMessage(message, this.getDomain());
                            if (this.instance[1])
                                this.prompterWindow.postMessage(message, this.getDomain());
                        }
                    }
                    // If requesting for sync, ensure both instances are open. Otherwise do nothing.
                    else if (this.instance[0] && this.instance[1]) {
                        // Tic toc mechanism symmetricaly distributes message request lag.
                        if (this.tic) {
                            // Redirect message to each prompter instance.
                            if (this.instance[1])
                                this.prompterWindow.postMessage(message, this.getDomain());
                            if (this.instance[0])
                                this.frame.contentWindow.postMessage(message, this.getDomain());
                        } else {
                            // Redirect message to each prompter instance.
                            if (this.instance[0])
                                this.frame.contentWindow.postMessage(message, this.getDomain());
                            if (this.instance[1])
                                this.prompterWindow.postMessage(message, this.getDomain());
                        }
                    }
                    // Update tic-toc bit.
                    setTimeout(this.toc, 10);
                }
            }
        }
    }

    commandsListener (event) {
        // Temporal Solution, until descomposition
        if (event.target.hasAttribute("data-key")) {
            return;
        }
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
            this.listener({
                data: {
                    request: teleprompter.commandsMapping.command.anchor,
                    data: key
                }
            });
        }
    }

    closeModal() {
        if (window.location.hash.slice(1) === "openCustomStyles")
            this.closePromptStyles();
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

        if (teleprompter.fileManager.modal) {
            teleprompter.fileManager.modal.hide()
            teleprompter.fileManager.modal = undefined;
        }
    }

    updateFont(value) {
        if (debug) console.log("Updating font.");
        document.getElementById("prompt").style.fontSize = "calc(5vw * "+(value/100)+")";
    }

    updateWidth(value) {
        if (debug) console.log("Updating width.");
        const prompt = document.getElementById("prompt");
        prompt.style.width = value+"vw";
        prompt.style.left = "calc("+(50-value/2)+"vw - 14px)";
    }

    loadLastUseSettings() {
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
                this.updateFont(lastSettings.data.fontSize);
                this.updateWidth(lastSettings.data.promptWidth);
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

    isFunction(possibleFunction) {
        return typeof(possibleFunction) === typeof(Function)
    }

    is_int(value) {
        if (parseFloat(value) == parseInt(value) && !isNaN(value))
            return true;
        else
            return false;
    }

    insertTextAtCursor(node) {
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

    // Global functions, to be accessed from Electron's main process.
    enterDebug() {
        debug = true;
        console.log("Entering debug mode.");
        function updateFont() {
            this.prompt.style.fontSize = fontSize+'em' ;
            this.overlayFocus.style.fontSize = fontSize+'em' ;
            this.onResize();
        }
    }
    exitDebug() {
        this.debug = false;
        console.log("Leaving debug mode.");
    }

    toggleDebugMode() {
        if (this.debug) 
            this.exitDebug();
        else
            this.enterDebug();
    }

}

teleprompter.editor = new Editor()

// Initialize objects after DOM is loaded
if (document.readyState === "interactive" || document.readyState === "complete")
    // Call init if the DOM (interactive) or document (complete) is ready.
    teleprompter.editor.init();              
else
    // Set init as a listener for the DOMContentLoaded event.
    document.addEventListener("DOMContentLoaded", function() {
        teleprompter.editor.init();
    }.bind(this));