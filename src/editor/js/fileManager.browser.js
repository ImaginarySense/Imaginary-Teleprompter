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

class BrowserFileManager {
    constructor() {
        this.instructionsLoaded = true;
        this.modal = undefined;
        this.settingsModal = undefined;
    }

    draw() {
        //initialize SideBar
        this.on('v-pills-scriptsContent',{
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

        teleprompter.editor.contentEditor.save = async () => {
            if (this.currentElement != 0) {
                var scriptsData = this.getElements();
                scriptsData[this.currentElement]["data"] = document.getElementById("prompt").innerHTML;
                teleprompter.settings[this.getDataKey()] = JSON.stringify(scriptsData);
            }
        };

        this.addElementEnded = function(element) {
            if (debug) console.log(element);
            this.selectedElement();
        }.bind(this);

        this.setEvent('input','prompt',function() {
            teleprompter.editor.contentEditor.save();
        });

        var fileManagerToggle = document.querySelector("#fileManagerToggle");
        fileManagerToggle.onclick = function(event) {
            event.preventDefault();
            this.openModal();
            teleprompter.editor.contentEditor.save();
        }.bind(this);

        var fileManagerClose = document.querySelector("#fileManagerClose");
        fileManagerClose.onclick = function(event) {
            this.closeModal();
        }.bind(this);

        var settingsModalToggle = document.querySelector("#settingsToggle");
        settingsModalToggle.onclick = function(event) {
            event.preventDefault();
            this.settingsModal = new bootstrap.Modal(document.getElementById("settingsModal"), {
                keyboard: false,
                backdrop: 'static'
            });
            this.settingsModal.show();
        }.bind(this);;
        var settingsClose = document.querySelector("#settingsClose");
        settingsClose.onclick = function(event) {
            this.settingsModal.hide();
        }.bind(this);
        
    }

    closeModal() {
        if (this.modal) {
            this.modal.hide()
            this.modal = undefined;
        }
        document.getElementById("prompt").focus();
    }

    openModal() {
        this.modal = new bootstrap.Modal(document.getElementById("filesManagerModal"), {
            keyboard: false,
            backdrop: 'static'
        });
        this.modal.show();
    }

    maxFileSize() {
        return Math.floor(255/2-5); // Return 122. Could be increased depending on the Filesystem and the charset encoding.
    }

    download(currentDocument, index) {
        if (debug) {
            console.log("Downloading:");
            console.log(currentDocument);
        }
        var filename = currentDocument.name+"_"+index+".html",
            contents = currentDocument.data,
            element = document.createElement("a");
        element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(contents));
        element.setAttribute("download", filename);

        element.style.display = "none";
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    };

    selectedElement() {
        this.setCurrentElement();
        this.closeModal();
    };

    setCurrentElement() {
        var scriptsData = this.getElements();
        if (scriptsData[this.currentElement].hasOwnProperty('data'))
            document.getElementById("prompt").innerHTML = scriptsData[this.currentElement]['data'];
        else
            document.getElementById("prompt").innerHTML = "";

        document.getElementById('promptOptions').innerHTML = scriptsData[this.currentElement]['name'];
    }

    async addScript(evt) {
        if (evt.preventDefault!==undefined)
            evt.preventDefault();
        if (debug) console.log(evt);
        var elementsData = this.getElements(),
            inputName = document.getElementById("inputName"),
            inputID = document.getElementById("inputID");
        if (inputName.value.length===0) {
            window.alert("Every script needs a title.");
            inputName.focus();
            return;
        } else if ( inputName.value.length>this.maxFileSize() ) {
            window.alert("That filename is too long...");
            inputName.focus();
            return;
        }
        elementsData.push({
            "id": inputID.value,
            "name": inputName.value,
            "data": "",
            "editable": true
        });
        // Clean Input
        inputName.value = "";
        inputID.value = "";
        // Save
        teleprompter.settings[this.getDataKey()] = JSON.stringify(elementsData);
        this.refreshElements();

        var scripts = new bootstrap.Tab(document.getElementById("v-pills-scripts-tab"));
        scripts.show();

        this.currentElement = elementsData.length-1;

        if (typeof this.addElementEnded === "function") {
            this.addElementEnded(elementsData[elementsData.length]);
        }
        this.closeModal();
    };

    handleFileSelect(evt) {
        var files = evt.target.files, // FileList object
            supportedFileFound = false,
            unsuportedFiles = new Array();
        // files is a FileList of File objects. List some properties.
        if (debug) console.log("Importing files...");
        for (var i=0, f; f = files[i]; i++) {
            if (debug) console.log(i+1);
            if (f.type==="text/html" || f.type==="text/plain") {
                supportedFileFound = true;
                var filename = escape(f.name),
                    reader = new FileReader();
                if (debug) console.log( filename );
                var elementsData = this.getElements();

                if (f.type==="text/plain") {
                    // Closure to capture the file information.
                    reader.onload = ( function(theFile, sidebar) {
                        return function(evt) {
                            // Like with addScript, process files here...
                            var elementsData = sidebar.getElements(),
                                inputName = theFile.name,
                                inputID = sidebar.createIDTag(inputName),
                                maxLength = sidebar.maxFileSize();
                            // Slicing name at lastIndexOf '.htm' works most common HTML file extensions. 
                            inputName = inputName.slice( 0, inputName.lastIndexOf(".htm") );
                            inputName = inputName.slice( 0, inputName.lastIndexOf(".txt") );
                            inputName = inputName.slice( 0, inputName.lastIndexOf(".text") );
                            // Truncate file name.
                            if ( inputName.length>maxLength ) {
                                if (debug) console.log("Name will be truncated. Maximum allowed length: "+maxLength+" characters.");
                                alert("The following file's name is too long and will be truncated: "+inputName);
                                inputName = inputName.slice(0, maxLength);
                            }
                            // Text file parsing
                            var data = evt.target.result,
                                parsedData = "<p>";
                            for (var i=0; i<data.length; i++)
                                if (data[i] !== "\n")
                                    parsedData += data[i];
                                else
                                    parsedData += '</p>\n<p>';
                            parsedData += "</p>";
                            console.log(parsedData);
                            // Save data
                            elementsData.push({
                                "id": inputID,
                                "name": inputName,
                                "data": parsedData,
                                "editable": true
                            });
                            // Save
                            // sidebar.currentElement = elementsData.length-1;
                            sidebar.getSaveMode().setItem(sidebar.getDataKey(), JSON.stringify(elementsData));
                            sidebar.refreshElements();

                            var scripts = new bootstrap.Tab(document.getElementById("v-pills-scripts-tab"));
                            scripts.show();
                            // Load last imported file.
                            sidebar.currentElement = elementsData.length-1;
                            if (typeof sidebar.addElementEnded === "function") {
                                sidebar.addElementEnded(elementsData[elementsData.length]);
                            }
                        };
                    }) (f, this);
                }

                if (f.type==="text/html") {
                    // Closure to capture the file information.
                    reader.onload = ( function(theFile, sidebar) {
                        return function(evt) {
                            // Like with addScript, process files here...
                            var elementsData = sidebar.getElements(),
                                inputName = theFile.name,
                                inputID = sidebar.createIDTag(inputName),
                                maxLength = sidebar.maxFileSize();
                            // Slicing name at lastIndexOf '.htm' works most common HTML file extensions. 
                            inputName = inputName.slice( 0, inputName.lastIndexOf(".htm") );
                            inputName = inputName.slice( 0, inputName.lastIndexOf(".txt") );
                            inputName = inputName.slice( 0, inputName.lastIndexOf(".text") );
                            // Truncate file name.
                            if ( inputName.length>maxLength ) {
                                if (debug) console.log("Name will be truncated. Maximum allowed length: "+maxLength+" characters.");
                                alert("The following file's name is too long and will be truncated: "+inputName);
                                inputName = inputName.slice(0, maxLength);
                            }
                            // Save data
                            elementsData.push({
                                "id": inputID,
                                "name": inputName,
                                "data": evt.target.result,
                                "editable": true
                            });
                            // Save
                            // sidebar.currentElement = elementsData.length-1;
                            sidebar.getSaveMode().setItem(sidebar.getDataKey(), JSON.stringify(elementsData));
                            sidebar.refreshElements();
                            // Load last imported file.
                            sidebar.currentElement = elementsData.length-1;
                            if (typeof sidebar.addElementEnded === "function") {
                                sidebar.addElementEnded(elementsData[elementsData.length]);
                            }
                        };
                    }) (f, this);
                }
                // Begin reading the file's contents.
                reader.readAsText(f);
            // Alpha import of rtf files
            } else if (f.name.endsWith(".rtf")) {
                supportedFileFound = true;
                var reader = new FileReader();
                reader.onload = ( function(theFile, sidebar) {
                    return function(evt) {
                        // Like with addScript, process files here...
                        var elementsData = sidebar.getElements(),
                            inputName = theFile.name,
                            inputID = sidebar.createIDTag(inputName),
                            maxLength = sidebar.maxFileSize();
                        // Slicing name at lastIndexOf '.htm' works most common HTML file extensions. 
                        inputName = inputName.slice( 0, inputName.lastIndexOf(".rtf") );
                        // Truncate file name.
                        if ( inputName.length>maxLength ) {
                            if (debug) console.log("Name will be truncated. Maximum allowed length: "+maxLength+" characters.");
                            alert("The following file's name is too long and will be truncated: "+inputName);
                            inputName = inputName.slice(0, maxLength);
                        }

                        // Text file parsing
                        var data = evt.target.result,
                            parsedData = "<p>";
                        
                        // Converting rtf data to plain text
                        data = data.replace(/\\pict([^]+?)\\par/g, "");
                        data = data.replace(/\\par[d]?/g, "");
                        data = data.replace(/\{\*?\\[^{}]+}|[{}]|\\\n?[A-Za-z]+\n?(?:-?\d+)?[ ]?/g, "")
                        data = data.replace(/\\'[0-9a-zA-Z]{2}/g, "").trim();
                        
                        for (var i=0; i<data.length; i++)
                            if (data[i] !== "\n")
                                parsedData += data[i];
                            else
                                parsedData += '</p>\n<p>';
                        parsedData += "</p>";
                        // Save data
                        elementsData.push({
                            "id": inputID,
                            "name": inputName,
                            "data": parsedData,
                            "editable": true
                        });
                        // Save
                        // sidebar.currentElement = elementsData.length-1;
                        sidebar.getSaveMode().setItem(sidebar.getDataKey(), JSON.stringify(elementsData));
                        sidebar.refreshElements();
                        // Load last imported file.
                        sidebar.currentElement = elementsData.length-1;
                        if (typeof sidebar.addElementEnded === "function") {
                            sidebar.addElementEnded(elementsData[elementsData.length]);
                        }
                    };
                }) (f, this);
                reader.readAsText(f);
            }

            // Add unsuported file to unsuported file list.
            else
                unsuportedFiles.push(escape(f.name));
        }
        // List unsuported files
        var length = unsuportedFiles.length-1;
        if (length!==-1) {
            var unsuportedAlert = "The following files could not be imported: ";
            for (var i=0; i<length; i++)
                unsuportedAlert += unsuportedFiles[i] + ", ";
            unsuportedAlert += unsuportedFiles[length] + ".";
            // Notify if no supported files where found.
            alert(unsuportedAlert);
        }
        unsuportedFiles = null;
        if (!supportedFileFound)
            // Notify no files were imported.
            alert("Import failed. No supported file found.");
    }

    on(nameElement, config) {
        this.menu = nameElement;
        if (typeof config !== 'undefined' && config !== null) {
            if (config.hasOwnProperty('name'))
                this.setName(config['name']);

            if (config.hasOwnProperty('dataKey'))
                this.setDataKey(config['dataKey']);

            if (config.hasOwnProperty('saveMode'))
                this.setSaveMode(config['saveMode']);

            if (config.hasOwnProperty('addElementName'))
                this.setAddElementName(config['addElementName']);

            if (config.hasOwnProperty('elementName'))
                this.setNewElementName(config['elementName']);

            if (config.hasOwnProperty('preloadData') && config['preloadData'].constructor === Array)
                this.setPreloadData(config['preloadData']);
        }
        this.load();
        return this;
    };

    load() {
        this.currentElement = 0;
        this.refreshElements();
        this.loadDialog();
    };

    loadDialog(){
        var menuContent = document.getElementById("v-pills-menuContent");

        var input = document.createElement("input");
        input.id = "files";
        input.setAttribute("type","file");
        input.setAttribute("name","files[]");
        input.setAttribute("multiple", "");
        input.setAttribute("readonly", "");
        input.setAttribute("tabindex","0");

        input.addEventListener('change', this.handleFileSelect.bind(this), false);
        input.style.display = "none";

        menuContent.appendChild(input);

        document.getElementById("v-pills-import-tab").onclick = function(e) {
            input.click();
        }.bind(this);
        //Script Add Input Event
        document.getElementById("inputName").oninput = function(e){
            document.getElementById("inputID").value = this.createIDTag(document.getElementById("inputName").value);
        }.bind(this);
    }

    getIDs(){
        var elementsData = this.getElements();
        var ids = [];
        for(var i = 0; i < elementsData.length; i++){
            ids.push(elementsData[i]["id"]);
        }
        return ids;
    }

    createIDTag(name, noCheck){
        name = name.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        var id = 'id' + name.replace(/\s/g, '');
        if(typeof noCheck == 'undefined' || noCheck == false){
            var ids = this.getIDs();
            if(ids.indexOf(id) != -1){
                var base = id.replace(/-\d+$/,"");
                var cnt = ids[base] || 1;
                do{
                    id = base + "-" + cnt++;
                }while(ids.indexOf(id) != -1);
            }
        }
        return id;
    }

    instructionsAreLoaded() {
        return this.instructionsLoaded;
    }

    setEvent(event, element, method) {
        document.getElementById(element).addEventListener(event,function(e){
            method(e.target);
            this.refreshElements();
        }.bind(this));
    }

    setName(name) {
        this.name = name;
    };

    getName() {
        if (typeof this.name !== 'undefined' && this.name !== null)
            return this.name;
        return this.menu;
    };

    setAddElementName(name) {
        this.elementName = name;
    };

    getAddElementName() {
        if (typeof this.elementName !== 'undefined' && this.elementName !== null)
            return " Add " + this.elementName;
        return " Add " + this.getName();
    };

    getImportElementName() {
        if (typeof this.elementName !== 'undefined' && this.elementName !== null)
            return " Import " + this.elementName;
        return " Import " + this.getName();
    };

    setNewElementName(name) {
        this.newElementName = name;
    };

    getNewElementName(){
        if (typeof this.newElementName !== 'undefined' && this.newElementName !== null) {
            return this.newElementName;
        }
        return "New " + this.getName();
    };

    async getElements() {
        var elementsData = await teleprompter.settings[this.getDataKey()];
        if (typeof elementsData !== 'undefined' && elementsData !== null) {
            if(JSON.parse(elementsData).length == 0){
                return this.getPreloadData();
            }
            return JSON.parse(elementsData);
        }
        return this.getPreloadData();
    };

    setDataKey(key) {
        this.dataKey = key;
    };

    getDataKey() {
        if (this.dataKey) {
            return this.dataKey;
        }
        return "SideBar" + this.menu;
    };

    setPreloadData(dataArray) {
        this.preloadData = [];
        var currentPreloadData = {};
        for(var i = 0; i < dataArray.length; i++){

            if(dataArray[i].hasOwnProperty("id")){
                currentPreloadData["id"] = dataArray[i].id;
                if(dataArray[i].hasOwnProperty("name"))
                    currentPreloadData["name"] = dataArray[i].name;
                else
                    currentPreloadData["name"] = "";

                if(dataArray[i].hasOwnProperty("data"))
                    currentPreloadData["data"] = dataArray[i].data;
                else
                    currentPreloadData["data"] = "";

                if(dataArray[i].hasOwnProperty("editable"))
                    currentPreloadData["editable"] = dataArray[i].editable;
                else
                    currentPreloadData["editable"] = true;

                this.preloadData.push(currentPreloadData);
            }else{
                if(dataArray[i].hasOwnProperty("name")){
                    currentPreloadData["id"] = this.createIDTag(dataArray[i].name);
                    currentPreloadData["name"] = dataArray[i].name;

                    if(dataArray[i].hasOwnProperty("data"))
                        currentPreloadData["data"] = dataArray[i].data;
                    else
                        currentPreloadData["data"] = "";

                    if(dataArray[i].hasOwnProperty("editable"))
                        currentPreloadData["editable"] = dataArray[i].editable;
                    else
                        currentPreloadData["editable"] = true;

                    this.preloadData.push(currentPreloadData);
                }

            }
            
        }
    };

    getPreloadData() {
        if (typeof this.preloadData !== 'undefined' && this.preloadData !== null) {
            return this.preloadData;
        }
        return [];
    };

    getCurrentElementIndex() {
        return this.currentElement;
    };

    refreshElements() {
        window.setTimeout(function() {
            this.clearElements();
        }.bind(this), 1);
        window.setTimeout(function() {
            this.addElements();
        }.bind(this), 2);
    };

    exitEditMode(){};

    clearElements() {
        document.getElementById(this.menu).innerHTML = "";
    };

    deleteElement(id) {
        this.closeModal();

        this.fileManagerDeleteModal = new bootstrap.Modal(document.getElementById("fileManagerDeleteModal"), {
            keyboard: false,
            backdrop: 'static'
        });
        this.fileManagerDeleteModal.show();

        document.getElementById("fileManagerDeleteModalCancel").onclick = function(e) {
            this.fileManagerDeleteModal.hide();
            this.openModal();
        }.bind(this);

        document.getElementById("fileManagerDeleteModalDelete").onclick = (e) => {
            var elementsData = this.getElements();
            
            elementsData.splice(this.getElementIndexByID(id), 1);

            //Set Current Element
            this.currentElement = elementsData.length-1;

            //Saving Elements
            teleprompter.settings[this.getDataKey()] = JSON.stringify(elementsData); 
            this.refreshElements();
            this.selectedElement();
            
            this.fileManagerDeleteModal.hide();
            this.openModal();
        };
    };
    
    getElementIndexByID(id) {
        var elementsData = this.getElements();
        for (var i=0; i<elementsData.length; i++) {
            if(elementsData[i].id == id)
                return i;
        }
    };

    setInstructions() {
        if (this.currentElement === 0)
            this.instructionsLoaded = true;
        else
            this.instructionsLoaded = false;
    }

    addElements() {
        var elementsData = this.getElements();
        var menuNode = document.getElementById(this.menu);
        this.setInstructions();
        for (var i = 0; i < elementsData.length; i++) {
            var tr = document.createElement("tr");
            tr.id = elementsData[i].id;

            // Title
            var th = document.createElement("th");
            th.onclick = function(e) {
                e.stopImmediatePropagation();
                var pass = false, topElement, textBlock, id = undefined;
                if (e.target.id === "textBlock") {
                    topElement = e.target.parentNode.parentNode.parentNode.parentNode;
                    textBlock = e.target;
                } else if (e.target.nodeName === "I") {
                    topElement = e.target.parentNode.parentNode.parentNode.parentNode;
                    textBlock = topElement.querySelector("#textBlock");
                } else if (e.target.nodeName === "DIV") {
                    topElement = e.target.parentNode.parentNode;
                    textBlock = topElement.querySelector("#textBlock");
                }

                if (topElement) {
                    id = topElement.id;
                    pass = textBlock.disabled;
                }
                
                if (pass) {
                    this.currentElement = this.getElementIndexByID(id);
                    this.setInstructions();
                    elementsData = this.getElements();
                    if (typeof this.selectedElement === "function") {
                        this.selectedElement();
                    }
                }
            }.bind(this);

            var row = document.createElement("div");
            row.classList = "row align-items-center";

            var div = document.createElement("div");
            div.classList = "col-auto";
            var icon = document.createElement("i");
            icon.classList = "bi bi-file-earmark-easel-fill";
            div.appendChild(icon);
            row.appendChild(div)

            div = document.createElement("div");
            div.classList = "col-auto";
            var input = document.createElement("input");
            input.id = "textBlock";
            input.classList = "form-control"

            input.value = elementsData[i].name;
            input.disabled = true;

            div.appendChild(input);
            row.appendChild(div);
            th.appendChild(row);
            tr.appendChild(th);

            if (i !== 0) {
                // Add Tools
                th = document.createElement("th");

                row = document.createElement("div");
                row.classList = "row align-items-center";

                div = document.createElement("div");
                div.classList = "col-auto";
                div.style = "padding: .375rem .75rem;";

                var span = document.createElement("span");
                span.id = "editMode";
                span.setAttribute("tabindex", "0");

                icon = document.createElement("i");
                icon.classList = "bi bi-pencil";
                span.appendChild(icon);

                span.onclick = function(e) {
                    e.stopImmediatePropagation();

                    this.exitEditMode();

                    e.target.parentNode.style.display = "none";
                    e.target.parentNode.parentNode.querySelector("#deleteMode").style.display = "";
                    var textBlock = e.target.parentNode.parentNode.parentNode.parentNode.parentNode.querySelector("#textBlock");
                    textBlock.disabled = false;

                    textBlock.onkeydown = async (e) => {
                        if (e.keyCode == 13) {
                            e.stopImmediatePropagation();
                            
                            if (e.target.value.length>this.maxFileSize())
                                return false;

                            var text = e.target.value.replace("&nbsp;", '');
                            text = text.replace("<br>", '');
                            if (text.length > 0) {
                                e.target.value = text;

                                elementsData[this.getElementIndexByID(e.target.parentNode.parentNode.parentNode.parentNode.id)]['name'] = text;
                                teleprompter.settings[this.getDataKey()] = JSON.stringify(elementsData);
                                e.target.parentNode.parentNode.parentNode.parentNode.querySelector("#editMode").style.display = "";
                                e.target.parentNode.parentNode.parentNode.parentNode.querySelector("#deleteMode").style.display = "none";
                                e.target.disabled = true;

                                return true;
                            } else {
                                return false;
                            }
                        } else if (e.keyCode == 8) {
                            if (e.target.value.length - 1 === 0) {
                                e.target.value = "&nbsp;";
                            }
                        }

                        return true;
                    };

                    return false;
                }.bind(this);

                div.appendChild(span);

                span = document.createElement("span");
                span.id = "deleteMode";
                span.setAttribute("tabindex", "0");

                icon = document.createElement("i");
                icon.classList = "bi bi-file-earmark-minus";
                span.appendChild(icon);

                span.onclick = function(e) {
                    e.stopImmediatePropagation();
                    this.deleteElement(e.target.parentNode.parentNode.parentNode.parentNode.parentNode.id);
                    window.setTimeout(function() {
                        this.refreshElements();
                    }.bind(this), 1);
                }.bind(this);
                span.style.display = "none";

                div.appendChild(span);

                span = document.createElement("span");
                span.id = "download";
                span.setAttribute("tabindex", "0");

                icon = document.createElement("i");
                icon.classList = "bi bi-cloud-download";
                span.appendChild(icon);

                span.onclick = function(e) {
                    e.stopImmediatePropagation();
                    this.currentElement = this.getElementIndexByID(e.target.parentNode.parentNode.parentNode.parentNode.parentNode.id);
                    elementsData = this.getElements();
                    if (typeof this.selectedElement === "function") {
                        // Download document
                        this.download(elementsData[this.currentElement], this.currentElement);
                    }
                }.bind(this);

                div.appendChild(span);

                row.appendChild(div);
                th.appendChild(row);

                tr.appendChild(th);
            } else {
                th = document.createElement("th");
                tr.appendChild(th);
            }
            
            menuNode.appendChild(tr);
        }
        document.getElementById("addScriptSidebarButton").onclick = this.addScript.bind(this);
    };
};
