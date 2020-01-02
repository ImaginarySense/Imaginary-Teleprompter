/*
  Imaginary Teleprompter
  Copyright (C) 2019 Imaginary Sense Inc.

  This file is part of Imaginary Teleprompter.

  Imaginary Teleprompter is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  Imaginary Teleprompter is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with Imaginary Teleprompter.  If not, see <https://www.gnu.org/licenses/>.
*/

'use strict';

// Imports
import Controls from './controls';
import Timeout from './timeout';
import DOMParser from './parser';

export default class Teleprompter {

  constructor( teleprompterIdentifier, settings={} ) {
    console.log("Teleprompter");

    let teleprompter;
    // If pased contents is a string, lookup DOM element.
    if ( typeof contentsIdent === 'string' )
      teleprompter = document.querySelector( teleprompterIdentifier );
    else
      teleprompter = teleprompterIdentifier;
    // Make sure contents is a valid DOM element.
    if ( !( teleprompter && teleprompter.nodeType ) ) {
      console.err( "teleprompter is undefined" );
      return;
    }

    // Initialize properties using attributes from 'settings'. If no setting is found, set default.
    this._teleprompter = teleprompter;
    this._contents = teleprompter.firstElementChild;
    this._overlay = teleprompter.lastElementChild;
    this.overlayFocus = document.getElementById("overlayFocus");

    // For these input values, the range is possitives, greater than 0
    this.speed = Math.abs( settings.speed ) || 2;
    this.acceleration = Math.abs( settings.acceleration ) || 2;
    this.margins = Math.abs( 1-settings.margins ) || 84;
    this.focus = Math.abs( settings.focus ) || 50;

    // Ensure flip is within valid range
    settings.flip = Math.floor( settings.flip );
    this.flip = settings.flip>=0 && settings.flip<4 ? settings.flip : 0;
    
    // On Booleans, make distinction between false and undefined
    this.play = typeof settings.play !== "undefined" ? settings.play : true;
    this.timer = typeof settings.timer !== "undefined" ? settings.timer : true;

    this.plugins = {};
    this.setupPlugins(settings.plugins);
  } // end Constructor

  setupPlugins(plugins) {

    for (const plugin of plugins) {
      this.plugins[ plugin.pluginName ] = new plugin(this, this._contents, this._debug);

      // Initialize plugins
      // if (typeof this.plugins[plugin.pluginName] !== "undefined" && typeof this.plugins[ plugin.pluginName ].init === "function") {
        this.plugins[ plugin.pluginName ].init();
      // }
    }
    console.log("Available plugins", this.plugins);
  }

  start() {
    
    // Parse contents
    // this.parse( this._contents );

    // console.log( this._editor );

    // Run teleprompterStarted hook
    if ( this._context && typeof this._context.teleprompterStarted === "function" ) {
      this._context.teleprompterStarted();
    }
  }

  // // CONTROLS

  // increaseVelocity() {}
  // decreaseVelocity() {}
  // next() {}
  // previous() {}
  // togglePlay() {}
  // play() {}
  // pause() {}
  // stop() {}
  // increaseFont() {}
  // decreaseFont() {}
  // goTo( element ) {}

  // // ANIMATION

  // animate() {}

  // EVENTS

  editorReady() {
    // Make reference to this context.
    const instance = this;

    // Initialize CSS Stylesheet
    // Create style elements.
    var styleElement = document.createElement('style');
    // Append style elements to head.
    document.head.appendChild(styleElement);
    // Grab element's style sheet.
    this.styleSheet = styleElement.sheet;

    // Set initial relative values.
    this.setFocusHeight();
    this.setScreenHeight();
    this.updateUnit();

    // Initialize events

    // Initialize resize event
    if ( typeof ResizeObserver !== "undefined" ) {
      this.resizeTimeout = new Timeout;
      // Copy instant context
      new ResizeObserver( function () { instance.onResize(); } )
        .observe( this._teleprompter );
    }
    // If browser does not support modern ResizeObserver, use a hacky alternative.
    else {
      console.info("Instance resize operations have not yet been implemented for this browser.");
      // new ResizeSensor( this._teleprompter, this.onResize );
    }
    // Lookup: resize implementations at https://stackoverflow.com/questions/6492683/how-to-detect-divs-dimension-changed
  }

  // Resize Event
  onResize( /* event */ ) {
    if ( this._debug ) console.debug( "Resize triggered" );

    // Copy context information
    const teleprompter = this._teleprompter;
    const unit = this.fontUnit;

    // Make changes after an interuptable timeout to increase performance.
    this.resizeTimeout.run( 0.1, function () {

      // Update font size
      teleprompter.style.fontSize = `${unit}px`;

    } );
  } // end onResize

  atEnd() {}

  setScreenHeight( ) {
      this.height = this._overlay.clientHeight;
  }

  setFocusHeight( ) {
    if ( typeof this.overlayFocus !== 'undefined' )
      this.focusHeight = this.overlayFocus.clientHeight;
    else
      this.focusHeight = 0;
  }

  // Update unit and unit related measurements
  updateUnit() {
    this.unit = this.focusHeight/80;
    this.speedLimit = this._limit*this.unit;
    if (this._debug) setTimeout( ()=> { console.log("Unit updated: "+this.unit) && false; });
    // this.resumeAnimation();
  }

  setStill( newPosition ) {
    let position;
    if ( newPosition === undefined )
      position = this.pos;
    else
      pos = newPosition;
    this._teleprompter.style.transform = 'translateY('+position+'px)';
    // prompt.style.transform = 'translateY('+theCurrPos+'px) scale('+(flipH?-1:1)+','+(flipV?-1:1)+')'
    // If animation is running...
    if ( this._teleprompter.classList.contains("move") ) {
      // Stop animation by removing move class.
      this._teleprompter.classList.remove("move");
      // Delete animation rules before setting new ones.
      this.styleSheet.deleteRule(0);
    }
  }

  animate( time, destination, curve ) {
    // If no curve parameter, default to linear. This is the equivalent of a function overload.
    if (this.curve === undefined)
        this.curve = 'linear';
    // Retain current position.
    this.setStill();
    // Set new animation rules.
    this.styleSheet.insertRule('\
        .teleprompter.move {\
            transform: translateY('+destination+'px)) !important;\
            transition: transform '+time+'ms '+curve+';\
    }', 0);
    // transform: translateY('+destination+'px) scale('+(flipH?-1:1)+','+(flipV?-1:1)+') !important;\
    // Prevent race condition in Chrome by requesting for current position (not just transform) before resuming animation.
    hack();

    // Resume animation by re adding the class.
    this._teleprompter.classList.add("move");
    if (this._debug) this.timeout( ()=> { console.log(/*"Curr: "+getCurrPos()+"\n*/"Dest: "+destination+"\nRemTime "+time) && false; }, 0);
  }
  //https://css-tricks.com/controlling-css-animations-transitions-javascript/

  hack() {
    return this._teleprompter.getBoundingClientRect().top;
    // return prompt.offsetTop;
  }

  timeout( delay, cb ) {
    // If a timeout is already executing, reset it.
    if (this._timeout)
      window.clearTimeout(this._timeout);
    // Set: Wait time second before resuming animation
    this._timeout = window.setTimeout(cb, delay);
  }

  // SETTERS

  set context( instance ) { // Actions, Delegate, Responses, .....
    this._context = instance;
  }

  // GETTERS

  get pos() {
    return this._contents.getBoundingClientRect().top;
  }

  get eta() {}
  
  // Get fontSize multiplier unit based on contents width.
  get fontUnit() {
    // fontSize is a hundreth of the outermost contents's size times multiplier.
    const multiplier = 8;
    return multiplier * this._teleprompter.clientWidth / 100;
  }

}

Teleprompter.prototype._x = 0;
Teleprompter.prototype._transitionDelays = 500;
Teleprompter.prototype._transitionDelays = 500;
Teleprompter.prototype._timeoutDelay = 250;
Teleprompter.prototype._inputCapDelay = 100;
Teleprompter.prototype._limit = 2600;
Teleprompter.prototype._debug = true;
