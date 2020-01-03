/*
  Imaginary Teleprompter
  Copyright (C) 2020 Imaginary Sense Inc.

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

import Plugin from '../plugin';
import Hook from '../hooks';
import Key from '../inputs';

// Imaginary Teleprompter Animate Plugin
export default class Animate extends Plugin {
// export default class Animate {

  static get pluginName() {
    return 'Animate';
  }

  constructor(teleprompter, contents, debug) {
    // Set context
    super(teleprompter, contents, debug);
    
    // Plugin public commands
    this.pluginName = "Animate"
  }

  init() {
    if (this._debug) console.log(`Initializing ${Animate.pluginName}`);
    // 
    Hook.register( 'play', ()=> { this.play(); } );
    Hook.register( 'pause', ()=> { this.pause(); } );
    // Hook.register( 'togglePlayback', ()=> { this.playback(); } );
    Hook.register( 'increaseVelocity', ()=> { this.increaseVelocity(); } );
    Hook.register( 'decreaseVelocity', ()=> { this.decreaseVelocity(); } );
    Hook.register( 'fastForward', ()=> { this.fastForward(); } );
    Hook.register( 'rewind', ()=> { this.rewind(); } );
  }

  play( ...args ) {
    console.log('Play');
    // this.togglePlayback();
    // if (this._debug) console.log('Play');
    Hook.call( 'onPlay', [ ] );
  }

  pause ( ...args ) {
    console.log('Pause');
    // this.togglePlayback();
    // if (this._debug) console.log('Pause');
    Hook.call( 'onPause', [ ] );
  }

  togglePlayback () {
    console.log('Toggle Playback');
    // if (this._debug) console.log('Toggle Playback');
  }

  increaseVelocity() {
    console.log('Increase Velocity');
    // if (this._debug) console.log('Increase Velocity');
    Hook.call( 'onVelocityIncrease', [ ] );
  }

  decreaseVelocity() {
    console.log('Decrease Velocity');
    // if (this._debug) console.log('Decrease Velocity');
    Hook.call( 'onVelocityDecrease', [ ] );
  }

  fastForward() {
    console.log('Fast Forward');
    // if (this._debug) console.log('Fast Forward');
    Hook.call( 'onFastForward', [ ] );
  }

  rewind() {
    console.log('Rewind');
    // if (this._debug) console.log('Rewind');
    Hook.call( 'onRewindForward', [ ] );
  }

}
Animate.prototype._debug = true;
