/*
    Imaginary Teleprompter
    Copyright (C) 2021 Imaginary Sense Inc. and contributors

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

class Settings {
    constructor(){
        return new Proxy(localStorage, this); // Note: Proxy ES6 for ES5 @rauschma https://gist.github.com/rauschma/b29fbd27d7fea63b9b19
    }
    get(target, prop) {
        return localStorage[prop];
    }
    set(target, prop, value) {
        if (value === null) {
            delete localStorage[prop];
        } else {
            localStorage[prop] = value;
        }
        return localStorage[prop];
    }
    clear() {
        localStorage.clear()
    }
}

window.teleprompter.settings = new Settings();

// Example
// teleprompter.settings.test_variable = 'value';
// teleprompter.settings["test_variable"] = 'value';