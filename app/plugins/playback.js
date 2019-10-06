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

// Imaginary Teleprompter Playback Plugin
export default class Playback extends Plugin {

  static get pluginName() {
    return 'Playback';
  }

  constructor(teleprompter, contents, debug) {
    // Set context
    super(teleprompter, contents, debug);
    
    // Plugin public commands
    this.commands = {
      play: this.play,
      pause: this.pause,
      togglePlayback: this.playback,
      increaseVelocity: this.increaseVelocity,
      decreaseVelocity: this.decreaseVelocity,
      fastForward: this.fastForward,
      rewind: this.rewind
    };
  }

  init() {
    if (this._debug) console.log(`Initializing ${Playback.pluginName}`);

    // Test: Access another plugin's space from another plugin.
    // this.teleprompter.plugins.Mirror.commands.mirror(1);
    // Status, bad implementation.
  }

  play() {
    if (this._debug) console.log('Play');
  }

  pause () {
    if (this._debug) console.log('Pause');
  }

  togglePlayback () {
    if (this._debug) console.log('Toggle Playback');
  }

  increaseVelocity() {
    if (this._debug) console.log('Increase Velocity');
  }

  decreaseVelocity() {
    if (this._debug) console.log('Decrease Velocity');
  }

  fastForward() {
    if (this._debug) console.log('Fast Forward');
  }

  rewind() {
    if (this._debug) console.log('Rewind');
  }

}
