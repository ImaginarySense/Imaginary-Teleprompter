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

var SIDEBAR = function() {
    this.instructionsLoaded = true;

    this.closeModal =  function() {
        window.location = "#close";
        document.getElementById("prompt").focus();
    }

    this.maxFileSize = function() {
        return Math.floor(255/2-5); // Return 122. Could be increased depending on the Filesystem and the charset encoding.
    }

    this.download = function( currentDocument, index ) {
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

    this.addScript = function( evt ) {
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
        this.getSaveMode().setItem(this.getDataKey(), JSON.stringify(elementsData));
        this.refreshElements();

        this.currentElement = elementsData.length-1;

        if (typeof this.addElementEnded === "function") {
            this.addElementEnded(elementsData[elementsData.length]);
        }
        this.closeModal();
        window.setTimeout(function() {
            var sideBar = document.querySelector("#wrapper");
            if (!sideBar.classList.contains("toggled"))
                sideBar.classList.toggle("toggled");
        }, 2000);
    };

    this.handleFileSelect = function(evt) {
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
        delete unsuportedFiles;
        if (!supportedFileFound)
            // Notify no files were imported.
            alert("Import failed. No supported file found.");
    }

    this.on = function(nameElement, config) {
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

    this.load = function() {
        this.currentElement = 0;
        this.refreshElements();
        this.loadDialog();
    };

    this.loadDialog = function(){
        //Close Dialog
        document.getElementById("cancelSidebarButton2").onclick = function(e){
            e.preventDefault();
            window.location = '#close';
        };
        document.getElementById("cancelSidebarButton").onclick = function(e){
            e.preventDefault();
            window.location = '#close';
        };
        //Script Add Input Event
        document.getElementById("inputName").oninput = function(e){
            document.getElementById("inputID").value = this.createIDTag(document.getElementById("inputName").value);
        }.bind(this);
    }

    this.getIDs = function(){
        var elementsData = this.getElements();
        var ids = [];
        for(var i = 0; i < elementsData.length; i++){
            ids.push(elementsData[i]["id"]);
        }
        return ids;
    }

    this.createIDTag = function(name, noCheck){
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

    this.instructionsAreLoaded = function() {
        return this.instructionsLoaded;
    }

    this.setEvent = function(event, element, method) {
        document.getElementById(element).addEventListener(event,function(e){
            method(e.target);
            this.refreshElements();
        }.bind(this));
    }

    this.setSaveMode = function(saveMode){
        if(saveMode === "sessionStorage")
            this.saveMode = sessionStorage;
        else
            this.saveMode = localStorage;
    };

    this.getSaveMode = function(){
        if (typeof this.saveMode !== 'undefined' && this.saveMode !== null)
            return this.saveMode;
        return localStorage;
    };

    this.setName = function(name) {
        this.name = name;
    };

    this.getName = function() {
        if (typeof this.name !== 'undefined' && this.name !== null)
            return this.name;
        return this.menu;
    };

    this.setAddElementName = function(name) {
        this.elementName = name;
    };

    this.getAddElementName = function() {
        if (typeof this.elementName !== 'undefined' && this.elementName !== null)
            return " Add " + this.elementName;
        return " Add " + this.getName();
    };

    this.getImportElementName = function() {
        if (typeof this.elementName !== 'undefined' && this.elementName !== null)
            return " Import " + this.elementName;
        return " Import " + this.getName();
    };

    this.setNewElementName = function(name) {
        this.newElementName = name;
    };

    this.getNewElementName = function(){
        if (typeof this.newElementName !== 'undefined' && this.newElementName !== null) {
            return this.newElementName;
        }
        return "New " + this.getName();
    };

    this.getElements = function() {
        var elementsData = this.getSaveMode().getItem(this.getDataKey());
        if (typeof elementsData !== 'undefined' && elementsData !== null) {
            if(JSON.parse(elementsData).length == 0){
                return this.getPreloadData();
            }
            return JSON.parse(elementsData);
        }
        return this.getPreloadData();
    };

    this.setDataKey = function(key) {
        this.dataKey = key;
    };

    this.getDataKey = function() {
        if (this.dataKey) {
            return this.dataKey;
        }
        return "SideBar" + this.menu;
    };

    this.setPreloadData = function(dataArray) {
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

    this.getPreloadData = function() {
        if (typeof this.preloadData !== 'undefined' && this.preloadData !== null) {
            return this.preloadData;
        }
        return [];
    };

    this.getCurrentElementIndex = function() {
        return this.currentElement;
    };
    this.refreshElements = function() {
        window.setTimeout(function() {
            this.clearElements();
        }.bind(this), 1);
        window.setTimeout(function() {
            this.addElements();
        }.bind(this), 2);
    };

    this.exitEditMode = function(){
        var menuNode = document.getElementById(this.menu).children;

        for (var j = 0; j < menuNode.length; j++) {
            menuNode[j].classList.remove("disabled");
            menuNode[j].children[0].classList.remove("editableMode");

            if(menuNode[j].children[0].querySelector("#editMode"))
                menuNode[j].children[0].querySelector("#editMode").style.display = "";
            
            if(menuNode[j].children[0].querySelector("#deleteMode"))
                menuNode[j].children[0].querySelector("#deleteMode").style.display = "none";
            
            if(menuNode[j].children[0].children[0])
                menuNode[j].children[0].children[0].setAttribute("contentEditable", false);
        }
    };

    this.clearElements = function() {
        var li = document.createElement("li");
        li.classList.add("sidebar-brand");

        var div = document.createElement("div");
        div.classList.add("col-xs-6");
        div.style.paddingLeft = '0px';
        div.innerHTML = this.getName();
        li.appendChild(div);

        div = document.createElement("div");
        div.classList.add("col-xs-6");

        //Close Sidebar Button
        var span = document.createElement("span");
        span.classList.add("glyphicon");
        span.classList.add("glyphicon-chevron-left");
        span.setAttribute("tabindex","0");
        span.onclick = function(e) {
            e.stopImmediatePropagation();
            this.exitEditMode();
            document.querySelector("#wrapper").classList.toggle("toggled");
        }.bind(this);

        div.appendChild(span);
        li.appendChild(div);
        var menu = document.getElementById(this.menu);
        menu.innerHTML = "";
        menu.appendChild(li);
    };

    this.deleteElement = function(id) {

        window.location = "#sidebarDeleteElement";
        document.getElementById("deleteSidebarButton").focus();
        document.getElementById("deleteSidebarButton").onclick = function(e) {
            var elementsData = this.getElements();
            
            elementsData.splice(this.getElementIndexByID(id), 1);

            //Set Current Element
            this.currentElement = elementsData.length-1;

            //Saving Elements
            this.getSaveMode().setItem(this.getDataKey(), JSON.stringify(elementsData)); 
            this.refreshElements();
            this.selectedElement(null);
            window.location = "#close";
        }.bind(this);
    };
    
    this.getElementIndexByID = function(id) {
        var elementsData = this.getElements();
        for (var i=0; i<elementsData.length; i++) {
            if(elementsData[i].id == id)
                return i;
        }
    };

    this.setInstructions = function() {
        if (this.currentElement === 0)
            this.instructionsLoaded = true;
        else
            this.instructionsLoaded = false;
    }

    this.addElements = function() {
        var elementsData = this.getElements();
        var menuNode = document.getElementById(this.menu);
        this.setInstructions();
        for (var i = 0; i < elementsData.length; i++) {
            var li = document.createElement("li");
            var div = document.createElement("div");
            li.id = elementsData[i].id;
        
            div.classList.add("list");

            var p = document.createElement("p");
            p.id = "textBlock";
            p.style.display = "inline";
            p.setAttribute("contentEditable", false);
            p.setAttribute("tabindex","0");

            p.appendChild(document.createTextNode(elementsData[i].name));
            div.appendChild(p);

            li.onclick = function(e) {
                e.stopImmediatePropagation();
                if (e.target.contentEditable == "false") {
                    this.currentElement = this.getElementIndexByID(e.target.parentNode.parentNode.id);
                    this.setInstructions();
                    elementsData = this.getElements();
                    if (typeof this.selectedElement === "function") {
                        this.selectedElement(elementsData[this.currentElement]);
                    }

                }
            }.bind(this);

            if(elementsData[i].editable){
                var span2 = document.createElement("span");
                span2.id = "deleteMode";
                span2.classList.add("glyphicon");
                span2.classList.add("glyphicon-minus");
                span2.setAttribute("tabindex","0");
                span2.onclick = function(e) {
                    e.stopImmediatePropagation();
                    this.deleteElement(e.target.parentNode.parentNode.id);
                    window.setTimeout(function() {
                        this.refreshElements();
                    }.bind(this), 1);
                }.bind(this);
                span2.style.display = "none";
                div.appendChild(span2);

                var span = document.createElement("span");
                span.id = "editMode";
                span.setAttribute("tabindex","0");
                span.classList.add("glyphicon");
                span.classList.add("glyphicon-pencil");
                span.onclick = function(e) {
                    e.stopImmediatePropagation();

                    this.exitEditMode();

                    e.target.style.display = "none";
                    e.target.parentNode.querySelector("#deleteMode").style.display = "";
                    e.target.parentNode.classList.add("editableMode");
                    e.target.parentNode.classList.remove("disabled");
                    var textBlock = e.target.parentNode.querySelector("#textBlock");
                    textBlock.setAttribute("contentEditable", true);
                    textBlock.focus();
                    if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
                        var range = document.createRange();
                        range.selectNodeContents(textBlock);
                        range.collapse(false);
                        var sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(range);
                    } else if (typeof document.body.createTextRange != "undefined") {
                        var textRange = document.body.createTextRange();
                        textRange.moveToElementText(textBlock);
                        textRange.collapse(false);
                        textRange.select();
                    }

                    textBlock.onkeydown = function(e) {
                        if (e.keyCode == 13) {
                            e.stopImmediatePropagation();

                            if (e.target.innerHTML.length>this.maxFileSize())
                                return false;

                            var text = e.target.innerHTML.replace("&nbsp;", '');
                            text = text.replace("<br>", '');
                            if (text.length > 0) {
                                e.target.innerHTML = text;

                                elementsData[this.getElementIndexByID(e.target.parentNode.parentNode.id)]['name'] = text;
                                this.getSaveMode().setItem(this.getDataKey(), JSON.stringify(elementsData));
                                this.exitEditMode();
                                return true;
                            } else {
                                return false;
                            }
                        } else if (e.keyCode == 8) {
                            if (e.target.innerHTML.length - 1 === 0) {
                                e.target.innerHTML = "&nbsp;";
                            }
                        }

                        return true;
                    }.bind(this);

                    return false;
                }.bind(this);
                div.appendChild(span);

                var downloadButton = document.createElement("span");
                downloadButton.id = "download";
                // span3.setAttribute("tabindex","3");
                downloadButton.classList.add("glyphicon");
                downloadButton.classList.add("glyphicon-download");
                downloadButton.onclick = function(e) {
                    e.stopImmediatePropagation();
                    this.currentElement = this.getElementIndexByID(e.target.parentNode.parentNode.id);
                    elementsData = this.getElements();
                    if (typeof this.selectedElement === "function") {
                        // Download document
                        this.download(elementsData[this.currentElement], this.currentElement);
                    }
                // Insert download code here...
                }.bind(this);
                div.appendChild(downloadButton);
            }
            li.appendChild(div);
            menuNode.appendChild(li);
        }

        // Import button
        var importLi = document.createElement("li");
        importLi.style.position = "relative";
        var input = document.createElement("input");
        input.id = "files";
        input.setAttribute("type","file");
        input.setAttribute("name","files[]");
        input.setAttribute("multiple", "");
        input.setAttribute("readonly", "");
        input.setAttribute("tabindex","0");
        input.classList.add("addOption");
        input.addEventListener('change', this.handleFileSelect.bind(this), false);
        input.style.position = "absolute";
        input.style.opacity = "0";
        // Emulate CSS mouse hover
        input.style.cursor = "pointer";
        input.addEventListener("mouseenter", function () {
            importLi.style.background = "rgba(255,255,255,0.2)";
            importDiv.style.color = "#FFFFFF";
        });
        input.addEventListener("mouseleave", function () {
            importLi.style.background = "initial";
            importDiv.style.color = "#999";
        });
        input.style.zIndex = "2";
        // Add real button
        importLi.appendChild(input);
        // Create fake styled import button.
        var importDiv = document.createElement("div");
        importDiv.classList.add("addOption");
        var span2 = document.createElement("span");
        span2.id = "addMode";
        span2.classList.add("glyphicon");
        span2.classList.add("glyphicon-folder-open");
        importDiv.appendChild(span2);
        importDiv.style.position = "relative";
        var p = document.createElement("p");
        p.id = "textBlock";
        p.style.display = "inline";
        p.setAttribute("contentEditable", false);
        p.appendChild(document.createTextNode(this.getImportElementName()));
        importDiv.appendChild(p);
        // Add fake button
        importLi.appendChild(importDiv);
        menuNode.appendChild(importLi);

        var li = document.createElement("li");
        var div = document.createElement("div");
        div.classList.add("addOption");
        div.setAttribute("tabindex","0");
        var span2 = document.createElement("span");
        span2.id = "addMode";
        span2.classList.add("glyphicon");
        span2.classList.add("glyphicon-plus");
        div.appendChild(span2);

        var p = document.createElement("p");
        p.id = "textBlock";
        p.style.display = "inline";
        p.setAttribute("contentEditable", false);
        p.appendChild(document.createTextNode(this.getAddElementName()));
        div.appendChild(p);

        li.onclick = function(e) {
            e.stopImmediatePropagation();
            window.location = '#sidebarAddElement';
            document.getElementById("inputName").focus();
        }.bind(this);
        
        document.getElementById("addScriptSidebarButton").onclick = this.addScript.bind(this);
        
        li.appendChild(div);
        menuNode.appendChild(li);
    };
};
