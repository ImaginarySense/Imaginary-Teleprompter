// editor.js

// Import Bootstrap and other CSS files
import './scss/editor.scss';

// Import Bootstrap's JavaScript
import 'bootstrap';
// Bootstrap's optionals
// import 'bootstrap/js/dist/util';
// import 'bootstrap/js/dist/dropdown';

// CKEditor 5 imports
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Autosave from '@ckeditor/ckeditor5-autosave/src/autosave';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
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

// Import Imaginary Teleprompter Library
import Teleprompter from './teleprompter';

// Editor code starts here

class Main {
  // constructor() {
  //   this.teleprompter = new Teleprompter("prompt");
  //   this.teleprompter.action = this;

  //   document.getElementById("startPrompt").addEventListener('click', ()=> {
  //     this.teleprompter.startPrompt();
  //   });
  // }

  // teleprompterStarted() {
  //   console.log("teleprompterStarted");
  // }
}

ClassicEditor
  .create( document.querySelector('#prompter'), {
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
    toolbar: [/*'anchor','|',*/'undo','redo','|',/*'heading','|',*/'bold','italic','underline','strikethrough','|','subscript','superscript','|','FontFamily','FontSize','|','FontColor',/*'FontBackgroundColor',*/'highlight','|','removeFormat','|','numberedList','bulletedList','|','alignment','|','link','|','imageupload','insertTable','|'],
    // fontSize: '0.7 em/0.7em;0.8 em/0.8em;0.9 em/0,9em;1.0 em/1em;1.1 em/1.1em;1.2 em/1.2em;1.3 em/1.3em;1.4 em/1.4em;1.5 em/1.5em;1.6 em/1.6em;1.7 em/1.7em;1.8 em/1.8em;1.9 em/1.9em;2.0 em/2em;2.1 em/2.1em;2.2 em/2.2em;2.3 em/2.3em;2.4 em/2.4em;2.5 em/2.5em;2.6 em/2.6em;2.7 em/2.7em;2.8 em/2.8em;2.9 em/2.9em;3.0 em/3em',
    // line_height: '1 em/1em;1.1 em/1.1em;1.2 em/1.2em;1.3 em/1.3em;1.4 em/1.4em;1.5 em/1.5em;1.6 em/1.6em;1.7 em/1.7em;1.8 em/1.8em;1.9 em/1.9em;2.0 em/2.0em',
    // image: {
      // toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ],
    // },
    autosave: {
      save( editor ) {
          // The saveData() function must return a promise
          // which should be resolved when the data is successfully saved.
          // return saveData( editor.getData() );
      }
    }
  } )
  .then( editor => {
    console.log( 'Editor was initialized', editor );
  } )
  .catch( error => {
    console.error( error.stack );
  } );

new Main();
