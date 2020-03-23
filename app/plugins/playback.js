/*
  Imaginary Teleprompter
  Copyright (C) 2019, 2020 Imaginary Sense Inc.

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
    // Key.register( ['F2'], ()=> { this.prompt(); } );
    Key.register( [' ', 32], ()=> { Hook.call( 'togglePlayback' ); } );
    Key.register( ['s', 'S', 'ArrowDown', 40, 68], ()=> { Hook.call( 'increaseVelocity' ); } );
    Key.register( ['w', 'W', 'ArrowUp', 38, 87], ()=> { Hook.call( 'decreaseVelocity' ); } );
    Key.register( ['d', 'D', 'ArrowRight', 39, 83], ()=> { this.fastForward(); } );
    Key.register( ['a', 'A', 'ArrowLeft', 37, 65], ()=> { this.rewind(); } );
    // 
    Hook.register( 'togglePlayback', ()=> { this.togglePlayback(); } );
    Hook.register( 'increaseVelocity', ()=> { this.increaseVelocity(); } );
    Hook.register( 'decreaseVelocity', ()=> { this.decreaseVelocity(); } );
    Hook.register( 'stop', ()=> { this.stop(); } );
    // 
    // Hook.register( 'prompt', ()=> { this.prompt(); } );
    // Hook.register( 'play', ()=> { this.play(); } );
    // Hook.register( 'pause', ()=> { this.pause(); } );
    // Hook.register( 'fastForward', ()=> { this.fastForward(); } );
    // Hook.register( 'rewind', ()=> { this.rewind(); } );
  }

  stop ( ...args ) {
    // if (this._debug) console.log('Stop');
    this.teleprompter.stop();
  }
  
  prompt( ...args ) {
    if (this._debug) console.log('Prompt');
    this.teleprompter.start();
    Hook.call( 'onPromptStart', [ ] );
  }

  play( ...args ) {
    // if (this._debug) console.log('Play');
    this.teleprompter.play();
    Hook.call( 'onPlay', [ ] );
  }

  pause ( ...args ) {
    // if (this._debug) console.log('Pause');
    this.teleprompter.pause();
    Hook.call( 'onPause', [ ] );
  }

  togglePlayback () {
    // if (this._debug) console.log('Toggle Playback');
    this.teleprompter.togglePlayback();
    Hook.call( 'onTogglePlayback', [ ] );
  }

  increaseVelocity() {
    if (this._debug) console.log('Increase Velocity');
    this.teleprompter.increaseVelocity();
    Hook.call( 'onVelocityIncrease', [ ] );
  }

  decreaseVelocity() {
    if (this._debug) console.log('Decrease Velocity');
    this.teleprompter.decreaseVelocity();
    Hook.call( 'onVelocityDecrease', [ ] );
  }

  fastForward() {
    if (this._debug) console.log('Fast Forward');
    Hook.call( 'onFastForward', [ ] );
  }

  rewind() {
    if (this._debug) console.log('Rewind');
    Hook.call( 'onRewindForward', [ ] );
  }

}
Playback.prototype._debug = true;
