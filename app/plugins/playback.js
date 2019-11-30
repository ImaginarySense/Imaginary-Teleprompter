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
    Hook.register( 'pause', this.pause );
    Hook.register( 'play', this.play );
  }

  play( ...args ) {
    console.log('Play');
    // if (this._debug) console.log('Play');
    return 0;
  }

  pause ( ...args ) {
    console.log('Pause');
    // if (this._debug) console.log('Pause');
    return 0;
  }

  togglePlayback () {
    console.log('Toggle Playback');
    // if (this._debug) console.log('Toggle Playback');
    return 0;
  }

  increaseVelocity() {
    console.log('Increase Velocity');
    // if (this._debug) console.log('Increase Velocity');
    return 0;
  }

  decreaseVelocity() {
    console.log('Decrease Velocity');
    // if (this._debug) console.log('Decrease Velocity');
    return 0;
  }

  fastForward() {
    console.log('Fast Forward');
    // if (this._debug) console.log('Fast Forward');
    return 0;
  }

  rewind() {
    console.log('Rewind');
    // if (this._debug) console.log('Rewind');
    return 0;
  }

}
Playback.prototype._debug = true;
