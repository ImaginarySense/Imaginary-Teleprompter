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

class CommandsMapping {
    constructor(instance) {
        // From instance
        this.instance = instance;
        
        // Global Variables
        this.preventPropagation = false;

        // Prompter commands enum
        this.command = Object.freeze({
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
            "restoreEditor": 15,
            "resetTimer":16,
            "nextAnchor":17,
            "previousAnchor":18,
            "fastForward":19,
            "rewind":20
        });

        // Commands Mapping
        this.mapping = {
            "ArrowDown": "incVelocity",
            "ArrowUp": "decVelocity",
            "ArrowRight": "incFont",
            "ArrowLeft": "decFont",
            "Space": "togglePlay",
            "Period": "sync",
            "Backspace": "resetTimer",
            "Home": "previousAnchor",
            "End": "nextAnchor",
            "PageDown": "fastForward",
            "PageUp": "rewind",
            "F6": "clearAllRequest",
            "F5": "refresh",
            "F8": "togglePrompter",
            "F10": "toggleDebug",
            "F11": "toggleFullscreen"
        }

        // Prompter actions
        this.actions = {
            "incVelocity": {
                "name": "Increase Velocity",
                "method": function() {
                    this.instance.listener({
                        data: {
                            request: this.command.incVelocity
                        }
                    });
                }.bind(this)
            },
            "decVelocity": {
                "name": "Decrease Velocity",
                "method": function() {
                    this.instance.listener({
                        data: {
                            request: this.command.decVelocity
                        }
                    });
                }.bind(this)
            },
            "incFont": {
                "name": "Increase Font",
                "method": function() {
                    this.instance.listener({
                        data: {
                            request: this.command.incFont
                        }
                    });
                }.bind(this)
            },
            "decFont": {
                "name": "Decrease Font",
                "method": function() {
                    this.instance.listener({
                        data: {
                            request: this.command.decFont
                        }
                    });
                }.bind(this)
            },
            "togglePlay": {
                "name": "Toggle Play",
                "method": function() {
                    this.instance.listener({
                        data: {
                            request: this.command.togglePlay
                        }
                    });
                }.bind(this)
            },
            "sync": {
                "name": "Sync",
                "method": function() {
                    this.instance.listener({
                        data: {
                            request: this.command.sync
                        }
                    });
                }.bind(this)
            },
            "resetTimer": {
                "name": "Reset Timer",
                "method": function() {
                    this.instance.listener({
                        data: {
                            request: this.command.resetTimer
                        }
                    });
                }.bind(this)
            },
            "previousAnchor": {
                "name": "Previous Anchor",
                "method": function() {
                    this.instance.listener({
                        data: {
                            request: this.command.previousAnchor
                        }
                    });
                }.bind(this)
            },
            "nextAnchor": {
                "name": "Next Anchor",
                "method": function() {
                    this.instance.listener({
                        data: {
                            request: this.command.nextAnchor
                        }
                    });
                }.bind(this)
            },
            "fastForward": {
                "name": "Fast Forward",
                "method": function() {
                    this.instance.listener({
                        data: {
                            request: this.command.fastForward
                        }
                    });
                }.bind(this)
            },
            "rewind": {
                "name": "Rewind",
                "method": function() {
                    this.instance.listener({
                        data: {
                            request: this.command.rewind
                        }
                    });
                }.bind(this)
            },
            "clearAllRequest": {
                "name": "Clear All Request",
                "method": function() {
                    this.instance.clearAllRequest();
                }
            },
            "togglePrompter": {
                "name": "Toggle Prompter",
                "method": function() {
                    this.instance.togglePrompter();
                }
            },
            "toggleFullscreen": {
                "name": "Toggle Fullscreen",
                "method": function(event) {
                    event.preventDefault();
                    this.instance.toggleFullscreen();
                }
            },
            "refresh": {
                "name": "Refresh Screen",
                "method": function() {
                    if (debug)
                        this.instance.refresh();
                    else
                        console.log("Debug mode must be active to use 'F5' refresh in Electron. 'F10' enters and leaves debug mode.");
                }
            },
            "toggleDebug": {
                "name": "Toggle Debug",
                "method": function() {
                    this.instance.toggleDebug();
                }
            },
    
        }
    }

    draw() {
        var table = document.getElementById("v-pills-commandsMappingContent");
        var keys = Object.keys(this.actions);
        for (var i = 0; i < keys.length; i++) {
            var tr = document.createElement("tr");
            var th = document.createElement("th");
            th.classList = "col-6";

            var div = document.createElement("div");
            div.classList = "row text-center";

            var span = document.createElement("span");
            span.style = "padding: .375rem .75rem;";
            span.innerHTML = this.actions[keys[i]]["name"];

            div.appendChild(span);
            th.appendChild(div);
            tr.appendChild(th);

            th = document.createElement("th");
            th.classList = "col-6";

            div = document.createElement("div");
            div.classList = "row justify-content-center";

            var col = document.createElement("div");
            col.classList = "col-6 text-center";

            var button = document.createElement("button");
            button.classList = "btn btn-outline-primary w-100";
            button.type = "button";
            button.id = "getKey";

            button.setAttribute("data-action", keys[i]);

            for (var key in this.mapping) {
                if (this.mapping.hasOwnProperty(key)) {
                    if (this.mapping[key] === keys[i]) {
                        button.setAttribute("data-key", key);
                        let keyName = key.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g).join(' ');
                        button.innerHTML = keyName
                        break;
                    }
                }
            }

            if (button.innerHTML === "") {
                button.innerHTML = "None";
                button.setAttribute("data-key", 'none');
            }

            var pressKey = function(e){
                var key = e.target.getAttribute("data-key");
                var action = e.target.getAttribute("data-action");
                var nextKey = e.code;
                if (this.mapping[e.code] && this.mapping[e.code] !== action) {
                    console.log("Already on another action");
                    e.target.classList = "btn btn-outline-danger w-100 commandsButtonTransition";
                    setInterval(function() {
                        e.target.classList = "btn btn-outline-primary w-100";
                        e.target.style = "";
                    }, 500);
                    nextKey = key;
                }

                if (this.mapping[key]) {
                    this.mapping[key] = null;
                }

                this.mapping[nextKey] = action;
                e.target.setAttribute("data-key", nextKey);

                let keyName = nextKey.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g).join(' ');
                e.target.innerHTML = keyName;
                document.removeEventListener('keydown', pressKey);

                // updatePrompterData();
            }.bind(this);

            button.addEventListener('focusout', (event) => {
                var key = event.target.getAttribute("data-key");
                let keyName = key.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g).join(' ');
                event.target.innerHTML = keyName;
                document.removeEventListener('keydown', pressKey);
            });

            button.onclick  = function(event) {
                event.preventDefault();
                event.target.focus();
                event.target.innerHTML = "Press any key";  
                document.addEventListener('keydown', (e) => {
                    e.preventDefault();
                    pressKey({
                        target: event.target,
                        code: e.code
                    });
                });
            }
            
            col.appendChild(button);
            div.appendChild(col);
            th.appendChild(div);
            tr.appendChild(th);

            table.appendChild(tr);
        }
    }
}