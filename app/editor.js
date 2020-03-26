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

// Import Bootstrap and other CSS files
import './scss/editor.scss';
// Import Bootstrap's JavaScript
import 'bootstrap';
// Bootstrap's optionals
// import 'bootstrap/js/dist/util';
// import 'bootstrap/js/dist/dropdown';

// Import Imaginary Teleprompter Library
import Teleprompter from './teleprompter';
import Hook from './hooks';
import Key from './inputs';

// Editor code starts here

export default class Editor {

  constructor(settings) {
    console.log("Editor");
    // Get teleprompter element
    this.domObject = document.getElementsByClassName( "teleprompter" )[0];
    this.toolbar = document.getElementById( "toolbar" );
    this.siteTop = document.getElementById( "siteTop" );
    this.tabs = document.getElementById( "tabsContent" );
    
    this.WYSIWYG = true;

    // Initialize Teleprompter object
    this._teleprompter = new Teleprompter( this.domObject, settings );
    this._teleprompter.context = this;

    // // Assign UI event actions
    // document.getElementById( "start" ).addEventListener( "click", ()=> {
    //   this._teleprompter.start();
    // } );

    // Keyboard event actions
    Key.register( ['F2'], ()=> { this.toggleEditMode(); } );
  }

  toggleEditMode() {
    if (this.edit)
      this.leaveEditMode();
    else
      this.enterEditMode();
  }

  leaveEditMode() {
    console.debug("Leaving Edit Mode");
    // Remove toolbar
    this.WYSIWYG = true;
    this.edit = false;
    // this.siteTop.classList.add('hidden');
    // this.tabs.classList.add('hidden');
    // this.toolbar.parentElement.classList.add('hidden');
    // this.toolbar.parentElement.style.position = 'fixed';
    // // this.toolbar.textContent = '';
    // // this._editor.destroy()
    // //   .catch( error => {
    // //       console.log( error );
    // //   } );
  }

  enterEditMode() {
    console.debug("Entering Edit Mode");
    // Remove previous toolbar before creating new one
    this.edit = true;
    // this.siteTop.classList.remove('hidden');
    // this.tabs.classList.remove('hidden');
    // this.toolbar.parentElement.classList.remove('hidden');
    // // document.getElementById( "toolbar" ).textContent = '';
    // // this.instantiateEditor();
  }

  enterWYSIWYGMode() {
    console.debug("Entering Edit Mode");
    this.edit = true;
    this.WYSIWYG = true;
  }

  leaveWYSIWYGMode() {
    console.debug("Leaving Edit Mode");
    this.edit = true;
    this.WYSIWYG = false;
  }

  teleprompterStarted() {
    console.log( "teleprompterStarted" );
  }

}
