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
var debug, isMobileApp = false;

function inElectron() {
    return navigator.userAgent.indexOf("Electron")!=-1;
}

var dataManager = {
    getItem: function(key,item,local,force){
	if(local === 'undefined')
	    local = 0;
	if(isMobileApp){
	    httpRequest("GET","/" + key, item,force);
	}else if (inElectron() || local == 1)
	    return localStorage.getItem(key);
	else
	    return sessionStorage.getItem(key);
    },
    setItem: function (key,item,local) {
	if(local === 'undefined')
	    local = 0;
	if(isMobileApp)
	    httpRequest("POST","/" + key,item,true);
	else if (inElectron() || local == 1)
	    localStorage.setItem(key, item);
	else
	    sessionStorage.setItem(key, item);
    }
};


function httpRequest(type,theUrl,data,force)
{
    if(data === 'undefined')
	    data = "";
    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
    xmlhttp.open(type, theUrl, force);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    
    xmlhttp.onreadystatechange = function() {
	if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
	    if (type == "GET"){
			data(xmlhttp.responseText);
	    }
	}
    }
    xmlhttp.send(data);
}
