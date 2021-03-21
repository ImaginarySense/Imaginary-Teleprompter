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

class Themes {
    constructor() {
        // Create style element.
        this.themeSheet = document.createElement('style');
        this.themeSheet.type = 'text/css';
        // WebKit hack
        this.themeSheet.appendChild(document.createTextNode(""));
        // Append style element to head.
        document.getElementsByTagName('head')[0].appendChild(this.themeSheet);
    }

    styleInit(prompterStyleElement) {
        dataManager.getItem('IFTeleprompterThemeStyles', function(data){
            this.themeStyles = JSON.parse(data);
        }.bind(this), 0, false);
    
        if (!this.themeStyles) {
            this.themeStyles = [
                {
                    id: 0,
                    name: "Azure Light",
                    type: 0,
                    className: "azureLight",
                    bgOverlay: "azureLightO",
                    cssText: ".azureLight {color: #229FFF; background: #000000;}.azureLightO {background: #202020;}"
                },
                {
                    id: 1,
                    name: "Blackboard",
                    type: 0,
                    className: "darkBody",
                    bgOverlay: "darkOverlay",
                    cssText: ".darkBody {background: #272822;color:#FFF;}.darkOverlay {background: #000;}"
                },
                {
                    id: 2,
                    name: "Classic Yellow",
                    type: 0,
                    className: "yellowBody",
                    bgOverlay: "darkOverlay",
                    cssText: ".yellowBody {color: #FF0;background: #000;}.darkOverlay {background: #000;}"
                },
                {
                    id: 3,
                    name: "Dark Matter",
                    type: 0,
                    className: "darkMatter",
                    bgOverlay: "darkMatterO",
                    cssText: ".darkMatter {color: #FFFFFF; background: #222222;}.darkMatterO {background: #000000;}"
                },
                // {
                //     id: 4,
                //     name: "Intergalactic",
                //     type: 0,
                //     className: "theForce",
                //     bgOverlay: "darkOverlay",
                //     cssText: ".theForce {color: #FD1;background: #000;transform-origin: 50% 50%; transform: perspective(100px) rotateX(90deg) translate3d(0px,0px,-100vh);}.darkOverlay {background: #000;}"
                // },
                {
                    id: 4,
                    name: "Whiteboard",
                    type: 0,
                    className: "lightBody",
                    bgOverlay: "lightOverlay",
                    cssText: ".lightBody {background: #FFF;color: #272822;}.lightOverlay {background: #CCC;}"
                }
            ];
        }
        if (!this.themeSheet) {
            this.themeSheet = document.createElement('style');
            this.themeSheet.type = 'text/css';
            // WebKit hack
            this.themeSheet.appendChild(document.createTextNode(""));
            // Append style element to head.
            document.getElementsByTagName('head')[0].appendChild(this.themeSheet);
            // Grab element's style sheet.
            this.themeSheet = themeStyle;
        }
        
        this.defaultStyle = 1;
        dataManager.getItem('IFTeleprompterThemeDefaultStyle',function(data){
            if(JSON.parse(data) != undefined) {
                this.defaultStyle = JSON.parse(data);
            }
        }.bind(this), 0, false);
    
        ///Maybe will need a fix in the future...
        this.setStyle(this.defaultStyle);
    
        if (prompterStyleElement) {
            this.refreshPromptStyles(prompterStyleElement);
            prompterStyleElement.value = this.getIndexOfStyleByID(this.defaultStyle);
        }
    }

    setColorPicker() {
        document.getElementById('bodyColor').onchange = function(event) {
            this.updateColorOnPreview(event.target);
        }.bind(this);

        document.getElementById('overlayColor').onchange = function(event) {
            this.updateColorOnPreview(event.target);
        }.bind(this);

        document.getElementById('textColor').onchange = function(event) {
            this.updateColorOnPreview(event.target);
        }.bind(this);
    }

    setDefaultStyle() {
        this.defaultStyle = this.themeStyles[this.lastStyleSelected]["id"];
        dataManager.setItem("IFTeleprompterThemeDefaultStyle", this.defaultStyle);
        this.refreshAdminPromptStyles();
        this.refreshCurrentItem();
        this.saveStyles();
    }

    editPromptStyle() {
        this.editThemeStyle(
            document.getElementById("nameStyle").value,
            document.getElementById("nameStyle").value.replace(/\s/gi, ""),
            document.getElementById('overlayTop').style.backgroundColor,
            document.getElementById('overlayPreview').style.backgroundColor,
            document.getElementById('overlayPreview').style.color
        );
    }

    createStandardCSSClass(objName, bodyColor, textColor, overlayColor) {
        return '.' + objName + "Body" + ' {background: ' + bodyColor + ';color: ' + textColor + ';}.' + objName + "Overlay" + ' {background: ' + overlayColor + ';}';
    }

    editThemeStyle(name2, objName, bodyColor, overlayColor, textColor) {
        var cssText = this.createStandardCSSClass(objName, bodyColor, textColor, overlayColor);
        this.themeStyles[this.lastStyleSelected] = {
            id: this.lastStyleSelected,
            name: name2,
            type: 1,
            className: objName + "Body",
            bgOverlay: objName + "Overlay",
            cssText: cssText
        };
        this.saveStyles();
    }

    removeStyleFromPromptStyles() {
        if (this.defaultStyle == this.themeStyles[this.lastStyleSelected]["id"])
            this.defaultStyle = 1;
        
        this.themeStyles.splice(this.lastStyleSelected, 1);
    
        if (this.lastStyleSelected > this.themeStyles.length - 1) {
            this.lastStyleSelected = this.themeStyles.length - 1;
        }
    
        this.refreshAdminPromptStyles();
        this.refreshCurrentItem();
        this.saveStyles();
    }

    addStyleToPromptStyles() {
        this.addThemeStyle(
            document.getElementById("nameStyle").value,
            document.getElementById("nameStyle").value.replace(/\s/gi, ""),
            document.getElementById('overlayTop').style.backgroundColor,
            document.getElementById('overlayPreview').style.backgroundColor,
            document.getElementById('overlayPreview').style.color
        );
        this.lastStyleSelected = this.themeStyles.length - 1;
        this.refreshAdminPromptStyles();
        this.refreshCurrentItem();
    }

    addThemeStyle(name2, objName, bodyColor, overlayColor, textColor) {
        var cssText = this.createStandardCSSClass(objName, bodyColor, textColor, overlayColor);
        this.themeStyles.push({
            id: this.themeStyles.length,
            name: name2,
            type: 1,
            className: objName + "Body",
            bgOverlay: objName + "Overlay",
            cssText: cssText
        });
        this.saveStyles();
    }

    saveStyles() {
        dataManager.setItem("IFTeleprompterThemeStyles", JSON.stringify(this.themeStyles));
        this.refreshPromptStyles(document.getElementById("prompterStyle"));
    }
    
    refreshPromptStyles(promptStyleElement) {
        promptStyleElement.options.length = 0;
    
        for (var i = 0; i < this.themeStyles.length; i++) {
            var opt = document.createElement('option');
            opt.value = i;
            opt.innerHTML = this.themeStyles[i]["name"];
            promptStyleElement.appendChild(opt);
            if (this.themeStyles[i]["id"] == this.defaultStyle) {
                opt.selected = true;
            }
        }

        this.setStyle(this.defaultStyle);
    }

    // Set Teleprompter Style.
    setStyle(promptStyleOption) {
        // Get page elements.
        var container = document.querySelector("#promptcontainer"),
            overlayBgs = document.getElementsByClassName("overlayBg"),
            overlayBgSetting;

        promptStyleOption = +promptStyleOption;

        if (promptStyleOption == this.themeStyles.length || window.location.hash == '#openCustomStyles') {
            this.openPromptStyles();
        } else {
            if (this.themeStyles[promptStyleOption].hasOwnProperty("cssText")) {
                this.themeSheet.appendChild(document.createTextNode(this.themeStyles[promptStyleOption]['cssText']));
            }

            for (var i = 0; i < this.themeStyles.length; i++) {
                if (container.classList.contains(this.themeStyles[i]['className']))
                    container.classList.remove(this.themeStyles[i]['className']);
            }


            container.classList.add(this.themeStyles[promptStyleOption]['className']);
            overlayBgSetting = this.themeStyles[promptStyleOption]['bgOverlay'];

            // If page contains overlay, set overlay backgrounds.
            if (overlayBgs)
                for (var i = 0; i < overlayBgs.length; i++) {
                    // Remove any of the previous classes, if any.
                    for (var j = 0; j < this.themeStyles.length; j++) {
                        if (overlayBgs[i].classList.contains(this.themeStyles[j]['bgOverlay']))
                            overlayBgs[i].classList.remove(this.themeStyles[j]['bgOverlay']);
                    }
                    overlayBgs[i].classList.add(overlayBgSetting);
                }
        }

    }

    updateColorOnPreview(obj) {
        if (obj.id == 'bodyColor') {
            document.getElementById('overlayTop').style.backgroundColor = obj.jscolor.toHEXString();
            document.getElementById('overlayBottom').style.backgroundColor = obj.jscolor.toHEXString();
            document.getElementById('overlayFocus').style.backgroundColor = obj.jscolor.toHEXString();
        } else if (obj.id == 'overlayColor') {
            document.getElementById('overlayPreview').style.backgroundColor = obj.jscolor.toHEXString();
        } else if (obj.id == 'textColor') {
            document.getElementById('overlayPreview').style.color = obj.jscolor.toHEXString();
        }
    }

    refreshCurrentItem() {
        var obj = this.themeStyles[this.lastStyleSelected];
        var objCSSElement;
        if (this.themeStyles[this.lastStyleSelected].hasOwnProperty("cssText"))
            objCSSElement = this.createCSSStyleElementFromString(obj['cssText']);
        var objBody = this.getStyle("." + obj['className'], objCSSElement);
        var objOverlay = this.getStyle("." + obj['bgOverlay'], objCSSElement);
    
        //BodyColor
        document.getElementById('bodyColor').jscolor.fromString(hexc(objBody.style.background));
        document.getElementById('overlayTop').style.backgroundColor = '#' + hexc(objBody.style.background);
        document.getElementById('overlayBottom').style.backgroundColor = '#' + hexc(objBody.style.background);
        document.getElementById('overlayFocus').style.backgroundColor = '#' + hexc(objBody.style.background);
        //OverlayColor
        document.getElementById('overlayColor').jscolor.fromString(hexc(objOverlay.style.background));
        document.getElementById('overlayPreview').style.backgroundColor = '#' + hexc(objOverlay.style.background);
        //TextColor
        document.getElementById('textColor').jscolor.fromString(hexc(objBody.style.color));
        document.getElementById('overlayPreview').style.color = '#' + hexc(objBody.style.color);
    
        document.getElementById('nameStyle').value = obj['name'];
    
        document.getElementById('addStyleButton').disabled = true;
        if (obj['type'] == 0) {
            document.getElementById('editStyleButton').disabled = true;
            document.getElementById('removeStyleButton').disabled = true;
        } else {
            document.getElementById('editStyleButton').disabled = false;
            document.getElementById('removeStyleButton').disabled = false;
        }
    
        if (obj['id'] !== this.defaultStyle) {
            document.getElementById('defaultStyleButton').disabled = false;
        } else {
            document.getElementById('defaultStyleButton').disabled = true;
        }
    
    
    }

    addActiveStyleToRow() {
        var optDiv = document.createElement('div');
        optDiv.classList.add("btn-group");
        optDiv.id = "orderButtons";
        optDiv.style = "float:right;";
    
        var opt = document.createElement('button');
        opt.type = "button";
        opt.classList.add("btn", "btn-default", "btn-xs", "p-0");
        opt.id = "button_up";
        opt.innerHTML = "&#x25B2;";
        opt.onclick = function(event) {
            event.stopImmediatePropagation();
            this.moveItemUpDown(event.target, false);
        }.bind(this);
    
        optDiv.appendChild(opt);
    
        opt = document.createElement('button');
        opt.type = "button";
        opt.classList.add("btn", "btn-default", "btn-xs", "p-0");
        opt.id = "button_down";
        opt.innerHTML = "&#x25BC;";
        opt.onclick = function(event) {
            event.stopImmediatePropagation();
            this.moveItemUpDown(event.target, true);
        }.bind(this);
    
        optDiv.appendChild(opt);
        return optDiv;
    }

    clickActiveStyle(row) {
        var stylesTable = document.getElementById("stylesTable");
        var s = stylesTable.querySelector("#orderButtons");
        if (s !== null)
            s.parentNode.removeChild(s);
    
        s = stylesTable.querySelector(".active");
        if (s !== null) {
            s.classList.remove('active');
        }
        
        this.lastStyleSelected = parseInt(row.getElementsByTagName('p')[0].innerHTML);
    
        row.getElementsByTagName("*")[0].appendChild(this.addActiveStyleToRow());
        row.classList.add("active");
    
        this.refreshCurrentItem();
    }

    refreshAdminPromptStyles() {
        var table = document.getElementById('stylesTable');
    
        while (table.rows.length > 0) {
            table.deleteRow(0);
        }
    
        var lastRow;
        for (var i = 0; i < this.themeStyles.length; i++) {
            var row = table.insertRow(-1);
            var opt = document.createElement('th');
            opt.classList.add("table-item");

            var innerText = "";

            innerText += "<span>" + this.themeStyles[i]["name"] + "</span>";

            opt.innerHTML = innerText;

            if (i == this.lastStyleSelected) {
                lastRow = row;
                opt.appendChild(this.addActiveStyleToRow());
                row.classList.add("active");
            }
            row.classList.add("style");

            //row.value = i;
            var objValue = document.createElement('p');
            objValue.innerHTML = i;
            objValue.id = "value";
            objValue.style.display = "none";
            opt.appendChild(objValue);

            row.appendChild(opt);

            row.addEventListener("click", function(event) {
                var node = event.target.parentNode;
                if (node.tagName === "TH") {
                    node = node.parentNode;
                }
                this.clickActiveStyle(node);
            }.bind(this), false);
        }
    }

    moveItemUpDown(obj, down) {
        var row = obj.parentElement.parentElement;
        var value = parseInt(row.getElementsByTagName('p')[0].innerHTML);
    
        if (down) {
            if (value + 1 != this.themeStyles.length) {
                var b = this.themeStyles[value];
                this.themeStyles[value] = this.themeStyles[value + 1];
                this.themeStyles[value + 1] = b;
                this.lastStyleSelected += 1;
            }
        } else {
            if (value - 1 != -1) {
                var b = this.themeStyles[value];
                this.themeStyles[value] = this.themeStyles[value - 1];
                this.themeStyles[value - 1] = b;
                this.lastStyleSelected -= 1;
    
            }
        }
    
        this.refreshAdminPromptStyles();
        this.refreshCurrentItem();
        this.refreshPromptStyles(document.getElementById("prompterStyle"));
    }

    openPromptStyles() {
        this.openCustomStylesModal = new bootstrap.Modal(document.getElementById("openCustomStyles"), {
            keyboard: false
        });
        this.openCustomStylesModal.show();
        this.initPromptStyles();
    }

    draw() {
        document.getElementById("editStyleButton").addEventListener("click", function() {
            this.editPromptStyle();
        }.bind(this));

        document.getElementById("addStyleButton").addEventListener("click", function() {
            this.addStyleToPromptStyles();
        }.bind(this));

        document.getElementById("removeStyleButton").addEventListener("click", function() {
            this.removeStyleFromPromptStyles();
        }.bind(this));

        document.getElementById("defaultStyleButton").addEventListener("click", function() {
            this.setDefaultStyle();
        }.bind(this));

        document.getElementsByClassName("close")[0].addEventListener("click", function() {
            this.closePromptStyles();
        }.bind(this));
    
        document.getElementById("nameStyle").addEventListener("input", function(event) {
            this.onNameStyleChange(event.target);
        }.bind(this));

        this.lastStyleSelected = this.getIndexOfStyleByID(this.defaultStyle);
        this.refreshAdminPromptStyles();
        setTimeout(function() {
            this.refreshCurrentItem();
        }.bind(this), 0);
    }

    getIndexOfStyleByID(id){
        for(var i = 0; i < this.themeStyles.length; i++){
            if(this.themeStyles[i]['id'] == id)
                return i;
        }
        return 0;
    }
    
    closePromptStyles() {
        this.openCustomStylesModal.hide();
        this.refreshPromptStyles(document.getElementById("prompterStyle"));
    }

    getStyle(selector, sheet) {
        var sheets = typeof sheet !== 'undefined' ? [sheet] : document.styleSheets;
        for (var i = 0, l = sheets.length; i < l; i++) {
            var sheet = sheets[i];
            if (!sheet.cssRules) {
                continue;
            }
            for (var j = 0, k = sheet.cssRules.length; j < k; j++) {
                var rule = sheet.cssRules[j];
    
                if (rule.selectorText && rule.selectorText.split(',').indexOf(selector) !== -1) {
                    return rule;
                }
            }
        }
        return null;
    }

    createCSSStyleElementFromString(cssText) {
        var doc = document.implementation.createHTMLDocument(""),
            styleElement = document.createElement("style");
        styleElement.textContent = cssText;
        doc.body.appendChild(styleElement);
        return styleElement.sheet;
    }

    onNameStyleChange(input) {

        if (this.themeStyles[this.lastStyleSelected]["name"].localeCompare(input.value) == 0) {
            document.getElementById('addStyleButton').disabled = true;
            document.getElementById('editStyleButton').disabled = !(this.themeStyles[this.lastStyleSelected]["type"] == 1);
            document.getElementById('removeStyleButton').disabled = !(this.themeStyles[this.lastStyleSelected]["type"] == 1);
        } else {
            var disabled = false;
            for (var i = 0; i < this.themeStyles.length; i++) {
                if (this.themeStyles[i].name.localeCompare(input.value) == 0) {
                    disabled = true;
                }
            }
            document.getElementById('addStyleButton').disabled = disabled;
            document.getElementById('editStyleButton').disabled = true;
            document.getElementById('removeStyleButton').disabled = true;
        }
    
    
    }    
}