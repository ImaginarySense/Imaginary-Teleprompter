/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';

	config.allowedContent = true;
	config.pasteFromWordPromptCleanup = false;
	config.pasteFromWordRemoveFontStyles = false; // deprecated
	// config.pasteFromWordRemoveStyles = false;
	
};

// Import fonts
// const SomeNameFontFace = new FontFace("SomeName", 'url(/path/font.ttf)');
// document.fonts.add(SomeNameFontFace);
// SomeNameFontFace.loaded.then((fontFace) => {
// 	// This is where you can declare a new font-family, because the font is now loaded and ready.  
// 	console.info('Current status', fontFace.status);
// 	console.log(fontFace.family, 'loaded successfully.');
// 	// Throw an error if loading wasn't successful

// }, (fontFace) => {
// 	console.error('Current status', fontFace.status);
// });
// SomeNameFontFace.load();


// Add system fonts to CKEditor
if (navigator.userAgent.indexOf("Electron") != -1) {
	const getSystemFonts = require('get-system-fonts');
	const path = require('path');
	
	async function loadEditorConfig() {
		// In an async function...
		const files = await getSystemFonts();
	
		var fonts = [];
		for (var i = 0; i < files.length; i++) {
			let fontName = path.parse(files[i]).name.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g).join(' ');
			fonts.push(fontName);
		}
	
		fonts = fonts.join(';');
	
		CKEDITOR.config.font_names = fonts;
	
	}
	
	loadEditorConfig();
}





