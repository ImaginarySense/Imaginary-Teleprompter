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
        if (teleprompter.settings.commandsMapping) {
            this.mapping = JSON.parse(teleprompter.settings.commandsMapping);
        }

        this.userActions = [
            // {
            //     "name": "Speed 20",
            //     "value": 20,
            //     "action": "customSpeed"
            // }
        ];
        if (teleprompter.settings.userActions) {
            this.userActions = JSON.parse(teleprompter.settings.userActions);
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

class Controls {
    constructor() {
        // All controls available
        this.controls = {
            'primary': 1,
            'secondary': 0,
            'prompterStyle': 1,
            'focus': 0,
            'speed': 4.0,
            'acceleration': 1.45,
            'fontSize': 120,
            'promptWidth': 84,
            'timer': true,
            'textAtFocusArea': 0,
            'focusAreaHeight': 50
        }

        // Defaults settings
        this.defaultsQuickConfig = {
            'primaryQuick': true,
            'secondaryQuick': true,
            'prompterStyleQuick': true,
            'focusQuick': true,
            'speedQuick': true,
            'accelerationQuick': false,
            'fontSizeQuick': true,
            'promptWidthQuick': true,
            'timerQuick': true,
            'textAtFocusAreaQuick': false,
            'focusAreaHeightQuick': false
        }

        this.setDefaultValues();

    }

    setDefaultValues() {
        // Set default controls values
        for (var key in this.controls) {
            if (!teleprompter.settings[key]) {
                teleprompter.settings[key] = this.controls[key];
            }
        }

        // Set default QuickConfig values
        for (var key in this.defaultsQuickConfig) {
            if (!teleprompter.settings[key]) {
                teleprompter.settings[key] = this.defaultsQuickConfig[key];
            }
        }
    }

    draw() {
        this.slider = [
            new Slider("#speed", {}),
            new Slider("#acceleration", {}),
            new Slider("#fontSize", {}),
            new Slider("#promptWidth", {}),
            new Slider("#focusAreaHeight", {}),
            new Slider("#speedControl", {}),
            new Slider("#accelerationControl", {}),
            new Slider("#fontSizeControl", {}),
            new Slider("#promptWidthControl", {}),
            new Slider("#focusAreaHeightControl", {})
        ];

        // Data binding for advanced options
        this.slider[0].on("change", function(input) {
            teleprompter.settings.speed = parseFloat(Math.round(input.newValue * 10) / 10).toFixed(1);
            document.getElementById("speedValue").textContent = teleprompter.settings.speed;
        });
        this.slider[1].on("change", function(input) {
            teleprompter.settings.acceleration = parseFloat(Math.round(input.newValue * 100) / 100).toFixed(2);
            document.getElementById("accelerationValue").textContent = teleprompter.settings.acceleration;
        });
        this.slider[2].on("change", function(input) {
            teleprompter.settings.fontSize = input.newValue;
            document.getElementById("fontSizeValue").textContent = teleprompter.settings.fontSize;
            teleprompter.editor.updateFont(teleprompter.settings.fontSize);
        });
        this.slider[3].on("change", function(input) {
            teleprompter.settings.promptWidth = input.newValue;
            document.getElementById("promptWidthValue").textContent = teleprompter.settings.promptWidth;
            teleprompter.editor.updateWidth(teleprompter.settings.promptWidth);
        });
        this.slider[4].on("change", function(input) {
            teleprompter.settings.focusAreaHeight = input.newValue;
            document.getElementById("focusAreaHeightValue").textContent = teleprompter.settings.focusAreaHeight;
        });
        this.slider[5].on("change", function(input) {
            teleprompter.settings.speed = parseFloat(Math.round(input.newValue * 10) / 10).toFixed(1);
            document.getElementById("speedControlValue").textContent = teleprompter.settings.speed;
        });
        this.slider[6].on("change", function(input) {
            teleprompter.settings.acceleration = parseFloat(Math.round(input.newValue * 100) / 100).toFixed(2);
            document.getElementById("accelerationControlValue").textContent = teleprompter.settings.acceleration;
        });
        this.slider[7].on("change", function(input) {
            teleprompter.settings.fontSize = input.newValue;
            document.getElementById("fontSizeControlValue").textContent = teleprompter.settings.fontSize;
            teleprompter.editor.updateFont(teleprompter.settings.fontSize);
        });
        this.slider[8].on("change", function(input) {
            teleprompter.settings.promptWidth = input.newValue;
            document.getElementById("promptWidthControlValue").textContent = teleprompter.settings.promptWidth;
            teleprompter.editor.updateWidth(teleprompter.settings.promptWidth);
        });
        this.slider[9].on("change", function(input) {
            teleprompter.settings.focusAreaHeight = input.newValue;
            document.getElementById("focusAreaHeightControlValue").textContent = teleprompter.settings.focusAreaHeight;
        });

        // Load last sliders setting
        this.setSliderValue(this.slider[0], teleprompter.settings.speed);
        this.setSliderValue(this.slider[1], teleprompter.settings.acceleration);
        this.setSliderValue(this.slider[2], teleprompter.settings.fontSize);
        this.setSliderValue(this.slider[3], teleprompter.settings.promptWidth);
        this.setSliderValue(this.slider[4], teleprompter.settings.focusAreaHeight);
        this.setSliderValue(this.slider[5], teleprompter.settings.speed);
        this.setSliderValue(this.slider[6], teleprompter.settings.acceleration);
        this.setSliderValue(this.slider[7], teleprompter.settings.fontSize);
        this.setSliderValue(this.slider[8], teleprompter.settings.promptWidth);
        this.setSliderValue(this.slider[9], teleprompter.settings.focusAreaHeight);

        var element, elements = [], sliderIndex = 0, sliderOffset = this.slider.length / 2, hasSlide = false;
        for (var key in this.controls) {
            element = document.getElementById(key);
            if (element && element.value) {
                if (element.hasAttribute('data-slider-value')) {
                    element.setAttribute('data-slider-id', sliderIndex);
                    element.onchange = function(event) {
                        this.updateQuickSliderControl(event);
                    }.bind(this);
                    hasSlide = true;
                } else {
                    element.value = teleprompter.settings[key];
                    element.onchange = function(event) {
                        this.updateQuickControl(event);
                    }.bind(this);
                }
            } else {
                elements = document.querySelectorAll('input[name="' + key + '"]');
                document.querySelector('input[name="' + key + '"]:checked').value = teleprompter.settings[key];
                for (var j = 0; j < elements.length; j++) {
                    element = elements[j];
                    element.onchange = function(event) {
                        this.updateQuickToggleControl(event);
                    }.bind(this);
                }
            }

            elements = [];
            element = document.getElementById(key + "Control");
            if (element) {
                if (element.hasAttribute('data-slider-value')) {
                    element.setAttribute('data-slider-id', sliderIndex + sliderOffset);
                    element.onchange = function(event) {
                        this.updateSliderControl(event);
                    }.bind(this);
                    hasSlide = true;
                } else {
                    element.value = teleprompter.settings[key];
                    element.onchange = function(event) {
                        this.updateControl(event);
                    }.bind(this);
                }
            } else {
                elements = document.querySelectorAll('input[name="' + key + 'Control"]');
                document.querySelector('input[name="' + key + 'Control"][value="' + (teleprompter.settings[key] === "true" ? "on": "off") + '"]').checked = true;
                for (var j = 0; j < elements.length; j++) {
                    element = elements[j];
                    element.onchange = function(event) {
                        this.updateToggleControl(event);
                    }.bind(this);
                }
            }
            
            element = document.getElementById(key + "QuickConfig");
            if (element) {
                element.onchange = function(event) {
                    this.updateQuickControlConfig(event);
                }.bind(this);
            }
            
            if (hasSlide) {
                hasSlide = false;
                sliderIndex++;
            }
        }
        this.updateQuickConfig();
    }

    updateQuickConfig() {
        var element;
        for (var key in this.controls) {
            element = document.getElementById(key + "Quick");
            if (element) {
                // Cleaning previous hiddens
                element.classList.remove("hidden");
                if (teleprompter.settings[key + "Quick"] === "false") {
                    element.classList.add("hidden");
                }
            }

            element = document.getElementById(key + "QuickConfig");
            if (element) {
                element.checked = (teleprompter.settings[key + "Quick"] === "true");
            }
        }
    }
    
    updateControl(e) {
        e.preventDefault();
        var id = e.target.id.replace("Control", "");
        var element = document.getElementById(id);
        if (element) {
            teleprompter.settings[id] = e.target.value;
            element.value = teleprompter.settings[id];
        }
    }

    updateQuickControl(e) {
        e.preventDefault();
        var id = e.target.id;
        var element = document.getElementById(id + "Control");
        if (element) {
            teleprompter.settings[id] = e.target.value;
            element.value = teleprompter.settings[id];
        }
    }

    updateToggleControl(e) {
        e.preventDefault();
        var id = e.target.name.replace("Control", "");
        teleprompter.settings[id] = e.target.value === "on";
        var element = document.querySelector('input[name="' + id + '"][value="' + (teleprompter.settings[id] === "true" ? "on" : "off") + '"]');
        element.checked = true;
    }

    updateQuickToggleControl(e) {
        e.preventDefault();
        var id = e.target.name;
        teleprompter.settings[id] = e.target.value === "on";
        var element = document.querySelector('input[name="' + id + 'Control"][value="' + (teleprompter.settings[id] === "true" ? "on" : "off") + '"]')
        element.checked = true;
    }

    updateSliderControl(e) {
        e.preventDefault();
        if (!this.preventPropagation) {
            this.preventPropagation = true;
        } else {
            this.preventPropagation = false;
            return;
        }
        // Assuming the order is right
        var index = e.target.getAttribute('data-slider-id');
        var slide = this.slider[parseInt(index) - (this.slider.length/2)];
        slide.setValue(this.slider[parseInt(index)].getValue());
        slide._trigger('change', {
            newValue: this.slider[parseInt(index)].getValue()
        });
    }

    updateQuickSliderControl(e) {
        e.preventDefault();
        if (!this.preventPropagation) {
            this.preventPropagation = true;
        } else {
            this.preventPropagation = false;
            return;
        }
        // Assuming the order is right
        var index = e.target.getAttribute('data-slider-id');
        var slide = this.slider[parseInt(index) + (this.slider.length/2)];
        slide.setValue(this.slider[parseInt(index)].getValue());
        slide._trigger('change', {
            newValue: this.slider[parseInt(index)].getValue()
        });
    }
    
    updateQuickControlConfig(e) {
        e.preventDefault();
        var id = e.target.id.replace("Config", "");
        teleprompter.settings[id] = e.target.checked;
        this.updateQuickConfig();
    }

    setSliderValue(slider, value) {
        slider.setValue(value);
        slider._trigger('change', {
            newValue: value
        });
    }
}
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

class FileManager {
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

        teleprompter.editor.contentEditor.save = function() {
            if (this.currentElement != 0) {
                var scriptsData = this.getElements();
                scriptsData[this.currentElement]["data"] = document.getElementById("prompt").innerHTML;
                this.getSaveMode().setItem(this.getDataKey(), JSON.stringify(scriptsData));
            }
        }.bind(this);

        this.selectedElement = function(element) {
            var scriptsData = this.getElements();
            if (scriptsData[this.currentElement].hasOwnProperty('data'))
                document.getElementById("prompt").innerHTML = scriptsData[this.currentElement]['data'];
            else
                document.getElementById("prompt").innerHTML = "";

            document.getElementById('promptOptions').innerHTML = scriptsData[this.currentElement]['name'];

            this.closeModal()
        }.bind(this);

        this.addElementEnded = function(element) {
            if (debug) console.log(element);
            this.selectedElement(element);
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

    addScript(evt) {
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

    setSaveMode(saveMode){
        if(saveMode === "sessionStorage")
            this.saveMode = sessionStorage;
        else
            this.saveMode = localStorage;
    };

    getSaveMode(){
        if (typeof this.saveMode !== 'undefined' && this.saveMode !== null)
            return this.saveMode;
        return localStorage;
    };

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

    getElements() {
        var elementsData = this.getSaveMode().getItem(this.getDataKey());
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

        document.getElementById("fileManagerDeleteModalDelete").onclick = function(e) {
            var elementsData = this.getElements();
            
            elementsData.splice(this.getElementIndexByID(id), 1);

            //Set Current Element
            this.currentElement = elementsData.length-1;

            //Saving Elements
            this.getSaveMode().setItem(this.getDataKey(), JSON.stringify(elementsData)); 
            this.refreshElements();
            this.selectedElement(null);
            
            this.fileManagerDeleteModal.hide();
            this.openModal();
        }.bind(this);
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
                        this.selectedElement(elementsData[this.currentElement]);
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

                    textBlock.onkeydown = function(e) {
                        if (e.keyCode == 13) {
                            e.stopImmediatePropagation();
                            
                            if (e.target.value.length>this.maxFileSize())
                                return false;

                            var text = e.target.value.replace("&nbsp;", '');
                            text = text.replace("<br>", '');
                            if (text.length > 0) {
                                e.target.value = text;

                                elementsData[this.getElementIndexByID(e.target.parentNode.parentNode.parentNode.parentNode.id)]['name'] = text;
                                this.getSaveMode().setItem(this.getDataKey(), JSON.stringify(elementsData));
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
                    }.bind(this);

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

class Editor {
    constructor() {
        this.debug = false;
        this.contentEditor = {};

        var editorList = [
            // oficial
            "ckeditor",
            // testing alternatives
            "tinymce",
            "summernote"
        ]
        this.currentEditor = editorList[0];

        // Import Electron libraries.
        if (inElectron()){
            const electron = require('electron');
            this.remote = require('@electron/remote');  // Allows IPC with main process in Electron.
            this.electronScreen = this.remote.screen; // Allows Smart Fullscreens in Electron.
            this.ipcRenderer = electron.ipcRenderer;
        }

        this.syncMethods = {"instance": 0, "canvas": 1, "follow": 2};
        this.syncMethod = this.syncMethods.instance;
        this.forceSecondaryDisplay = false;
        this.instance = [false, false],
        this.editorFocused = false;

        if (this.syncMethod === this.syncMethods.canvas) {
            this.forceSecondaryDisplay = true;
        }
    }

    init() {
        // Set globals
        this.tic = false;

        // Initialize file Manager
        teleprompter.fileManager = new FileManager();

        // Initialize commands mapping
        teleprompter.commandsMapping = new CommandsMapping(this);

        // Initialize themes
        teleprompter.themes = new Themes();
        teleprompter.themes.setColorPicker();

        // Initialize controls
        teleprompter.controls = new Controls();

        // Set DOM javascript controls
        this.prompt = document.getElementById("prompt");
        this.promptIt = document.getElementById("promptIt");
        this.updateIt = document.getElementById("updateIt");
        
        this.promptCanSubmitTeleprompter = true;
        if (this.promptIt) {
            this.promptIt.onclick = function(event) {
                this.submitTeleprompter(event);
            }.bind(this);
        }

        if (this.updateIt) {
            this.updateIt.onclick = function(event) {
                this.updateTeleprompter(event);
            }.bind(this);
        }

        this.prompterStyle = document.getElementById("prompterStyle");

        if (this.prompterStyle) {
            this.prompterStyle.addEventListener('change', function(e) {
                teleprompter.themes.setStyle(e.target.value);
            }.bind(this));
        }

        this.prompterStyleControl = document.getElementById("prompterStyleControl");
        if (this.prompterStyleControl) {
            this.prompterStyleControl.addEventListener('change', function(e) {
                teleprompter.themes.setStyle(e.target.value);
            }.bind(this));
        }

        this.frame = document.getElementById("teleprompterframe");
        this.canvas = document.getElementById("telepromptercanvas");
        if (this.canvas) {
            this.canvasContext = this.canvas.getContext('2d');
        }

        this.anchors = document.getElementById("anchors");

        // Set initial configuration to prompter style
        teleprompter.themes.styleInit(this.prompterStyle);

        // Set domain to current domain.
        this.setDomain();

        // If running inside Electron...
        if (inElectron()) {
            var compare = require("deb-version-compare");

            //Check, Update and Migrate Teleprompter Data
            var item = teleprompter.settings.IFTeleprompterVersion;
            if (item == null || compare(teleprompter.settings.currentVersion, item) == 1) {
                //fix 
                item = "0";
                console.log("item", item)
                console.log(teleprompter.settings)
                console.log("currentVersion", teleprompter.settings["currentVersion"])
                //check if is going to use a develoment version 
                if (!this.isADevVersion(item) && this.isADevVersion(teleprompter.settings.currentVersion)) {
                    //migrarate from official version to a development version
                    window.location = "#devWarning";
                    var agreeButton = document.getElementById("agreeWarningButton");
                    agreeButton.onclick = function(e) {
                        this.applyMigration(item);
                        teleprompter.settings.IFTeleprompterVersion = teleprompter.settings.currentVersion;
                        this.closeModal();
                    }.bind(this);
                    document.getElementById("cancelWarningButton").onclick = this.closeWindow;
                    document.getElementById("closeWarning").onclick = this.closeWindow;
                    agreeButton.focus();
                } else {
                    //migrate from previous versions 
                    this.applyMigration(item);
                    teleprompter.settings.IFTeleprompterVersion = teleprompter.settings.currentVersion;

                    //make sure all modal closes after reload the page
                    //place this here to avoid problems with the warning and the newest modal
                    this.closeModal();
                }
                
            } else if(compare(item, teleprompter.settings.currentVersion) == 1) {
                window.location = "#devNewestVersion";
                var cancelButton = document.getElementById("cancelNewestButton");
                cancelButton.onclick = function(e){
                    var window = this.remote.getCurrentWindow();
                    window.close();
                }.bind(this);
                cancelButton.focus();
            }
            // When asynchronous reply from main process, run function to...
            this.ipcRenderer.on('asynchronous-reply', function(event, arg) {
                // Update Canvas
                if (arg.option === "c") {
                    // Render picture as is
                    resizeCanvas(arg.size);
                    var clampedArray = new Uint8ClampedArray(arg.bitmap),
                        imageData;
                    try {
                        imageData = new ImageData(clampedArray, arg.size[0], arg.size[1]);
                    }
                    catch (err) {
                        // Remove error from command line by passing blank frame.
                        imageData = new ImageData(arg.size[0], arg.size[1]);
                        /*
                        // Attempt to prevent blank frame by calculating correct width and height using total area and aspect ratio.
                        var area = arg.bitmap.length/4,
                            aspectRatio = arg.size[1]/arg.size[0],
                            height = Math.sqrt(area*aspectRatio),
                            width = area/height;
                        imageData = new ImageData(clampedArray, width, height);
                        */
                    }
                    requestAnimationFrame(function() {
                        canvasContext.putImageData(imageData, 0, 0);
                    });
                    /*
                    // Render dirty area only. (Deprecated as inneficient. Uncomment for cool VFX on resize)
                    resizeCanvas(arg.size);
                    var width = arg.size[0],
                        height = arg.size[1],
                        croppedImage = new Uint8ClampedArray(arg.dirty.width*arg.dirty.height*4),
                        yProcessLength = arg.dirty.height+arg.dirty.y,
                        xProcessLength = arg.dirty.width+arg.dirty.x,
                        count = 0;
                    for (var i=arg.dirty.y; i<yProcessLength; i++)
                        for (var j=arg.dirty.x; j<xProcessLength; j++) {
                            var curr = (i*width+j)*4;
                            croppedImage[count+0] = arg.bitmap[curr+0];
                            croppedImage[count+1] = arg.bitmap[curr+1];
                            croppedImage[count+2] = arg.bitmap[curr+2];
                            croppedImage[count+3] = 255;
                            count+=4;
                        }
                    requestAnimationFrame(function() {
                        canvasContext.putImageData(new ImageData(croppedImage, arg.dirty.width, arg.dirty.height), arg.dirty.x, arg.dirty.y);
                    });
                    */
                }
                // Show QR Codes.
                // Initiate QRs for Remote Control.
                else if (arg.option === "qr")
                    addQRConnection(arg.data);
                // Restore instances
                else if (arg.option === "restoreEditor")
                    this.restoreEditor();
                // Forward remote control commands.
                else if (arg.option === "command")
                    document.onkeydown(arg.data);
                // 
                // Get the "exteral" classes and update each link to load on an actual browser.
                else if (arg.option === "prepareLinks") {
                    var classTags = document.getElementsByClassName('external');
                    for (var i = 0; i < classTags.length; i++)
                        if (classTags[i].href != " ") {
                            classTags[i].setAttribute("onclick", "shell.openExternal('" + classTags[i].href + "'); return false;");
                            classTags[i].href = "#";
                            classTags[i].target = "_parent";
                        }
                }
            });
            // Scan network for remote control.
            this.ipcRenderer.send('asynchronous-message', 'prepareLinks');
            //ipcRenderer.send('asynchronous-message', 'network');
        } // end if


        // Draw controls
        teleprompter.controls.draw();

        // Draw prompt styles
        teleprompter.themes.draw();

        // Draw file management
        teleprompter.fileManager.draw();

        // Load current editor
        loadScript(`editors/${this.currentEditor}.js`);

        // Initialize commands mapping editor
        teleprompter.commandsMapping.draw();

        var promptcontainer = document.getElementById("promptcontainer");
        promptcontainer.onscroll = function(event) {
            teleprompter.settings.promptStartPosition = event.target.scrollTop;
        }
        if (teleprompter.settings.promptStartPosition) {
            promptcontainer.scrollTop = teleprompter.settings.promptStartPosition;
        } else {
            teleprompter.settings.promptStartPosition = 0;
        }

        // Maybe we need to move the listener to prompter
        // Initialize postMessage event listener.
        addEventListener("message", function(event) {
            this.listener(event);
        }.bind(this), false);

        // Credits
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                this.htmldata = xmlhttp.responseText;
                this.internalCredits();
            }
        }.bind(this);

        document.addEventListener('keydown', function(event) {
            this.commandsListener(event);
        }.bind(this));

        // Save last use settings
        window.addEventListener("beforeunload", this.updatePrompterData);

        // Toogle control
        $('.btn-toggle').click(function() {
            $(this).find('.btn').toggleClass('active');  
            
            if ($(this).find('.btn-primary').length>0) {
                $(this).find('.btn').toggleClass('btn-primary');
            }
            if ($(this).find('.btn-danger').length>0) {
                $(this).find('.btn').toggleClass('btn-danger');
            }
            if ($(this).find('.btn-success').length>0) {
                $(this).find('.btn').toggleClass('btn-success');
            }
            if ($(this).find('.btn-info').length>0) {
                $(this).find('.btn').toggleClass('btn-info');
            }
            
            $(this).find('.btn').toggleClass('btn-default');
            
        });
        $('form').submit(function(){
            return false;
        });
    }

    closeWindow() {
        var window = this.remote.getCurrentWindow();
        window.close();
    }

    // Resize canvas size
    resizeCanvas(size) {
        if ( !(this.canvas.width===size[0] && this.canvas.height===size[1]) ) {
            this.canvas.width = size[0];
            this.canvas.height = size[1];
        }
    }

    isADevVersion(version) {
        console.log(version)
        if(version.includes("rc") || version.includes("alpha") || version.includes("beta"))
            return true;
        return false;
    }

    //Apply migration by versions
    applyMigration(version) {
        switch (version) {
            // "default" at top for unnacaunted developer versions. I didn't thought this was possible! xD
            default:
            // 2.2 or bellow
            case null:
            case "0":
            case "2.2.0":
                var dataToMigrate = teleprompter.settings.IFTeleprompterSideBar;
                if (dataToMigrate) {
                    // Convert Data
                    dataToMigrate = JSON.parse(dataToMigrate);
                    if (dataToMigrate.length > 0) {
                        // Fix to not do more dirty work
                        dataToMigrate[0]["id"] = teleprompter.fileManager.createIDTag(dataToMigrate[0].name, true);
                        teleprompter.fileManager.getSaveMode().setItem(teleprompter.fileManager.getDataKey(), JSON.stringify(dataToMigrate));
                    }
                    // Continue with rest of the data
                    for (var i = 1; i < dataToMigrate.length; i++)
                        if (dataToMigrate[i].hasOwnProperty("name")) {
                            dataToMigrate[i]["id"] = teleprompter.fileManager.createIDTag(dataToMigrate[i].name);
                            teleprompter.fileManager.getSaveMode().setItem(teleprompter.fileManager.getDataKey(), JSON.stringify(dataToMigrate));
                        }
                }
            case "2.3.0": // Nothing to do here, issues solved elsewhere.
            // Next itteration
            case "2.4.0":
            break;
        }
    }

    setDomain() {
        // Get current domain from browser
        this.domain = document.domain;
        // If not running on a server, return catchall.
        if (this.domain.indexOf("http://") != 0 || this.domain.indexOf("https://") != 0 || this.domain.indexOf("localhost") != 0)
        this.domain = "*";
    }

    getDomain() {
        return this.domain;
    }

    launchIntoFullscreen(element) {
        var requestFullscreen = element.requestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen || element.msRequestFullscreen;
        if (requestFullscreen !== undefined)
            requestFullscreen.call(element);
    }

    exitFullscreen() {
        var exitFullscreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullscreen;
        if (exitFullscreen !== undefined)
            exitFullscreen.call(document);
    }

    toggleFullscreen() {
        var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement,
            elem;
        if (fullscreenElement)
            this.exitFullscreen();
        else {
            if (this.promptCanSubmitTeleprompter)
                elem = document.getElementById("editorcontainer");
            else
                elem = document.documentElement;
            this.launchIntoFullscreen(elem);
        }
    }

    togglePrompter() {
        if (this.promptCanSubmitTeleprompter)
            this.submitTeleprompter();
        else
            this.restoreEditor();
    }

    togglePromptIt() {
        if (this.promptCanSubmitTeleprompter) {
            // Update button
            this.promptIt.textContent = "Close It...";
            this.promptCanSubmitTeleprompter = false;
            this.promptIt.onclick = function(event) {
                this.restoreEditor(event);
            }.bind(this);
            // Hide stuff
            if (this.instance[0]) {
                document.getElementById("content").style.display = "none";
                document.getElementById("editorcontainer").style.display = "none";
                // Show prompter instance
                document.getElementById("framecontainer").style.display = "block";
                if (this.instance[1] && this.syncMethod === this.syncMethods.canvas) {
                    this.canvas.style.display = "block";
                    this.frame.style.display = "none";
                }
                else {
                    this.frame.style.display = "block";
                    this.canvas.style.display = "none";
                }
                this.launchIntoFullscreen(document.documentElement);
            } else if (this.instance[1]) {
                this.updateIt.classList.remove("hidden");
            }
        } else {
            // Update button
            this.promptIt.innerHTML = "Prompt It!";
            this.promptCanSubmitTeleprompter = true;
            this.promptIt.onclick = function(event) {
                this.submitTeleprompter(event);
            }.bind(this);
            // Restore editor
            if (this.instance[0]) {
                document.getElementById("content").style.display = "";
                document.getElementById("editorcontainer").style.display = "";
                // Hide prompter frame
                document.getElementById("framecontainer").style.display = "none";
                if (this.instance[1] && this.syncMethod === this.syncMethods.canvas)
                    this.canvas.style.display = "none";
                else
                    this.frame.style.display = "none";
                this.exitFullscreen();
            } else if (this.instance[1]) {
                this.updateIt.classList.add("hidden");
            }
        }
    }

    internalCredits() {
        // Set primary instance as active.
        this.instance[0] = true;
        this.instance[1] = false;

        // Toggle editor interface
        this.togglePromptIt();

        // Set data to send.
        var settings = '{ "data": {"secondary":0,"primary":1,"prompterStyle":2,"focusMode":3,"background":"#3CC","color":"#333","overlayBg":"#333","speed":"13","acceleration":"1.2","fontSize":"100","promptWidth":"84","timer":"false","voice":"false"}}',
            session = '{ "html":"' + encodeURIComponent(htmldata) + '" }';

        // Store data locally for prompter to use
        teleprompter.settings.IFTeleprompterSettings = settings;
        teleprompter.settings.IFTeleprompterSession = session;

        // Update frame and focus on it.
        //this.frame.src = "teleprompter.html";
        this.frame.src = "teleprompter.html?debug=1";
        this.frame.focus();

    }

    credits() {
        // Get credits page.
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", "credits.html", true);
        xmlhttp.send();
        this.toggleFullscreen();
    }

    updatePrompterData() {
        // Get html from editor
        this.htmldata = teleprompter.editor.contentEditor.getEditorContent();

        // Merge all settings into one.
        var session = '{ "html":"' + encodeURIComponent(this.htmldata) + '" }';

        // If we use sessionStorage we wont be able to update the contents.
        teleprompter.settings.IFTeleprompterSession = session;

        // Update list of anchors
        if (typeof this.updateAnchors == 'function') {
            this.updateAnchors();
        }
    }

    updateAnchors() {
        var anchors = this.prompt.querySelectorAll("a");
        this.anchors.innerHTML = '';
        if (anchors.length > 0) {
            for (var i = 0; i < anchors.length; i++) {
                var li = document.createElement('li');
                li.classList = 'list-group-item';
                li.innerHTML = anchors[i].innerHTML
                this.anchors.appendChild(li);
            }
        }
    }

    restoreEditor(event) {
        if (!this.promptCanSubmitTeleprompter) {
            if (this.debug) console.log("Restoring editor.");
            // Request to close prompters:
            // Close frame.
            if (this.frame.src.indexOf("teleprompter.html") != -1)
                this.frame.contentWindow.postMessage({
                    'request': teleprompter.commandsMapping.command.close
                }, this.getDomain());
            // Close window.
            if (this.prompterWindow)
                this.prompterWindow.postMessage({
                    'request': teleprompter.commandsMapping.command.close
                }, this.getDomain());
            if (this.syncMethod === this.syncMethods.canvas)
                this.ipcRenderer.send('asynchronous-message', 'closeInstance');
            // Clear contents from frame
            this.frame.src = "about:blank";
            // Stops the event but continues executing current function.
            if (event && event.preventDefault)
                event.preventDefault();
            this.togglePromptIt();
        }
        promptcontainer.scrollTop = teleprompter.settings.promptStartPosition;
    }

    // On "Prompt It!" clicked
    submitTeleprompter(event) {
        if (this.debug) console.log("Submitting to prompter");

        // Stops the event but continues executing the code.
        if (!(event===undefined||event.preventDefault===undefined))
            event.preventDefault();

        var secondaryDisplay = null;
        
        this.updatePrompterData();

        // Determine whether to load "Primary".
        this.instance[0] = (teleprompter.settings.primary > 0) ? true : false; 
        // Determine whether to load "Secondary".
        this.instance[1] = (teleprompter.settings.secondary > 0) ? true : false; 
        // Checks if is running on electron app...
        if (inElectron()) {
            // Check display availabillity.
            const displays = this.electronScreen.getAllDisplays()
            
            // of displays that are currently  available.
            var primaryDisplay = this.electronScreen.getPrimaryDisplay(),
            currentDisplay = 0, // 0 means primary and 1 means secondary
            cursorLocation = this.electronScreen.getCursorScreenPoint();
            // Find the first display that isn't the primary display.
            if (this.debug) console.log("Displays amount: "+displays.length);
            const secondaryDisplay = displays.find((display) => {
                return display.bounds.x !== 0 || display.bounds.y !== 0
            })
            if (this.debug) console.log( "Primary display:" );
            if (this.debug) console.log( primaryDisplay );
            if (this.debug) console.log( "Secondary display:" );
            if (this.debug) console.log( secondaryDisplay );
            // Determine the display in which the main window is at.
            if ( (cursorLocation.x < primaryDisplay.bounds.x) || (cursorLocation.x > primaryDisplay.bounds.width) || (cursorLocation.y < primaryDisplay.bounds.y) || (cursorLocation.y > primaryDisplay.bounds.height) )
                currentDisplay = 1;
            // If there are any externalDisplay; then create a new window for the display.
            if (this.instance[1]) {
                if (secondaryDisplay || this.forceSecondaryDisplay) {
                    // Open external prompter on a display where the editor is not located at.
                    if (currentDisplay===0) {
                        if (this.debug) console.log("Displaying external on secondary display.");
                        // Load external instance if in-frame prompter wont run.
                        if (this.instance[0] && this.syncMethod===this.syncMethods.canvas)
                            this.openCanvasPrompter();
                        // Otherwise run perfect sync painter.
                        else
                            this.prompterWindow = window.open("teleprompter.html" + (debug ? "?debug=1" : ""), 'TelePrompter Output', 'height=' + (secondaryDisplay.workArea.height-50) + ',width=' + (secondaryDisplay.workArea.width-50) + ',top='+ (secondaryDisplay.workArea.y+50) +',left=' + (secondaryDisplay.workArea.x+50) + ',fullscreen=0,status=0,location=0,menubar=0,toolbar=0,frame=true' );
                    }
                    else if (currentDisplay>0) {
                        if (this.debug) console.log("Displaying external on primary display.");
                        // Load external instance if in-frame prompter wont run.
                        if (this.instance[0] && this.syncMethod===this.syncMethods.canvas)
                            this.openCanvasPrompter();
                        // Otherwise run perfect sync painter.
                        else
                            this.prompterWindow = window.open("teleprompter.html" + (debug ? "?debug=1" : ""), 'TelePrompter Output', 'height=' + (primaryDisplay.workArea.height-50) + ',width=' + (primaryDisplay.workArea.width-50) + ',top='+ (primaryDisplay.workArea.y+25) +',left=' + (primaryDisplay.workArea.x+25) + ',fullscreen=0,status=0,location=0,menubar=0,toolbar=0,frame=true');
                    }
                }
                // If currentDisplay isn't the primaryDisplay or if there is no secondaryDisplay and the primary is unnocupied... Display on primaryDisplay.
                else if (!this.instance[0]) {
                    if (this.debug) console.log("Displaying on primary display.");
                    this.prompterWindow = window.open("teleprompter.html" + (debug ? "?debug=1" : ""), 'TelePrompter Output', 'height=' + (primaryDisplay.workArea.height-50) + ',width=' + (primaryDisplay.workArea.width-50) + ',top='+ (primaryDisplay.workArea.y+25) +',left=' + (primaryDisplay.workArea.x+25) + ',fullscreen=0,status=0,location=0,menubar=0,toolbar=0,frame=true');
                }
            }
            // Load InFrame prompter only if there's more than one screen or if the only screen available is free.
            if (this.instance[0] && (!this.instance[1] || secondaryDisplay))
                this.frame.src = "teleprompter.html" + (debug ? "?debug=1" : "");
        } else {
            if (this.instance[0])
                this.frame.src = "teleprompter.html" + (debug ? "?debug=1" : "");
            if (this.instance[1])
                this.prompterWindow = window.open("teleprompter.html" + (debug ? "?debug=1" : ""), 'TelePrompter Output', 'height=' + screen.availHeight + ',width=' + screen.width + ',top=0,left=' + screen.width + ',fullscreen=0,status=0,location=0,menubar=0,toolbar=0');
        }
        
        // If an external prompt is openned, focus on it.        
        if (this.prompterWindow!=undefined && window.focus)
            // Adviced to launch as separate event on a delay.
            this.prompterWindow.focus();
        else
            this.frame.focus();

        // In case of both instances active and not enough screens...
        if (!this.forceSecondaryDisplay && (inElectron() && !secondaryDisplay && this.instance[0] && this.instance[1])) {
            window.alert("You don't have any external Display.");
            this.instance[0] = false;
            this.instance[1] = false;
        }
        // In case that no instance is active...
        else if (!(this.instance[0] || this.instance[1]))
            window.alert("You must prompt at least to one display.");
        else {
            if (this.debug) console.log("Displaying on frame.");
            this.togglePromptIt();
        }
    }

    openCanvasPrompter() {
        // Opening experimental prompter...
        if (this.debug) console.log("Opening experimental prompter.");
        this.ipcRenderer.send('asynchronous-message', 'openInstance');
    }

    updateTeleprompter(event) {
        // Stops the event but continues executing the code.
        event.preventDefault();
        // Update data.
        this.updatePrompterData();
        if (this.debug) console.log("Updating prompter contents");
        // Request update on teleprompter other instance.
        this.listener({
            data: {
                request: teleprompter.commandsMapping.command.updateContents
            }
        });
    }

    toggleDebug() {
        if (inElectron())
            this.remote.getCurrentWindow().toggleDevTools();
        else
            this.toggleDebugMode();
    }

    toc() {
        this.tic != this.tic;
    }

    refresh() {
        location.reload();
    }

    clearAllRequest() {
        if (confirm("You've pressed F6. Do you wish to perform a factory reset of Teleprompter? You will loose all saved scripts and custom styles.") ) {
            teleprompter.settings.clear();
            window.removeEventListener("beforeunload", function() {
                this.updatePrompterData();
            }.bind(this));
            refresh();
        }
    }

    listener(event) {
        // Message data. Uncommenting will give you valuable information and decrease performance dramatically.
        /*
        setTimeout(function() {
            if (this.debug) {
                console.log("Editor:");
                console.log(event);
            }
        }, 0);
        */
        // If the event comes from the same domain...
        if (!event.domain || event.domain === this.getDomain()) {
            var message = event.data;
            // Special case. Restore editor message received.
            if (message.request === teleprompter.commandsMapping.command.restoreEditor)
                this.restoreEditor();
            else {
                if (this.syncMethod===this.syncMethods.canvas && this.instance[0] && this.instance[1] && inElectron() ) {
                    // IPC between main process directly.
                    this.ipcRenderer.send('asynchronous-message', message);
                }
                else {
                    // If this isn't a instant sync command, follow normal procedure.
                    if (!(message.request === teleprompter.commandsMapping.command.iSync || message.request === teleprompter.commandsMapping.command.sync)) {
                        // Tic toc mechanism symmetricaly distributes message request lag.
                        if (this.tic) {
                            // Redirect message to each prompter instance.
                            if (this.instance[1])
                                this.prompterWindow.postMessage(message, this.getDomain());
                            if (instance[0])
                                this.frame.contentWindow.postMessage(message, this.getDomain());
                        } else {
                            // Redirect message to each prompter instance.
                            if (this.instance[0])
                                this.frame.contentWindow.postMessage(message, this.getDomain());
                            if (this.instance[1])
                                this.prompterWindow.postMessage(message, this.getDomain());
                        }
                    }
                    // If requesting for sync, ensure both instances are open. Otherwise do nothing.
                    else if (this.instance[0] && this.instance[1]) {
                        // Tic toc mechanism symmetricaly distributes message request lag.
                        if (this.tic) {
                            // Redirect message to each prompter instance.
                            if (this.instance[1])
                                this.prompterWindow.postMessage(message, this.getDomain());
                            if (this.instance[0])
                                this.frame.contentWindow.postMessage(message, this.getDomain());
                        } else {
                            // Redirect message to each prompter instance.
                            if (this.instance[0])
                                this.frame.contentWindow.postMessage(message, this.getDomain());
                            if (this.instance[1])
                                this.prompterWindow.postMessage(message, this.getDomain());
                        }
                    }
                    // Update tic-toc bit.
                    setTimeout(this.toc, 10);
                }
            }
        }
    }

    // This need to be 
    commandsListener (event) {
        // Temporal Solution, until advanced descomposition
        if (event.target.hasAttribute("data-key")) {
            return;
        }
        var mapping = teleprompter.commandsMapping.mapping;
        if (mapping[event.code] && mapping[event.code]["command"]) {
            if (mapping[event.code]["data"]) {
                teleprompter.commandsMapping.customActions[mapping[event.code]["command"]]["method"]();
            } else {
                teleprompter.commandsMapping.actions[mapping[event.code]["command"]]["method"]();
            }
        } else if (event.key) {
            var key;
            // If key is not a string
            if (!this.isFunction(event.key.indexOf))
                key = String.fromCharCode(event.key);
            else
                key = event.key;
            //if ( key.indexOf("Key")===0 || key.indexOf("Digit")===0 )
            //      key = key.charAt(key.length-1);
            if (!this.is_int(key))
                key = key.toLowerCase();
            if (this.debug) console.log(key);
            this.listener({
                data: {
                    request: teleprompter.commandsMapping.command.anchor,
                    data: key
                }
            });
        }
    }

    closeModal() {
        if (window.location.hash.slice(1) === "openCustomStyles")
            this.closePromptStyles();
        else if (window.location.hash.slice(1) === "devWarning") {
            var version = function(thisVersion) {
                console.log(thisVersion);
                if (thisVersion === teleprompter.settings.currentVersion)
                    window.location = "#close";
                else
                    window.close();
            };
            // teleprompter.settings.get("IFTeleprompterVersion", version);
        }
        else
            window.location = "#close";
        this.prompt.focus();

        if (teleprompter.fileManager.modal) {
            teleprompter.fileManager.modal.hide()
            teleprompter.fileManager.modal = undefined;
        }
    }

    updateFont(value) {
        if (this.debug) console.log("Updating font.");
        this.prompt.style.fontSize = "calc(3.4vw * "+(value/100)+")"; // default 5vw
    }

    updateWidth(value) {
        if (this.debug) console.log("Updating width.");
        // this.prompt.style.width = value+"vw";
        // this.prompt.style.left = "calc("+(50-value/2)+"vw - 14px)";
        this.prompt.style.width = value + "%";
        this.prompt.style.left = (50-value/2)+"%";
    }

    isFunction(possibleFunction) {
        return typeof(possibleFunction) === typeof(Function)
    }

    is_int(value) {
        if (parseFloat(value) == parseInt(value) && !isNaN(value))
            return true;
        else
            return false;
    }

    insertTextAtCursor(node) {
        var sel, range, html;
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();
                range.insertNode(node);
            }
        } else if (document.selection && document.selection.createRange) {
            document.selection.createRange().text = text;
        }
    }

    toggleDebugMode() {
        if (this.debug) 
            exitDebug();
        else
            enterDebug();
    }

}

teleprompter.editor = new Editor()

// Initialize objects after DOM is loaded
if (document.readyState === "interactive" || document.readyState === "complete")
    // Call init if the DOM (interactive) or document (complete) is ready.
    teleprompter.editor.init();
else
    // Set init as a listener for the DOMContentLoaded event.
    document.addEventListener("DOMContentLoaded", function() {
        teleprompter.editor.init();
    }.bind(this));

if (inElectron()) {
    const remote = require('@electron/remote');
    
    function initWindowControls() { 
        document.getElementById("win-controls-min").addEventListener("click", function (e) {
            const window = remote.getCurrentWindow();
            window.minimize(); 
        });
        
        document.getElementById("win-controls-max").addEventListener("click", function (e) {
        const window = remote.getCurrentWindow();
        if (!window.isMaximized()) {
            window.maximize();
        } else {
            window.unmaximize();
        }	 
        });
        
        document.getElementById("win-controls-close").addEventListener("click", function (e) {
            // const window = remote.getCurrentWindow();
            // window.close();
            remote.app.exit();
        }); 
    }; 
    
    document.onreadystatechange = function () {
        if (document.readyState == "complete") {
            initWindowControls(); 
        }
    };
}