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

(function() {
    // Use JavaScript Strict Mode.
    "use strict";

    // Import Electron libraries.
    if (inElectron())
        var {ipcRenderer} = require('electron');
        var elecScreen = require('electron').screen; // Returns the object returned by require(electron.screen) in the main process.
        var {shell} = require('electron');
    // Global objects
    var promptIt, prompterWindow, frame, currentScript;

    // Global variables
    var domain, tic, instance = [false, false],
        htmldata;

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
        "restoreEditor": 15
    });

    function init() {
        // Set globals
        debug = true;
        tic = false;

        // Set DOM javascript controls
        promptIt = document.getElementById("promptIt");
        promptIt.onclick = submitTeleprompter;
        document.getElementById("prompterStyle").setAttribute("onchange", "setStyleEvent(value);");
        document.getElementById("credits-link").onclick = credits;

        frame = document.getElementById("teleprompterframe");
        // Set default style and option style
        //setStyle(document.getElementById("prompterStyle").value);
        // Set initial configuration to prompter style
        styleInit(document.getElementById("prompterStyle"));
        // Set domain to current domain.
        setDomain();

        // If running inside Electron...
        if (inElectron()) {
            // Setup Electron.
            // When asynchronous reply from main process, run function to...
            ipcRenderer.on('asynchronous-reply', function(event, arg) {
                // Get the "exteral" classes and update each link to load on an actual browser.
                var classTags = document.getElementsByClassName('external');
                var idTags = document.getElementById('secondary');
                for (var i = 0; i < classTags.length; i++)
                    if (classTags[i].href != " ") {
                        classTags[i].setAttribute("onclick", "shell.openExternal('" + classTags[i].href + "'); return false;");
                        classTags[i].href = "#";
                        classTags[i].target = "_parent";
                    }
            });
            ipcRenderer.send('asynchronous-message', 'working');
        } // end if


        initScripts();
        //initImages();

    } // end init()

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
                    return false;
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
            //	{title: 'My image 1', value: 'http://www.tinymce.com/my1.gif'},
            //	{title: 'My image 2', value: 'http://www.moxiecode.com/my2.gif'}
            //],
            save_enablewhendirty: false,
            save_onsavecallback: save,
            nonbreaking_force_tab: true
        });
    }

    function save() {
        console.log("Save pressed");
    }

    function inElectron() {
        return navigator.userAgent.indexOf("Electron") != -1;
    }

    function setDomain() {
        // Get current domain from browser
        domain = document.domain;
        // If not running on a server, return catchall.
        if (domain.indexOf("http://") != 0 || domain.indexOf("https://") != 0)
            domain = "*";
    }

    function getDomain() {
        return domain;
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
            // Clear contents from frame
            frame.src = "about:blank";
            // Stops the event but continues executing current function.
            if (event && event.preventDefault)
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
            if (promptIt.onclick === submitTeleprompter)
                elem = document.getElementById("editorcontainer");
            else
                elem = document.documentElement;
            launchIntoFullscreen(elem);
        }
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
                // Show prompter frame
                document.getElementById("framecontainer").style.display = "block";
                launchIntoFullscreen(document.documentElement);
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
        var settings = '{ "data": {"secondary":' + document.getElementById("secondary").value + ',"primary":' + document.getElementById("primary").value + ',"prompterStyle":' + document.getElementById("prompterStyle").value + ',"background":"#3CC","color":"#333", "overlayBg":"#333","focusMode":' + document.getElementById("focus").value + '}}',
            session = '{ "html":"' + encodeURIComponent(htmldata) + '" }';

        // Store data locally for prompter to use
        dataManager.setItem("IFTeleprompterSettings", settings, 1);
        dataManager.setItem("IFTeleprompterSession", session);

        // Set and load "Primary"
        if (document.getElementById("primary").value > 0) {
            instance[0] = true;
            // Checks if is running on electron app...
            if (inElectron()) {
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
        } else {
            instance[0] = false;
        }

        // "Secondary"
        if (document.getElementById("secondary").value > 0) {
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
                if (externalDisplay && instance[1]) {
                    prompterWindow = window.open("teleprompter.html?debug=1", 'TelePrompter Output', 'height=' + externalDisplay.bounds.y + 50 + ', width=' + externalDisplay.bounds.x + 50 + ', top=0, left=' + elecScreen.width + ', fullscreen=1, status=0, location=0, menubar=0, toolbar=0');
                } else if (!externalDisplay && instance[0] === false) {
                    prompterWindow = window.open("teleprompter.html" + (debug ? "?debug=1" : ""), 'TelePrompter Output', 'height=' + screen.availHeight + ', width=' + screen.width + ', top=0, left=' + screen.width + ', fullscreen=1, status=0, location=0, menubar=0, toolbar=0');
                    if (window.focus)
                        prompterWindow.focus();
                }

            } else {
                prompterWindow = window.open("teleprompter.html" + (debug ? "?debug=1" : ""), 'TelePrompter Output', 'height=' + screen.availHeight + ', width=' + screen.width + ', top=0, left=' + screen.width + ', fullscreen=1, status=0, location=0, menubar=0, toolbar=0');
                if (window.focus)
                    prompterWindow.focus();
            }
        } else {
            instance[1] = false;
        }


        // In case of both
        // In case of none
        if (!(instance[0] || instance[1]))
            window.alert("You must prompt at least to one display.");
        else if (inElectron() && instance[0] && instance[1] && !externalDisplay) {
            window.alert("You dont have any external Display");
        } else
            togglePromptIt();
    }

    function toc() {
        tic != tic;
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

    document.onkeydown = function(event) {
        var key;
        // keyCode is announced to be deprecated but not all browsers support key as of 2016.
        if (event.key === undefined)
            event.key = event.keyCode;
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
                        request: command.decVelocity
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
                // EDITOR COMMANDS
            case 122:
            case "F11":
                event.preventDefault();
                toggleFullscreen();
                break;
            case 123:
            case "F12":
                debug = !debug;
                break;
            case 27: // ESC
            case "Escape":
                restoreEditor();
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
                // If key is not a string
                if (!isFunction(event.key.indexOf))
                    key = String.fromCharCode(event.key);
                else
                    key = event.key;
                //if ( key.indexOf("Key")===0 || key.indexOf("Digit")===0 )
                //		key = key.charAt(key.length-1);
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
    };

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
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, {
            type: contentType
        });
        return blob;
    }

    function initImages() {
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

                    console.log(img);
                }

                if (file) {
                    reader.readAsDataURL(file); //reads the data as a URL
                }

            };
            li.appendChild(input);
            imagesNode.appendChild(li);
        }
    }



    function initScripts() {

        var sidebar = new SIDEBAR();
        var sid = sidebar.on('scripts',{
                "name":"Scripts",
                "addElementName":"Add Script",
                "newElementName":"New Script",
                "dataKey":"IFTeleprompterSideBar",
                "preloadData":[{
                    "name": "Instructions",
                    "data": "\n\t<h3>Welcome to Teleprompter!</h3>\n\t<p>Are you ready to tell your story?</p>\n\t<br>\n\t<p>\"Teleprompter\" is a professional grade, multi-platform, free software teleprompter for anyone to use. Click on \"Prompt It!\" whenever you're ready and control the speed with the arrow keys.</p>\n\t<br>\n\t<h3>Here are some of our features:</h3>\n\t<ol>\n\t\t<li>Control the speed with the Arrow keys, WASD keys or the mouse wheel. You may pause at anytime with the 'spacebar'.</li>\n\t\t<li>Different focus areas allow you to easily use Teleprompter with a webcam, a tablet, or professional teleprompter equipment.</li>\n\t\t<li>Flip modes allow <em>mirroring</em> the prompter in every possible way.</li>\n\t\t<li>You can use one or two instances. Mirror one, monitor on the other one.</li>\n\t\t<li><a id=\"5\" name=\"5\">Set almost any key as an Anchor and instantly jump to any part of the script. Try pressing '5' now!</a></li>\n\t\t<li>The Rich Text Editor gives unlimited possibilities on what you can prompt.</li>\n\t\t<ul>\n\t\t\t<li>You can generate and display mathematical equations.<br>\n\t\t\t\t<table border=\"1\" cellpadding=\"1\" cellspacing=\"1\">\n\t\t\t\t\t<tbody>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td>&nbsp;</td>\n\t\t\t\t\t\t\t<td><img alt=\"\\bg_white \\huge \\sum_{\\Theta+\\Pi }^{80} sin(\\Theta)\" src=\"http://latex.codecogs.com/gif.latex?%5Cdpi%7B300%7D%20%5Cbg_white%20%5Chuge%20%5Csum_%7B%5CTheta&amp;plus;%5CPi%20%7D%5E%7B80%7D%20sin%28%5CTheta%29\"></td>\n\t\t\t\t\t\t\t<td>&nbsp;</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t</tbody>\n\t\t\t\t</table>\n\t\t\t</li>\n\t\t\t<li>Insert images from the web or copy and paste them into the prompter.\n\t\t\t\t<img alt=\"Picture: Arecibo Sky\" src=\"img/arecibo-sky.jpg\">\n\t\t\t</li>\n\t\t</ul>\n\t\t<li>There are various Prompter Styles to choose from. You may also create your own.</li>\n\t\t<li>Text can be pasted from other word processors like Microsoft Word® or Libre Office Writer™.</li>\n\t\t<li>Animations are hardware accelerated for a smooth result.</li>\n\t\t<li>Press 'F11' to enter and leave fullscreen.</li>\n\t\t<li>All data is managed locally. No data is stored on our servers.</li>\n\t\t<li>An offline version can be downloaded for Windows, OS X, Linux and Chrome OS.</li>\n\t\t<li>Enjoy the ease of a smart fullscreen in the local version.</li>\n\t\t<li>Close prompts and return to the editor by pressing 'ESC'.</li>\n\t</ol>\n\t<hr>\n\t<h4>How to use anchor shortcuts:</h4>\n\t<ol>\n\t\t<li>Select a keyword or line you want to jump to on your text in the editor.</li>\n\t\t<li>Click on the <strong>Flag Icon</strong> on the editor's tool bar.</li>\n\t\t<li>A box named \"Anchor Properties\" should have appeared. Type any single key of your choice and click 'Ok'.<br>Note preassigned keys, such as WASD and Spacebar will be ignored.</li>\n\t\t<li>Repeat as many times as you wish.</li>\n\t\t<li>When prompting, press on the shortcut key to jump into the desired location.</li>\n\t</ol>\n\t<p>###</p>\n\t\t\t\t"
                }],


            });
        sid.selectedElement = function(element){
            var scriptsData = sid.getElements();
            if(scriptsData[sid.currentElement].hasOwnProperty('data'))
                document.getElementById("prompt").innerHTML = scriptsData[sid.currentElement]['data'];
            else
                document.getElementById("prompt").innerHTML = "";
            document.querySelector("#wrapper").classList.toggle("toggled");
        }

        sid.setEvent('input','prompt',function(e){
            var scriptsData = sid.getElements();
            scriptsData[sid.currentElement]["data"] = document.getElementById("prompt").innerHTML;
            sid.getSaveMode().setItem(sid.getDataKey(), JSON.stringify(scriptsData));
        });

        CKEDITOR.on('instanceReady', function(evt) {
            var scriptsData = sid.getElements();
            if(scriptsData[sid.currentElement].hasOwnProperty('data'))
                document.getElementById("prompt").innerHTML = scriptsData[sid.currentElement]['data'];
            else
                document.getElementById("prompt").innerHTML = "";
        });

        var menuToggle = document.querySelector("#menu-toggle");
        menuToggle.onclick = function(e) {
            e.preventDefault();
            document.querySelector("#wrapper").classList.toggle("toggled");
        };
    }


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