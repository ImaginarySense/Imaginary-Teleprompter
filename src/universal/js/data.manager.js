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

// Global variables
var debug;
var currentVersion = "2.3.4"
function inElectron() {
    return navigator.userAgent.indexOf("Electron")!=-1;
}

var dataManager = {
	getItem: function(key,item,local,force){
		if (local === 'undefined')
		    local = 0;
		if (inElectron() && local == 2)
		    httpRequest("GET", key, item,force);
		else if (inElectron() || local == 1)
		    item(localStorage.getItem(key));
		else
		    item(sessionStorage.getItem(key));
    },
    setItem: function (key,item,local) {
		if (local === 'undefined')
		    local = 0;
		if (inElectron() && local == 2)
		    httpRequest("POST",key,item,true);
		else if (inElectron() || local == 1)
		    localStorage.setItem(key, item);
		else
		    sessionStorage.setItem(key, item);
    },
    removeItem: function (key,local) {
		if (local === 'undefined')
		    local = 0;
		if (inElectron() && local == 2)
		    httpRequest("POST",key,item,true);
		else if (inElectron() || local == 1)
		    localStorage.removeItem(key);
		else
		    sessionStorage.removeItem(key);
    },
    clearAll: function () {
    	sessionStorage.clear();
    	localStorage.clear();
    }
};


function httpRequest(type,theUrl,data,force) {
    if (data === 'undefined')
	    data = "";
    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
    xmlhttp.open(type, theUrl, force);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    
    xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
		    if (type == "GET") {
				data(xmlhttp.responseText);
		    }
		}
    }
    xmlhttp.send(data);
}
