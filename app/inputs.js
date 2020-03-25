/*
  Imaginary Teleprompter
  Copyright (C) 2015, 2019, 2020 Imaginary Sense Inc.

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

export default class Key {

  static register( keys, callback, append) {
    if ( this.prototype._debug ) console.log("Register Keys", keys);
    for ( let i=0; i<keys.length; i++ ) {
      console.log(keys[i]);
      if ( typeof Key.prototype.keys[keys[i]] === 'undefined' )
        Key.prototype.keys[keys[i]] = []
      Key.prototype.keys[keys[i]].push( callback )
    }
  }

}
Key.prototype.keys = [];
Key.prototype._debug = true;

document.onkeydown = function( event ) {
  // Legacy keyCode for compatibillity
  if ( typeof event.key === "undefined" )
    event.key = event.keyCode;
  // Run every method asociated to key in sequence.
  if ( typeof Key.prototype.keys[event.key] !== "undefined" ) {
    if ( Key.prototype._debug ) console.log("Key: "+event.key) && false;
    for ( let i=0; i<Key.prototype.keys[event.key].length; i++ ) {
      Key.prototype.keys[event.key][i]();
    }
  }
  // Prevent arrows and spacebar default action.
  if ([" ","ArrowUp","ArrowDown","PageUp","PageDown"].indexOf(event.key) > -1 && event.preventDefault)
    event.preventDefault();
}
