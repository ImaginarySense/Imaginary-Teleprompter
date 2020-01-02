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

import Plugin from '../plugin';
import Hook from '../hooks';
import Key from '../inputs';

// Imaginary Teleprompter Playback Plugin
export default class Playback extends Plugin {
// export default class Playback {

  static get pluginName() {
    return 'Playback';
  }

  constructor(teleprompter, contents, debug) {
    // Set context
    super(teleprompter, contents, debug);
    
    // Plugin public commands
    this.pluginName = "Playback"
    // this.commands = {
    //   play: this.play,
    //   pause: this.pause,
    //   togglePlayback: this.playback,
    //   increaseVelocity: this.increaseVelocity,
    //   decreaseVelocity: this.decreaseVelocity,
    //   fastForward: this.fastForward,
    //   rewind: this.rewind
    // };
  }

  init() {
    if (this._debug) console.log(`Initializing ${Playback.pluginName}`);
    // 
    Key.register( [' ', 32], this.togglePlayback );
    Key.register( ['s', 'S', 'ArrowDown', 40, 68], this.increaseVelocity );
    Key.register( ['w', 'W', 'ArrowUp', 38, 87], this.decreaseVelocity );
    Key.register( ['d', 'D', 'ArrowRight', 39, 83], this.fastForward );
    Key.register( ['a', 'A', 'ArrowLeft', 37, 65], this.rewind );
    // 
    Hook.register( 'play', ()=> { this.play(); } );
    Hook.register( 'pause', ()=> { this.pause(); } );
    Hook.register( 'togglePlayback', ()=> { this.playback(); } );
    Hook.register( 'increaseVelocity', ()=> { this.increaseVelocity(); } );
    Hook.register( 'decreaseVelocity', ()=> { this.decreaseVelocity(); } );
    Hook.register( 'fastForward', ()=> { this.fastForward(); } );
    Hook.register( 'rewind', ()=> { this.rewind(); } );
  }

  play( ...args ) {
    console.log('Play');
    this.togglePlayback();
    // if (this._debug) console.log('Play');
    Hook.call( 'onPlay', [ ] );
  }

  pause ( ...args ) {
    console.log('Pause');
    this.togglePlayback();
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
Playback.prototype._debug = true;
