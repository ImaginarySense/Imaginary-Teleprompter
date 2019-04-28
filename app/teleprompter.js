/*
  Imaginary Teleprompter
  Copyright (C) 2019 Imaginary Sense Inc.

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See theRemote 
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';

import DOMParser from './parser';
import Timeout from './timeout';

class Teleprompter extends DOMParser {

  constructor( teleprompterIdentifier, settings={} ) {

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

    // Initialize parser.
    super();

    // Set contents.

    // Initialize properties using attributes from 'settings'. If no setting is found, set default.
    this._teleprompter = teleprompter;
    this._contents = teleprompter.firstElementChild;

    // For these input values, the range is possitives, greater than 0
    this.speed = Math.abs( settings.speed ) || 2;
    this.acceleration = Math.abs( settings.acceleration ) || 2;
    this.width = Math.abs( settings.width ) || 84;
    this.focus = Math.abs( settings.focus ) || 50;

    // Ensure flip is within valid range
    settings.flip = Math.floor( settings.flip );
    this.flip = settings.flip>=0 && settings.flip<4 ? settings.flip : 0;
    
    // On Booleans, make distinction between false and undefined
    this.play = typeof settings.play !== "undefined" ? settings.play : true;
    this.timer = typeof settings.timer !== "undefined" ? settings.timer : true;

  } // end Constructor

  editorReady() {
    // Make reference to this context.
    const instance = this;

    // Initialize events

    // Initialize resize event
    // If browser does not support modern ResizeObserver, use a hacky alternative.
    if ( typeof ResizeObserver === "undefined" ) {
      console.err("Instance resize operations have not yet been implemented for this browser.");
      // new ResizeSensor( this._teleprompter, this.onResize );
    }
    // If otherwise, use the modern ResizeObserver.
    else {
      this.resizeTimeout = new Timeout;
      // Copy instant context
      new ResizeObserver( function () { instance.onResize(); } )
        .observe( this._teleprompter );
    }
    // Resize implementations: https://stackoverflow.com/questions/6492683/how-to-detect-divs-dimension-changed
  }

  // Resize Event
  onResize( /* event */ ) {
    if ( this._debug ) console.log( "Resize" );

    // Copy context information
    const teleprompter = this._teleprompter;
    const unit = this.fontUnit;

    // Make changes after an interuptable timeout to increase performance.
    this.resizeTimeout.run( 50, function () {

      // Update font size
      teleprompter.style.fontSize = `${unit}px`;

    } );
  } // end onResize

  startPrompt() {
    
    // Parse contents
    // this.parse( this._contents );

    console.log( this._editor );
    console.log( this.fontUnit );

    // Do prompting stuff
    if ( this._action && typeof this._action.teleprompterStarted === "function" ) {
      this._action.teleprompterStarted();
    }
  }

  set action( instance ) { //Actions, Delegate, Responses, .....
    this._action = instance;
  }

  increaseVelocity() {}
  decreaseVelocity() {}
  next() {}
  previous() {}
  togglePlay() {}
  play() {}
  pause() {}
  stop() {}
  animate() {}
  increaseFont() {}
  decreaseFont() {}
  goTo( element ) {}
  get eta() {}
  atEnd() {}
  
  // Get fontSize multiplier unit based on contents width.
  get fontUnit() {
    // fontSize is a hundreth of the outermost contents's size times multiplier.
    const multiplier = 8;
    return multiplier * this._teleprompter.clientWidth / 100;
  }

}

Teleprompter.prototype._transitionDelays = 500;
Teleprompter.prototype._transitionDelays = 500;
Teleprompter.prototype._timeoutDelay = 250;
Teleprompter.prototype._inputCapDelay = 100;
Teleprompter.prototype._limit = 2600;
Teleprompter.prototype._debug = true;

export default Teleprompter;
