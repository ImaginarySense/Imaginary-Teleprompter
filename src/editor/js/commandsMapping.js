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
        this.defaultsMapping = {
            "ArrowDown": {
                command: "incVelocity",
            },
            "ArrowUp": {
                command: "decVelocity",
            },
            "ArrowRight": {
                command: "incFont",
            },
            "ArrowLeft": {
                command: "decFont",
            },
            "Space": {
                command: "togglePlay",
            },
            "Period": {
                command: "sync",
            },
            "Backspace": {
                command: "resetTimer",
            },
            "Home": {
                command: "previousAnchor",
            },
            "End": {
                command: "nextAnchor",
            },
            "PageDown": {
                command: "fastForward",
            },
            "PageUp": {
                command: "rewind",
            },
            "F6": {
                command: "clearAllRequest",
            },
            "F5": {
                command: "refresh",
            },
            "F8": {
                command: "togglePrompter",
            },
            "F10": {
                command: "toggleDebug",
            },
            "F11": {
                command: "toggleFullscreen",
            }
        }
        this.mapping = { ...this.defaultsMapping };

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
                }.bind(this)
            },
            "togglePrompter": {
                "name": "Toggle Prompter",
                "method": function() {
                    this.instance.togglePrompter();
                }.bind(this)
            },
            "toggleFullscreen": {
                "name": "Toggle Fullscreen",
                "method": function() {
                    this.instance.toggleFullscreen();
                }.bind(this)
            },
            "refresh": {
                "name": "Refresh Screen",
                "method": function() {
                    if (debug)
                        this.instance.refresh();
                    else
                        console.log("Debug mode must be active to use 'F5' refresh in Electron. 'F10' enters and leaves debug mode.");
                }.bind(this)
            },
            "toggleDebug": {
                "name": "Toggle Debug",
                "method": function() {
                    this.instance.toggleDebug();
                }.bind(this)
            },
        }

        // Custom commands with options
        this.customActions = {
            // "customSpeed": {
            //     "name": "Custom Speed",
            //     "method": function(speed) {
            //         this.instance.listener({
            //             data: {
            //                 request: 21,
            //                 data: speed
            //             }
            //         });
            //     }.bind(this)
            // },
        }

        // Load settings
        this.loadSettings();
    }

    async loadSettings() { 
        // Load settings
        if (await teleprompter.settings.commandsMapping) {
            this.mapping = JSON.parse(await teleprompter.settings.commandsMapping);
        }

        this.userActions = [
            // {
            //     "name": "Speed 20",
            //     "value": 20,
            //     "action": "customSpeed"
            // }
        ];
        if (await teleprompter.settings.userActions) {
            this.userActions = JSON.parse(await teleprompter.settings.userActions);
        }
    }

    get table() {
        return document.getElementById("v-pills-commandsMappingContent");
    }

    draw() {
        // Removing all previous elements
        while (this.table.firstChild) {
            this.table.removeChild(this.table.lastChild);
        }

        // Add system actions
        this.createSystemCommandsMappingButtons();

        // Add user custom actions
        // this.createUserCommandsMappingButtons();
        
        // Add reset defaults commands settings
        this.createResetButton();
    }

    resetDefaultsSettings() {
        console.log(this.defaultsMapping);
        this.mapping = { ...this.defaultsMapping }
        teleprompter.settings.commandsMapping = JSON.stringify(this.mapping);
    }

    createResetButton() {
        var tr = document.createElement("tr");
        var th = document.createElement("th");
        th.colSpan = 2;
        th.classList = "text-center";

        var button = document.createElement("button");
        button.type = "button";
        button.classList = "btn btn-danger";
        button.innerHTML = "Reset to defaults";
        button.onclick = function(event) {
            console.log("Clicked");
            event.preventDefault();
            this.resetDefaultsSettings();
            this.draw();
        }.bind(this);

        th.appendChild(button);
        tr.appendChild(th);

        this.table.appendChild(tr);
    }

    createSystemCommandsMappingButtons () {
        var keys = Object.keys(this.actions);
        for (var i = 0; i < keys.length; i++) {
            this.createCommandMappingButton(keys[i], this.actions[keys[i]]);
        }
    }

    createUserCommandsMappingButtons () {
        for (var i = 0; i < this.userActions.length; i++) {
            this.createCommandMappingButton(this.userActions[i]['action'], this.userActions[i]);
        }
    }

    createCommandMappingButton(action_key, action) {
        var tr = document.createElement("tr");
        var th = document.createElement("th");
        th.classList = "col-6";

        var div = document.createElement("div");
        div.classList = "row text-center";

        var span = document.createElement("span");
        span.style = "padding: .375rem .75rem;";
        span.innerHTML = action["name"];

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

        button.setAttribute("data-action", action_key);

        for (var key in this.mapping) {
            if (this.mapping.hasOwnProperty(key)) {
                if (this.mapping[key] && this.mapping[key]['command'] === action_key) {
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
            var current_action = e.target.getAttribute("data-action");
            var nextKey = e.code;
            if (this.mapping[e.code] && this.mapping[e.code] !== current_action) {
                console.log("Already on another action");
                e.target.classList = "btn btn-outline-danger w-100 commandsButtonTransition";
                setInterval(function() {
                    e.target.classList = "btn btn-outline-primary w-100";
                    e.target.style = "";
                }, 500);
                nextKey = key;
            }

            if (this.mapping[key]) {
                delete this.mapping[key];
            }

            if (action['value']) {
                this.mapping[nextKey] = {
                    command: current_action,
                    data: action['value']
                };
            } else {
                this.mapping[nextKey] = {
                    command: current_action
                };
            }
            
            teleprompter.settings.commandsMapping = JSON.stringify(this.mapping);
            e.target.setAttribute("data-key", nextKey);

            let keyName = nextKey.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g).join(' ');
            e.target.innerHTML = keyName;
            this.table.onkeyup = null;
        }.bind(this);

        button.addEventListener('focusout', (event) => {
            var key = event.target.getAttribute("data-key");
            let keyName = key.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g).join(' ');
            event.target.innerHTML = keyName;
            this.table.onkeyup = null;
        });

        button.onclick = function(event) {
            event.preventDefault();
            event.target.focus();
            event.target.innerHTML = "Press any key";  
            this.table.onkeyup = function(e) {
                e.preventDefault();
                pressKey({
                    target: event.target,
                    code: e.code
                });
            }.bind(this);
        }.bind(this);
        
        col.appendChild(button);
        div.appendChild(col);
        th.appendChild(div);
        tr.appendChild(th);

        this.table.appendChild(tr);
    }

}