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

// Imaginary Teleprompter Mirror Plugin
export default class Mirror extends Plugin {
// export default class Mirror {

  // Plugin Name
  static get pluginName() {
    return 'Mirror';
  }

  // Flips
  static get noFlip() {
    return 0;
  }
  static get horizontalFlip() {
    return 1;
  }
  static get verticalName() {
    return 2;
  }
  static get doubleFlip() {
    return 3;
  }

  constructor(teleprompter, contents, debug) {
    // Set context
    super(teleprompter, contents, debug);
    // Set name
    this.pluginName = 'Mirror';
    // // Plugin's public commands
    // this.commands = {
    //   mirror: this.mirror
    // };
  }

  init() {
    if (this._debug) console.log(`Initializing ${Mirror.pluginName}`);
    Hook.call( 'pause', [ ] );
    Hook.call( 'play', [ ] );
  }

  mirror(flip) {
    if (this._debug) console.log('Set Mirror');
    let res;
    switch (flip) {
      case Mirror.noFlip:
        if (this._debug) console.log('No flip');
        this.unsetMirror();
        res = Mirror.noFlip;
        break;
      case Mirror.horizontalFlip:
        res = this.horizontalFlip();
        break;
      case Mirror.verticalName:
        res = this.verticalFlip();
        break;
      case Mirror.doubleFlip:
        res = this.doubleFlip();
        break;
      default:
        if (this._debug) console.log('Unknown flip mode.');
        res = -1;
    }
    return ret;
  }

  unsetMirror() {
    if (this._debug) console.log('Unsetting previous flip');
  }

  horizontalFlip() {
    if (this._debug) console.log('Horizontal flip');
    this.unsetMirror();
  }
  
  verticalFlip() {
    if (this._debug) console.log('Vertical flip');
    this.unsetMirror();
  }

  doubleFlip() {
    if (this._debug) console.log('Double flip');
    this.unsetMirror();
  }

}
Mirror.prototype._debug = true;
