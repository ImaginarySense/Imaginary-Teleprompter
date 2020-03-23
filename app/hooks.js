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

export default class Hook {

  static register( name, callback ) {
    if (this.prototype._debug) console.log("Register Hook", name);
    if (typeof Hook.prototype.hooks[name] === 'undefined')
      Hook.prototype.hooks[name] = []
    Hook.prototype.hooks[name].push( callback )
  }

  static call( name, args=[] ) {
    let codes=[];
    if (typeof Hook.prototype.hooks[name] !== 'undefined') {
      if (this.prototype._debug) console.log("Call", name, Hook.prototype.hooks[name]);
      for (let i = 0; i < Hook.prototype.hooks[name].length; ++i) {
        try {
          codes.push( Hook.prototype.hooks[name][i]( args ) );
          if (!/*(*/typeof codes[i] === 'undefined'/* || code === 0 )*/)
            throw `${Hook.prototype.hooks[name]}'s ${Hook.prototype.hooks[name][i]} returned error code ${codes[i]}`;
        } catch (e) {
          console.error(e);
        }
      }
    }
    return codes
  }
}
Hook.prototype.hooks = [];
Hook.prototype._debug = true;
