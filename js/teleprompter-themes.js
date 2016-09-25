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
var themeSheet, themeStyles, lastStyleSelected, defaultStyle;

(function() {
    // Use JavaScript Strict Mode.
    "use strict";
    // Global objects

    function init() {
        // Create style element.
        var themeStyle = document.createElement('style');
        themeStyle.type = 'text/css';
        // WebKit hack
        themeStyle.appendChild(document.createTextNode(""));
        // Append style element to head.
        document.getElementsByTagName('head')[0].appendChild(themeStyle);
        // Grab element's style sheet.
        themeSheet = themeStyle;
    }

    // Initialize objects after DOM is loaded
    if (document.readyState === "interactive" || document.readyState === "complete")
    // Call init if the DOM (interactive) or document (complete) is ready.
        init();
    else
    // Set init as a listener for the DOMContentLoaded event.
        document.addEventListener("DOMContentLoaded", init);

}());

function inElectron() {
    return navigator.userAgent.indexOf("Electron") !== -1;
}

function styleInit(prompterStyleElement) {

    
    dataManager.getItem('IFTeleprompterThemeStyles',function(data){
        themeStyles = JSON.parse(data);
    },0,false);

    if (!themeStyles) {
        themeStyles = [{
	    id:0,
            name: "Blackboard",
            type: 0,
            className: "darkBody",
            bgOverlay: "darkOverlay",
            cssText: ".darkBody {background: #272822;color:#FFF;}.darkOverlay {background: #000;}"
        }, {
	    id:1,
            name: "Whiteboard",
            type: 0,
            className: "lightBody",
            bgOverlay: "lightOverlay",
            cssText: ".lightBody {background: #FFF;color: #272822;}.lightOverlay {background: #CCC;}"
        }, {
	    id:2,
            name: "Classic Yellow",
            type: 0,
            className: "yellowBody",
            bgOverlay: "darkOverlay",
            cssText: ".yellowBody {color: #FF0;background: #000;}.darkOverlay {background: #000;}"
        }, {
	    id:3,
            name: "Intergalactic",
            type: 0,
            className: "theForce",
            bgOverlay: "darkOverlay",
            cssText: ".theForce {color: #FF0;background: #000;transform-origin: 50% 100%;transform: perspective(300px) rotateX(30deg) translate3d(0px,-115px,-180px);}.darkOverlay {background: #000;}"
        }];
    }
    if (!themeSheet) {
        var themeStyle = document.createElement('style');
        themeStyle.type = 'text/css';
        // WebKit hack
        themeStyle.appendChild(document.createTextNode(""));
        // Append style element to head.
        document.getElementsByTagName('head')[0].appendChild(themeStyle);
        // Grab element's style sheet.
        themeSheet = themeStyle;
    }
    
    defaultStyle = 0;
    dataManager.getItem('IFTeleprompterThemeDefaultStyle',function(data){
        if(JSON.parse(data) !== "undefined")
            defaultStyle = JSON.parse(data);
    },0,false);

    ///Maybe will need a fix in the future...
    setStyle(defaultStyle);

    if (prompterStyleElement) {
        refreshPromptStyles(prompterStyleElement);
        prompterStyleElement.value = getIndexOfStyleByID(defaultStyle);
    }
}

function setDefaultStyle() {
    defaultStyle = themeStyles[lastStyleSelected]["id"];
    dataManager.setItem("IFTeleprompterThemeDefaultStyle", defaultStyle);
    refreshAdminPromptStyles();
    refreshCurrentItem();
    saveStyles();
}

function editPromptStyle() {
    editThemeStyle(document.getElementById("nameStyle").value, document.getElementById("nameStyle").value.replace(/\s/gi, ""), document.getElementById('overlayTop').style.backgroundColor, document.getElementById('overlayPreview').style.backgroundColor, document.getElementById('overlayPreview').style.color);
}

function createStandardCSSClass(objName, bodyColor, textColor, overlayColor) {
    return '.' + objName + "Body" + ' {background: ' + bodyColor + ';color: ' + textColor + ';}.' + objName + "Overlay" + ' {background: ' + overlayColor + ';}';
}

function editThemeStyle(name2, objName, bodyColor, overlayColor, textColor) {
    var cssText = createStandardCSSClass(objName, bodyColor, textColor, overlayColor);
    themeStyles[lastStyleSelected] = {
	id:lastStyleSelected,
        name: name2,
        type: 1,
        className: objName + "Body",
        bgOverlay: objName + "Overlay",
        cssText: cssText
    };
    saveStyles();
}


function removeStyleFromPromptStyles() {
    if (defaultStyle == themeStyles[lastStyleSelected]["id"])
        defaultStyle = 0;

    themeStyles.splice(lastStyleSelected, 1);

    if (lastStyleSelected > themeStyles.length - 1) {
        lastStyleSelected = themeStyles.length - 1;
    }

    refreshAdminPromptStyles();
    refreshCurrentItem();
    saveStyles();
}

function addStyleToPromptStyles() {
    addThemeStyle(document.getElementById("nameStyle").value, document.getElementById("nameStyle").value.replace(/\s/gi, ""), document.getElementById('overlayTop').style.backgroundColor, document.getElementById('overlayPreview').style.backgroundColor, document.getElementById('overlayPreview').style.color);
    lastStyleSelected = themeStyles.length - 1;
    refreshAdminPromptStyles();
    refreshCurrentItem();
}

function addThemeStyle(name2, objName, bodyColor, overlayColor, textColor) {
    var cssText = createStandardCSSClass(objName, bodyColor, textColor, overlayColor);
    themeStyles.push({
	id:themeStyles.length,
        name: name2,
        type: 1,
        className: objName + "Body",
        bgOverlay: objName + "Overlay",
        cssText: cssText
    });
    saveStyles();
}

function saveStyles() {
    dataManager.setItem("IFTeleprompterThemeStyles", JSON.stringify(themeStyles));
    refreshPromptStyles(document.getElementById("prompterStyle"));
}

function refreshPromptStyles(promptStyleElement) {
    promptStyleElement.options.length = 0;

    for (var i = 0; i < themeStyles.length; i++) {
        var opt = document.createElement('option');
        opt.value = i;
        opt.innerHTML = themeStyles[i]["name"];
        promptStyleElement.appendChild(opt);
        if (themeStyles[i]["id"] == defaultStyle) {
            opt.selected = true;
        }
    }

    var opt = document.createElement('option');
    opt.value = themeStyles.length;
    opt.innerHTML = "Custom Style";

    promptStyleElement.appendChild(opt);
}

// Set Teleprompter Style.
function setStyle(promptStyleOption) {
    // Get page elements.
    var container = document.querySelector("#promptcontainer"),
        overlayBgs = document.getElementsByClassName("overlayBg"),
        overlayBgSetting;

    promptStyleOption = +promptStyleOption;

    if (promptStyleOption == themeStyles.length || window.location.hash == '#openCustomStyles') {
        openPromptStyles();
    } else {
        if (themeStyles[promptStyleOption].hasOwnProperty("cssText")) {
            themeSheet.appendChild(document.createTextNode(themeStyles[promptStyleOption]['cssText']));
        }

        for (var i = 0; i < themeStyles.length; i++) {
            if (container.classList.contains(themeStyles[i]['className']))
                container.classList.remove(themeStyles[i]['className']);
        }


        container.classList.add(themeStyles[promptStyleOption]['className']);
        overlayBgSetting = themeStyles[promptStyleOption]['bgOverlay'];

        // If page contains overlay, set overlay backgrounds.
        if (overlayBgs)
            for (var i = 0; i < overlayBgs.length; i++) {
                // Remove any of the previous classes, if any.
                for (var j = 0; j < themeStyles.length; j++) {
                    if (overlayBgs[i].classList.contains(themeStyles[j]['bgOverlay']))
                        overlayBgs[i].classList.remove(themeStyles[j]['bgOverlay']);
                }
                overlayBgs[i].classList.add(overlayBgSetting);
            }
    }

}

function updateColorOnPreview(obj) {
    if (obj.id == 'bodyColor') {
        document.getElementById('overlayTop').style.backgroundColor = '#' + obj.jscolor;
        document.getElementById('overlayBottom').style.backgroundColor = '#' + obj.jscolor;
        document.getElementById('overlayFocus').style.backgroundColor = '#' + obj.jscolor;
    } else if (obj.id == 'overlayColor') {
        document.getElementById('overlayPreview').style.backgroundColor = '#' + obj.jscolor;
    } else if (obj.id == 'textColor') {
        document.getElementById('overlayPreview').style.color = '#' + obj.jscolor;
    }
}

function refreshCurrentItem() {
    function hexc(orig) {
        var rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+)/i);
        return (rgb && rgb.length === 4) ?
            ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
            ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
            ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : orig;
    }

    var obj = themeStyles[lastStyleSelected];
    var objCSSElement;
    if (themeStyles[lastStyleSelected].hasOwnProperty("cssText"))
        objCSSElement = createCSSStyleElementFromString(obj['cssText']);
    var objBody = getStyle("." + obj['className'], objCSSElement);
    var objOverlay = getStyle("." + obj['bgOverlay'], objCSSElement);

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

    if (obj['id'] !== defaultStyle) {
        document.getElementById('defaultStyleButton').disabled = false;
    } else {
        document.getElementById('defaultStyleButton').disabled = true;
    }


}

function addActiveStyleToRow() {
    var optDiv = document.createElement('div');
    optDiv.classList.add("btn-group");
    optDiv.id = "orderButtons";
    optDiv.style = "float:right;";

    var opt = document.createElement('button');
    opt.type = "button";
    opt.classList.add("btn", "btn-default", "btn-xs");
    opt.id = "button_up";
    opt.innerHTML = "&#x25B2;";
    opt.onclick = function(event) {
        event.stopImmediatePropagation();
        moveItemUpDown(this, false);
    };

    optDiv.appendChild(opt);

    opt = document.createElement('button');
    opt.type = "button";
    opt.classList.add("btn", "btn-default", "btn-xs");
    opt.id = "button_down";
    opt.innerHTML = "&#x25BC;";
    opt.onclick = function(event) {
        event.stopImmediatePropagation();
        moveItemUpDown(this, true);
    };

    optDiv.appendChild(opt);
    return optDiv;
}

function clickActiveStyle(row) {
    var s = document.querySelector("#orderButtons");
    if (s !== null)
        s.parentNode.removeChild(s);

    s = document.querySelector(".active");
    if (s !== null) {
        s.classList.remove('active');
    }

    lastStyleSelected = parseInt(row.getElementsByTagName('p')[0].innerHTML);

    row.getElementsByTagName("*")[0].appendChild(addActiveStyleToRow());
    row.classList.add("active");

    refreshCurrentItem();
}

function refreshAdminPromptStyles() {
    var table = document.getElementById('stylesTable');

    while (table.rows.length > 0) {
        table.deleteRow(0);
    }

    var lastRow;
    for (var i = 0; i < themeStyles.length; i++) {
        (function() {
            var row = table.insertRow(-1);
            var opt = document.createElement('th');
            opt.classList.add("table-item");

            var innerText = "";

            if (themeStyles[i]["id"] == defaultStyle) {
                innerText += "<span class=\"glyphicon glyphicon-share-alt\"> </span>";
            }
            innerText += "<span>" + themeStyles[i]["name"] + "</span>";

            opt.innerHTML = innerText;

            if (i == lastStyleSelected) {
                lastRow = row;
                opt.appendChild(addActiveStyleToRow());
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

            row.addEventListener("click", function() {
                clickActiveStyle(this);
            }, false);
        }());
    }
}

function moveItemUpDown(obj, down) {
    var row = obj.parentElement.parentElement;
    var value = parseInt(row.getElementsByTagName('p')[0].innerHTML);

    if (down) {
        if (value + 1 != themeStyles.length) {
            var b = themeStyles[value];
            themeStyles[value] = themeStyles[value + 1];
            themeStyles[value + 1] = b;
            lastStyleSelected += 1;
        }
    } else {
        if (value - 1 != -1) {
            var b = themeStyles[value];
            themeStyles[value] = themeStyles[value - 1];
            themeStyles[value - 1] = b;
            lastStyleSelected -= 1;

        }
    }

    refreshAdminPromptStyles();
    refreshCurrentItem();
}

function openPromptStyles() {
    window.location = '#openCustomStyles';
    document.body.style.overflow = "hidden";

    document.getElementById("editStyleButton").addEventListener("click", editPromptStyle);
    document.getElementById("addStyleButton").addEventListener("click", addStyleToPromptStyles);
    document.getElementById("removeStyleButton").addEventListener("click", removeStyleFromPromptStyles);
    document.getElementById("defaultStyleButton").addEventListener("click", setDefaultStyle);
    document.getElementsByClassName("close")[0].addEventListener("click", closePromptStyles);

    document.getElementById("nameStyle").addEventListener("input", function() {
        onNameStyleChange(this)
    });

	lastStyleSelected = getIndexOfStyleByID(defaultStyle);
    refreshAdminPromptStyles();
    setTimeout(refreshCurrentItem, 0);
}

function getIndexOfStyleByID(id){
	for(var i = 0; i < themeStyles.length; i++){
		if(themeStyles[i]['id'] == id)
			return i;
	}
	return 0;
}

function closePromptStyles() {
    window.location = '#close';
    document.body.style.overflow = "auto";
    refreshPromptStyles(document.getElementById("prompterStyle"));
}

function getStyle(selector, sheet) {
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

function createCSSStyleElementFromString(cssText) {
    var doc = document.implementation.createHTMLDocument(""),
        styleElement = document.createElement("style");
    styleElement.textContent = cssText;
    doc.body.appendChild(styleElement);
    return styleElement.sheet;
}

function onNameStyleChange(input) {

    if (themeStyles[lastStyleSelected]["name"].localeCompare(input.value) == 0) {
        document.getElementById('addStyleButton').disabled = true;
        document.getElementById('editStyleButton').disabled = !(themeStyles[lastStyleSelected]["type"] == 1);
        document.getElementById('removeStyleButton').disabled = !(themeStyles[lastStyleSelected]["type"] == 1);
    } else {
        var disabled = false;
        for (var i = 0; i < themeStyles.length; i++) {
            if (themeStyles[i].name.localeCompare(input.value) == 0) {
                disabled = true;
            }
        }
        document.getElementById('addStyleButton').disabled = disabled;
        document.getElementById('editStyleButton').disabled = true;
        document.getElementById('removeStyleButton').disabled = true;
    }


}
