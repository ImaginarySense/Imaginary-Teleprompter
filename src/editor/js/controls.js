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
        this.controls = [
            'primary',
            'secondary',
            'prompterStyle',
            'focus',
            'speed',
            'acceleration',
            'fontSize',
            'promptWidth',
            'timer'
        ]

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
            'timerQuick': true
        }
        this.quickConfig = this.defaultsQuickConfig;
    }

    draw() {
        this.slider = [
            new Slider("#speed", {}),
            new Slider("#acceleration", {}),
            new Slider("#fontSize", {}),
            new Slider("#promptWidth", {}),
            new Slider("#speedControl", {}),
            new Slider("#accelerationControl", {}),
            new Slider("#fontSizeControl", {}),
            new Slider("#promptWidthControl", {})
        ];
        // Data binding for advanced options
        this.slider[0].on("change", function(input) {
            document.getElementById("speedValue").textContent = parseFloat(Math.round(input.newValue * 10) / 10).toFixed(1);
        });
        this.slider[1].on("change", function(input) {
            document.getElementById("accelerationValue").textContent = parseFloat(Math.round(input.newValue * 100) / 100).toFixed(2);
        });
        this.slider[2].on("change", function(input) {
            document.getElementById("fontSizeValue").textContent = input.newValue;
            updateFont(input.newValue);
        });
        this.slider[3].on("change", function(input) {
            document.getElementById("promptWidthValue").textContent = input.newValue;
            updateWidth(input.newValue);
        });
        this.slider[4].on("change", function(input) {
            document.getElementById("speedControlValue").textContent = parseFloat(Math.round(input.newValue * 10) / 10).toFixed(1);
        });
        this.slider[5].on("change", function(input) {
            document.getElementById("accelerationControlValue").textContent = parseFloat(Math.round(input.newValue * 100) / 100).toFixed(2);
        });
        this.slider[6].on("change", function(input) {
            document.getElementById("fontSizeControlValue").textContent = input.newValue;
            updateFont(input.newValue);
        });
        this.slider[7].on("change", function(input) {
            document.getElementById("promptWidthControlValue").textContent = input.newValue;
            updateWidth(input.newValue);
        });

        var element, elements = [], elementValue, elementChecked, elementSelected;
        for (var i = 0; i < this.controls.length; i++) {
            element = document.getElementById(this.controls[i]);
            if (element && element.value) {
                elementValue = element.value;
                if (element.hasAttribute('data-slider-value')) {
                    element.setAttribute('data-slider-id', i);
                    element.onchange = function(event) {
                        this.updateQuickSliderControl(event);
                    }.bind(this);
                } else {
                    element.onchange = function(event) {
                        this.updateQuickControl(event);
                    }.bind(this);
                }
            } else {
                elements = document.querySelectorAll('input[name="' + this.controls[i] + '"]');
                elementValue = document.querySelector('input[name="' + this.controls[i] + '"]:checked').value;
                for (var j = 0; j < elements.length; j++) {
                    element = elements[j];
                    element.onchange = function(event) {
                        this.updateQuickToggleControl(event);
                    }.bind(this);
                }
            }

            elements = [];
            element = document.getElementById(this.controls[i] + "Control");
            if (element) {
                element.value = elementValue;
                elementValue = undefined;
                if (element.hasAttribute('data-slider-value')) {
                    element.setAttribute('data-slider-id', i);
                    element.onchange = function(event) {
                        this.updateSliderControl(event);
                    }.bind(this);
                } else {
                    element.onchange = function(event) {
                        this.updateControl(event);
                    }.bind(this);
                }
            } else {
                elements = document.querySelectorAll('input[name="' + this.controls[i] + 'Control"]');
                document.querySelector('input[name="' + this.controls[i] + 'Control"][value="' + elementValue + '"]').checked = true;
                elementValue = undefined;

                for (var j = 0; j < elements.length; j++) {
                    element = elements[j];
                    element.onchange = function(event) {
                        this.updateToggleControl(event);
                    }.bind(this);
                }
            }
            
            element = document.getElementById(this.controls[i] + "QuickConfig");
            if (element) {
                element.onchange = function(event) {
                    this.updateQuickControlConfig(event);
                }.bind(this);
            }
        }
    }

    updateQuickConfig(settings) {
        if (settings) {
            var element;
            for (var i = 0; i < this.controls.length; i++) {
                element = document.getElementById(this.controls[i] + "Quick");
                if (element) {
                    // Cleaning previous hiddens
                    element.classList.remove("hidden");
                    if (!settings[this.controls[i] + "Quick"]) {
                        element.classList.add("hidden");
                    }
                }
    
                element = document.getElementById(this.controls[i] + "QuickConfig");
                if (element) {
                    element.checked = settings[this.controls[i] + "Quick"];
                }
            }
            this.quickConfig = settings;
        }
    }
    
    updateControl(e) {
        e.preventDefault();
        var id = e.target.id.replace("Control", "");
        var element = document.getElementById(id);
        if (element) {
            element.value = e.target.value;
        }
    }

    updateQuickControl(e) {
        e.preventDefault();
        var id = e.target.id;
        var element = document.getElementById(id + "Control");
        if (element) {
            element.value = e.target.value;
        }
    }

    updateToggleControl(e) {
        e.preventDefault();
        var id = e.target.name.replace("Control", "");
        var element = document.querySelector('input[name="' + id + '"][value="' + e.target.value + '"]');
        element.checked = true;
    }

    updateQuickToggleControl(e) {
        e.preventDefault();
        var id = e.target.name;
        document.querySelector('input[name="' + id + 'Control"][value="' + e.target.value + '"]').checked = true;
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
        var slide = this.slider[parseInt(index) - 4];
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
        var slide = this.slider[parseInt(index)];
        slide.setValue(this.slider[parseInt(index) - 4].getValue());
        slide._trigger('change', {
            newValue: this.slider[parseInt(index)].getValue()
        });
    }
    
    updateQuickControlConfig(e) {
        e.preventDefault();
        var id = e.target.id.replace("Config", "");
        quickConfig[id] = e.target.checked;
        updatePrompterData();
    }
}