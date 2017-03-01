    
var SIDEBAR = function() {
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

            if (config.hasOwnProperty('newElementName'))
                this.setNewElementName(config['newElementName']);

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
        document.getElementById("cancelSidebarButton").onclick = function(e){
            window.location = '#close';
        };
        //Script Add Input Event
        document.getElementById("inputName").oninput = function(e){
            var t = document.getElementById("inputName").value;
            t = t.replace(/\s/g, '');
            document.getElementById("inputID").value = t.toLowerCase();
        }
    }

    this.setEvent = function(event, element, method){
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
        this.addElementName = name;
    };

    this.getAddElementName = function() {
        if (typeof this.addElementName !== 'undefined' && this.addElementName !== null)
            return " " + this.addElementName;
        return " Add " + this.getName();
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
            currentPreloadData["id"] = i;

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

    this.deleteElement = function(index) {

        window.location = "#sidebarDeleteElement";
        document.getElementById("deleteSidebarButton").onclick = function(e) {
            var elementsData = this.getElements();
            //Deleting Element
            for (var i = 0, l = elementsData.length; i < l; i++) {
                if(elementsData[i].id == index){
                    elementsData.splice(i, 1);
                    break;
                }
            }

            //Set Current Element
            this.currentElement = elementsData.length-1;

            //Saving Elements
            this.getSaveMode().setItem(this.getDataKey(), JSON.stringify(elementsData)); 
            this.selectedElement(null);
            window.location = "#close";
        }.bind(this);
    };
    
    this.getElementIndexByID = function(id) {
    	var elementsData = this.getElements();
    	for(var i = 0; i < elementsData.length; i++){
    		if(elementsData[i].id = id)
    			return i;
    	}
    }

    this.addElements = function() {
        var elementsData = this.getElements();
        var menuNode = document.getElementById(this.menu);

        for (var i = 0; i < elementsData.length; i++) {
            var li = document.createElement("li");
            var div = document.createElement("div");
            li.value = elementsData[i].id;

            div.classList.add("list");

            var p = document.createElement("p");
            p.id = "textBlock";
            p.style.display = "inline";
            p.setAttribute("contentEditable", false);

            p.appendChild(document.createTextNode(elementsData[i].name));
            div.appendChild(p);

            div.onclick = function(e) {
                e.stopImmediatePropagation();
                if (e.target.contentEditable == "false") {
                    this.currentElement = this.getElementIndexByID(e.target.parentNode.parentNode.value);
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
                span2.onclick = function(e) {
                    e.stopImmediatePropagation();
                    this.deleteElement(e.target.parentNode.parentNode.value);
                    window.setTimeout(function() {
                        this.refreshElements();
                    }.bind(this), 1);
                }.bind(this);
                span2.style.display = "none";
                div.appendChild(span2);


                var span = document.createElement("span");
                span.id = "editMode";
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

                            var text = e.target.innerHTML.replace("&nbsp;", '');
                            text = text.replace("<br>", '');
                            if (text.length > 0) {
                                e.target.innerHTML = text;

                                elementsData[e.target.parentNode.parentNode.value]['name'] = text;
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
            }
            li.appendChild(div);
            menuNode.appendChild(li);
        }

        var li = document.createElement("li");
        var div = document.createElement("div");
        div.classList.add("addOption");

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
            document.getElementById("addScriptSidebarButton").onclick = function(e){
                elementsData.push({
                    "id": document.getElementById("inputID").value,
                    "name": document.getElementById("inputName").value,
                    "data":"",
                    "editable":true
                });
                this.getSaveMode().setItem(this.getDataKey(), JSON.stringify(elementsData));
                this.refreshElements();

                this.currentElement = elementsData.length-1;

                if (typeof this.addElementEnded === "function") {
                    this.addElementEnded(elementsData[elementsData.length]);
                }
                window.location = "#close";
            }.bind(this);
        }.bind(this);

        li.appendChild(div);
        menuNode.appendChild(li);
    };
};