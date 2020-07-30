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

// Imaginary Teleprompter Start and End Anchors Plugin
export default class StartAndEndAnchors extends Plugin {
// export default class StartAndEndAnchors {

  // Plugin Name
  static get pluginName() {
    return 'Start and End Anchors';
  }

  constructor(teleprompter, contents, debug) {
    // Set context
    super(teleprompter, contents, debug);
    // Set name
    this.pluginName = 'Start and End Anchors';
    // // Plugin's public commands
    // this.commands = {
    //   mirror: this.mirror
    // };
  }

  init() {
    if (this._debug) console.log(`Initializing ${Mirror.pluginName}`);
    // window.setTimeout( ()=> {
      // console.log("PROMPT HOOK RUNS");
      // Hook.call( 'prompt', [ ] );
    // }, 10000);
  }

}
Mirror.prototype._debug = true;
