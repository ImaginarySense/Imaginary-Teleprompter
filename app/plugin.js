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

// Imaginary Teleprompter Mirror Plugin
export default class Plugin {

  // Plugin Name
  static get pluginName() {
    return 'Unnamed';
  }

  constructor(teleprompter, contents, debug) {
    this.teleprompter = teleprompter;
    this.contents = contents;
    this._debug = debug;
  }

  init() {
    if (this._debug) console.log(`Initializing ${Plugin.pluginName}`);
  }

}

Plugin.prototype._debug = true;
