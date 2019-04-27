/*
  Imaginary Teleprompter
  Copyright (C) 2019 Imaginary Sense Inc.

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See theRemote 
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';

// const debug = false;

// Add splice function to String class.
String.prototype.splice = function( idx, rem, str ) {
    return this.slice( 0, idx ) + str + this.slice( idx + Math.abs( rem ) );
};

class DOMParser {

  constructor( source ) {

    // Define clear parsed text container.
    this.clear();

    // If a source was passed to the constructor, parse it.
    if ( source!==undefined )
      this.parse( source );

  }

  parse( source ) {
    this.process( source );
    if ( this._debug ) console.log( this._parsed );
  }

  // Parse source
  process( source ) {
    if ( this._debug ) console.log( source );
    // For each i[j] level DOM element, identify element type and parse accordingly.
    for ( let i=0; i<source.children.length; i++ ) {
      // Move deeper on branch tags.
      if ( ['OL', 'UL', 'TABLE', 'TBODY', 'TR'].indexOf( source.children[i].tagName ) !== -1 )
        this.process( source.children[i] );
      // In case of an image (a leaf tag), extract the ALT text, if available.
      else if ( source.children[i].tagName === 'IMG' && source.children[i].alt ) {
        source.children[i].classList.add( 'sentence' );
        this._parsed.push( { object: source.children[i], text: source.children[i].alt } );
      }
      // Ignore contents from these not true leaf tags. We have already taken care of them on the else case.
      else if ( ['SPAN', 'STRONG', 'EM', 'B', 'I', 'A', 'BOLD', 'ITALIC'].indexOf( source.children[i].tagName ) !== -1 )
        continue;
      // For all other tags, like 'DIV', 'LI', 'TH', 'TD', Angular tags...
      else {
        // Move towards the leaf, then process outwards.
        this.process( source.children[i] );
        this._parsed = this._parsed.concat( this.split( source.children[i] ) );
      }
    }
  }

  // 
  split( object ) {
    // Regex to split sentences. Supports Latin, Greek, Hewbrew and Japanese punctuations.
    const detectSentenceEnding = /(?![A-Z]..?\.)(?![A-Z]?\.)(\S+[.?!;؟。」]["'』]?)\s+/g,
      splitSentence = "$1\n",
      // Extract sentences from the current DOM element
      sentences = object.innerText
        // Use regex to separate sentences using \n
        .replace( detectSentenceEnding, splitSentence )
        // Remove remaining tabs left by innerText and regex
        .replace( /(\t+?)/g,"" )
        // Split text into array of sentences \n 
        .split( '\n' )
        // Remove empty strings
        .filter( Boolean );
    let tempHTML;
    // If DOM object contains only one sentence, add sentence class to object.
    if ( sentences.length===1 ) {
      if ( this._debug ) console.log( sentences.length + " SENTENCE" );
      object.classList.add( 'sentence' );
    }
    // Otherwise, separate each sentence within the object using <span class='sentence'>...</span> tags.
    else {
      // p, indexes position within the current block of HTML code.
      let p=0;
      if ( this._debug ) console.log( sentences.length + " SENTENCES" );
      sentences.map( sentence => {
        // If sentence appears as is in DOM, meaning it contains no other elements inside, add sentence tags to it.
        p = object.innerHTML.indexOf( sentence );
        if ( p !== -1 ) {
          if ( this._debug ) console.log( "SLICE: " + sentence );
          tempHTML = object.innerHTML.replace( sentence, '<span class="sentence">' + sentence + '</span>' );
          if ( this._debug ) console.log( tempHTML );
        }
        // If it contains elements, add tags to the left and right of the sentence's beginning and ending.
        else {
          // FLAWED LOGIC
          // Visual reference: -9 0s-8 1e-7 2n-6 3t-5 4e-4 5n-3 6c-2 7e-1 8
          // let i=0, j=0, previousSlice="", currentSlice="";
          // for ( i=0; i<sentence.length; i++ )
          /*
          for ( i=1; i<=sentence.length; i++ ) {
            previousSlice = currentSlice;
            currentSlice = sentence.slice( 0, i );
            if ( object.innerHTML.indexOf( currentSlice ) === -1 ) {
              if (debug) console.log( "SLICE BEGINING: " + previousSlice );
              tempHTML = object.innerHTML.replace( previousSlice, '<span class="sentence">'+previousSlice );
              if (debug) console.log( tempHTML );
              break;
            }
            // if (debug) console.log( currentSlice );
          }
          for ( j=sentence.length-1; j>i; j-- ) {
            previousSlice = currentSlice;
            currentSlice = sentence.slice( j );
            if ( tempHTML.indexOf( currentSlice ) === -1 ) {
              if (debug) console.log( "SLICE ENDING: " + previousSlice );
              tempHTML = tempHTML.replace( previousSlice, previousSlice + '</span>' );
              if (debug) console.log( tempHTML );
              break;
            }
            // if (debug) console.log( currentSlice );
          }
          */
        }
        // Replace DOM's HTML
        object.innerHTML = tempHTML;
      } );
    }
    return sentences;
  }

  // Clear parsing
  clear() {
    // Clear container for parsed text.
    this._parsed = [];
  }

}

DOMParser.prototype._debug = false;

export default DOMParser;
