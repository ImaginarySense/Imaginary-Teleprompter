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

// CKEditor 5 imports
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Autosave from '@ckeditor/ckeditor5-autosave/src/autosave';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import DecoupledEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Font from '@ckeditor/ckeditor5-font/src/font';
// import FontFamilyConfig from '@ckeditor/ckeditor5-font/src/font';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import Table from '@ckeditor/ckeditor5-table/src/table';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';

// Import Abstracted Editor Library
import Editor from './editor';

class CKEditorImplementation extends Editor {
  constructor() {
    
    super();

    // Initialize CKEditor 5 class
    DecoupledEditor.create( this.teleprompter.firstElementChild, {
      plugins: [
        Alignment,
        // Autosave,
        Bold,
        Essentials,
        Font,
        Heading,
        Highlight,
        Image,
        ImageUpload,
        Italic,
        Link,
        List,
        Paragraph,
        PasteFromOffice,
        RemoveFormat,
        Strikethrough,
        Subscript,
        Superscript,
        Table,
        Underline,
        Undo
      ],
      toolbar: {
        items: [ /*'anchor', '|', */'undo', 'redo', '|', /*'heading', '|', */'bold', 'italic', 'underline', 'strikethrough', '|', 'subscript', 'superscript', '|', 'FontFamily', 'FontSize', '|', 'FontColor', /*'FontBackgroundColor', */'highlight', '|', 'removeFormat', '|', 'numberedList', 'bulletedList', '|', 'alignment', '|', 'link', '|', /*'imageupload', */'insertTable', '|' ]
      },
      alignment: {
        options: [ 'center', 'left', 'right' ]
      },
      fontSize: {
        options: [ '0.75', '0.80', '0.85', '0.90', '0.95', '1.00', '1.05', '1.10', '1.15', '1.20', '1.25', '1.30', '1.35', '1.40', '1.45', '1.50', '1.55', '1.60', '1.65', '1.70', '1.75', '1.80', '1.85', '1.90', '1.95', '2.00' ],
        unit: 'em'
      },
      // lineHeight: {
      //   options: [ '1.0', '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '2.0' ],
      //   unit: 'em'
      // },
      image: {
        toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ],
      },
      autosave: {
        save( editor ) {
          // The saveData() function must return a promise
          // which should be resolved when the data is successfully saved.
          // return saveData( editor.getData() );
        }
      }
    } )
    // Editor created event passing editor object
    .then( editor => {
      // Assign toolbar element to DOM container.
      document.getElementById( "toolbar" ).appendChild( editor.ui.view.toolbar.element );      
      // Reference editor object from editor class.
      // this._teleprompter._editor = editor;
      // this._editor = editor;
      console.log( "Ready?" );
      // On editor ready, lazy load teleprompter related code.
      this._teleprompter.editorReady();
      console.log( "Done!" );
    } )
    .catch( error => {
      console.error( error.stack );
    } );

  } // End editor implemetation

}

new CKEditorImplementation();
