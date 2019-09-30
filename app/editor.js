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

// Import Bootstrap and other CSS files
import './scss/editor.scss';
// Import Bootstrap's JavaScript
import 'bootstrap';
// Bootstrap's optionals
// import 'bootstrap/js/dist/util';
// import 'bootstrap/js/dist/dropdown';

// Import Imaginary Teleprompter Library
import Teleprompter from './teleprompter';

// Editor code starts here

class Editor {

  constructor() {
    // Get teleprompter element
    let teleprompter = document.getElementsByClassName( "teleprompter" )[0];
    
    // Initialize Teleprompter object
    this._teleprompter = new Teleprompter( teleprompter );
    this._teleprompter.context = this;

    // Assign UI event actions
    document.getElementById( "start" ).addEventListener( "click", ()=> {
      this._teleprompter.startPrompting();
    } );
  }

  enterEditMode() {
    console.debug("Entering Edit Mode");
  }

  leaveEditMode() {
    console.debug("Leaving Edit Mode");
  }

  enterWYSIWYGMode() {
    console.debug("Entering Edit Mode");
  }

  leaveWYSIWYGMode() {
    console.debug("Leaving Edit Mode");
  }

  teleprompterStarted() {
    console.log( "teleprompterStarted" );
  }

}

Editor.prototype._editMode = true;
Editor.prototype._WYSIWYG = true;

export default Editor;
