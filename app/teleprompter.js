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

import DOMParser from './parser.js';

class Teleprompter extends DOMParser {

  constructor( containerIdent, settings={} ) {

    // If pased container is a string, lookup DOM element.
    let container;
    if ( typeof containerIdent === 'string' ) {
      container = document.getElementById( containerIdent );
    }
    // Make sure container is a valid DOM element.
    if ( !( container && container.nodeType ) ) {
      console.err( "container is undefined" );
      return;
    }

    // Initialize parser.
    super();

    // Set container.
    this._container = container;

    // SETUP instance using settings attributes. If invalid setting found, set default
    // For these input values, the range is possitives, greater than 0
    this.speed = Math.abs( settings.speed ) || 2;
    this.acceleration = Math.abs( settings.acceleration ) || 2;
    this.width = Math.abs( settings.width ) || 84;
    this.focus = Math.abs( settings.focus ) || 50;
    // Ensure flip is within valid range
    settings.flip = Math.floor( settings.flip );
    this.flip = settings.flip>=0 && settings.flip<4 ? settings.flip : 0;
    // On Booleans, make distinction between false and undefined
    this.play = settings.play!==undefined ? settings.play : true;
    this.timer = settings.timer!==undefined ? settings.timer : true;
  } // end Constructor

  startPrompt() {
    
    // Parse contents
    // this.parse( this._container );

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
  
  // Get fontSize multiplier unit based on container width.
  get fontUnit() {
    // fontSize is a hundreth of the outermost container's size times multiplier.
    const multiplier = 5;
    return multiplier * this._container.clientWidth / 100;
  }

}

Teleprompter.prototype._transitionDelays = 500;
Teleprompter.prototype._transitionDelays = 500;
Teleprompter.prototype._timeoutDelay = 250;
Teleprompter.prototype._inputCapDelay = 100;
Teleprompter.prototype._limit = 2600;
Teleprompter.prototype._debug = true;

export default Teleprompter;
