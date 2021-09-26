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

    async setDefaultValues() {
        // Set default controls values
        for (var key in this.controls) {
            if (!await teleprompter.settings[key]) {
                teleprompter.settings[key] = this.controls[key];
            }
        }

        // Set default QuickConfig values
        for (var key in this.defaultsQuickConfig) {
            if (!await teleprompter.settings[key]) {
                teleprompter.settings[key] = this.defaultsQuickConfig[key];
            }
        }
    }

    async draw() {
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
        this.slider[0].on("change", async (input) => {
            teleprompter.settings.speed = parseFloat(Math.round(input.newValue * 10) / 10).toFixed(1);
            document.getElementById("speedValue").textContent = await teleprompter.settings.speed;
        });
        this.slider[1].on("change", async (input) => {
            teleprompter.settings.acceleration = parseFloat(Math.round(input.newValue * 100) / 100).toFixed(2);
            document.getElementById("accelerationValue").textContent = await teleprompter.settings.acceleration;
        });
        this.slider[2].on("change", async (input) => {
            teleprompter.settings.fontSize = input.newValue;
            document.getElementById("fontSizeValue").textContent = await teleprompter.settings.fontSize;
            teleprompter.editor.updateFont(await teleprompter.settings.fontSize);
        });
        this.slider[3].on("change", async (input) => {
            teleprompter.settings.promptWidth = input.newValue;
            document.getElementById("promptWidthValue").textContent = await teleprompter.settings.promptWidth;
            teleprompter.editor.updateWidth(await teleprompter.settings.promptWidth);
        });
        this.slider[4].on("change", async (input) => {
            teleprompter.settings.focusAreaHeight = input.newValue;
            document.getElementById("focusAreaHeightValue").textContent = await teleprompter.settings.focusAreaHeight;
        });
        this.slider[5].on("change", async (input) => {
            teleprompter.settings.speed = parseFloat(Math.round(input.newValue * 10) / 10).toFixed(1);
            document.getElementById("speedControlValue").textContent = await teleprompter.settings.speed;
        });
        this.slider[6].on("change", async (input) => {
            teleprompter.settings.acceleration = parseFloat(Math.round(input.newValue * 100) / 100).toFixed(2);
            document.getElementById("accelerationControlValue").textContent = await teleprompter.settings.acceleration;
        });
        this.slider[7].on("change", async (input) => {
            teleprompter.settings.fontSize = input.newValue;
            document.getElementById("fontSizeControlValue").textContent = await teleprompter.settings.fontSize;
            teleprompter.editor.updateFont(await teleprompter.settings.fontSize);
        });
        this.slider[8].on("change", async (input) => {
            teleprompter.settings.promptWidth = input.newValue;
            document.getElementById("promptWidthControlValue").textContent = await teleprompter.settings.promptWidth;
            teleprompter.editor.updateWidth(await teleprompter.settings.promptWidth);
        });
        this.slider[9].on("change", async (input) => {
            teleprompter.settings.focusAreaHeight = input.newValue;
            document.getElementById("focusAreaHeightControlValue").textContent = await teleprompter.settings.focusAreaHeight;
        });

        // Load last sliders setting
        this.setSliderValue(this.slider[0], await teleprompter.settings.speed);
        this.setSliderValue(this.slider[1], await teleprompter.settings.acceleration);
        this.setSliderValue(this.slider[2], await teleprompter.settings.fontSize);
        this.setSliderValue(this.slider[3], await teleprompter.settings.promptWidth);
        this.setSliderValue(this.slider[4], await teleprompter.settings.focusAreaHeight);
        this.setSliderValue(this.slider[5], await teleprompter.settings.speed);
        this.setSliderValue(this.slider[6], await teleprompter.settings.acceleration);
        this.setSliderValue(this.slider[7], await teleprompter.settings.fontSize);
        this.setSliderValue(this.slider[8], await teleprompter.settings.promptWidth);
        this.setSliderValue(this.slider[9], await teleprompter.settings.focusAreaHeight);

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
                    element.value = await teleprompter.settings[key];
                    element.onchange = function(event) {
                        this.updateQuickControl(event);
                    }.bind(this);
                }
            } else {
                elements = document.querySelectorAll('input[name="' + key + '"]');
                document.querySelector('input[name="' + key + '"]:checked').value = await teleprompter.settings[key];
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
                    element.value = await teleprompter.settings[key];
                    element.onchange = function(event) {
                        this.updateControl(event);
                    }.bind(this);
                }
            } else {
                elements = document.querySelectorAll('input[name="' + key + 'Control"]');
                document.querySelector('input[name="' + key + 'Control"][value="' + (await teleprompter.settings[key] === "true" ? "on": "off") + '"]').checked = true;
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

    async updateQuickConfig() {
        var element;
        for (var key in this.controls) {
            element = document.getElementById(key + "Quick");
            if (element) {
                // Cleaning previous hiddens
                element.classList.remove("hidden");
                if (await teleprompter.settings[key + "Quick"] === "false") {
                    element.classList.add("hidden");
                }
            }

            element = document.getElementById(key + "QuickConfig");
            if (element) {
                element.checked = (await teleprompter.settings[key + "Quick"] === "true");
            }
        }
    }
    
    async updateControl(e) {
        e.preventDefault();
        var id = e.target.id.replace("Control", "");
        var element = document.getElementById(id);
        if (element) {
            teleprompter.settings[id] = e.target.value;
            element.value = await teleprompter.settings[id];
        }
    }

    async updateQuickControl(e) {
        e.preventDefault();
        var id = e.target.id;
        var element = document.getElementById(id + "Control");
        if (element) {
            teleprompter.settings[id] = e.target.value;
            element.value = await teleprompter.settings[id];
        }
    }

    async updateToggleControl(e) {
        e.preventDefault();
        var id = e.target.name.replace("Control", "");
        teleprompter.settings[id] = e.target.value === "on";
        var element = document.querySelector('input[name="' + id + '"][value="' + (await teleprompter.settings[id] === "true" ? "on" : "off") + '"]');
        element.checked = true;
    }

    async updateQuickToggleControl(e) {
        e.preventDefault();
        var id = e.target.name;
        teleprompter.settings[id] = e.target.value === "on";
        var element = document.querySelector('input[name="' + id + 'Control"][value="' + (await teleprompter.settings[id] === "true" ? "on" : "off") + '"]')
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