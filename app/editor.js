//main.js

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';

import Teleprompter from './teleprompter';

class Main {
  constructor() {
    this.teleprompter = new Teleprompter("prompt");
    this.teleprompter.action = this;

    document.getElementById("startPrompt").addEventListener('click', ()=> {
      this.teleprompter.startPrompt();
    });
  }

  teleprompterStarted() {
    console.log("teleprompterStarted");
  }
}

ClassicEditor
  .create( document.querySelector( '#editor' ), {
    plugins: [
      Essentials,
      Paragraph,
      Bold,
      Italic,
      Strikethrough,
      Subscript,
      Superscript,
      Underline
      // AutoformatPlugin,
      // HeadingPlugin,
      // LinkPlugin,
      // ListPlugin,
      // ParagraphPlugin
    ],
    toolbar: [ 'bold', 'italic', 'underline', 'strikethrough', '|', 'subscript', 'superscript' ]
  } )
  .then( editor => {
    console.log( 'Editor was initialized', editor );
  } )
  .catch( error => {
    console.error( error.stack );
  } );

new Main();