var CKEDITOR_BASEPATH = 'assets/ckeditor/';
loadScript('assets/ckeditor/ckeditor.js', () => {
    // Turn off automatic editor creation first.
    CKEDITOR.disableAutoInline = true;
    // Create editor
    CKEDITOR.inline( 'prompt', {
        // To enable source code editing in a dialog window, inline editors require the "sourcedialog" plugin.
        extraPlugins: 'uploadimage,image2,sharedspace,sourcedialog',
        removePlugins: 'floatingspace,maximize,resize',
        sharedSpaces: {
        top: 'toolbar',
        bottom: 'statusbar'
        },
        toolbarGroups: [
        { name: 'document',    groups: [ 'document', 'print', 'mode', 'tools' ] },
        { name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
        { name: 'editing',     groups: [ 'find', 'selection' ] },
        { name: 'insert' },
        { name: 'others' },
        { name: 'colors' },
        { name: 'about' },
        '/',
        { name: 'links' },
        { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
        { name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ] },
        { name: 'styles' }
        ],

        // Remove the redundant buttons from toolbar groups defined above.
        removeButtons: 'Save,Smiley,ShowBlocks,Unlink,Link,Blockquote,CreateDiv,PageBreak,Language,Styles',/*,Styles,Specialchar*/
        // Font sizes
        fontSize_sizes: '0.7 em/0.7em;0.8 em/0.8em;0.9 em/0,9em;1.0 em/1em;1.1 em/1.1em;1.2 em/1.2em;1.3 em/1.3em;1.4 em/1.4em;1.5 em/1.5em;1.6 em/1.6em;1.7 em/1.7em;1.8 em/1.8em;1.9 em/1.9em;2.0 em/2em;2.1 em/2.1em;2.2 em/2.2em;2.3 em/2.3em;2.4 em/2.4em;2.5 em/2.5em;2.6 em/2.6em;2.7 em/2.7em;2.8 em/2.8em;2.9 em/2.9em;3.0 em/3em',
        // Font sizes
        line_height: '1 em/1em;1.1 em/1.1em;1.2 em/1.2em;1.3 em/1.3em;1.4 em/1.4em;1.5 em/1.5em;1.6 em/1.6em;1.7 em/1.7em;1.8 em/1.8em;1.9 em/1.9em;2.0 em/2.0em',
        // Quick tables
        qtRows: 10, // Count of rows
        qtColumns: 10, // Count of columns
        qtBorder: '0', // Border of inserted table
        qtWidth: '100%', // Width of inserted table
        qtCellPadding: '0', // Cell padding table
        qtCellSpacing: '0', // Cell spacing table
    });

    CKEDITOR.on( 'dialogDefinition', function( ev ) {
        var dialogName = ev.data.name;
        var dialogDefinition = ev.data.definition;
        console.log(dialogName);
        if ( dialogName == 'table' ) {
            var info = dialogDefinition.getContents( 'info' );
            console.log(info);      
            info.get( 'txtWidth' )[ 'default' ] = '100%';
            info.get( 'txtBorder' )[ 'default' ] = '0';
            info.get( 'txtRows' )[ 'default' ] = '1';
            info.get( 'txtCols' )[ 'default' ] = '3';
            info.get( 'txtCellSpace' )[ 'default' ] = '0';
            info.get( 'txtCellPad' )[ 'default' ] = '0';
        }
        if ( dialogName == 'iframe' ) {
            var info = dialogDefinition.getContents( 'info' );
            console.log(info);
            info.get( 'width' )[ 'default' ] = '100%';
            info.get( 'height' )[ 'default' ] = '50%';
        }
        if ( dialogName == 'flash' ) {
            var info = dialogDefinition.getContents( 'info' );
            console.log(info);
            info.get( 'width' )[ 'default' ] = '100%';
            info.get( 'height' )[ 'default' ] = '50%';
            info.get( 'hSpace' )[ 'default' ] = '0';
            info.get( 'vSpace' )[ 'default' ] = '0';
        }
        if ( dialogName == 'image2' ) {
            var info = dialogDefinition.getContents( 'info' );
            console.log(info);  
            info.get( 'width' )[ 'default' ] = '100%';
            info.get( 'height' )[ 'default' ] = 'auto';
        }
    });

    CKEDITOR.on('instanceReady', function(event) {
        var editor = event.editor,
        scriptsData = teleprompter.fileManager.getElements();
        if (scriptsData[teleprompter.fileManager.currentElement].hasOwnProperty('data'))
            document.getElementById("prompt").innerHTML = scriptsData[teleprompter.fileManager.currentElement]['data'];
        else
            document.getElementById("prompt").innerHTML = "";

        editor.on('dialogDefinition', function(event) {
            teleprompter.editor.contentEditor.save();
        });

        editor.on('change', function(event) {
            teleprompter.editor.contentEditor.save();
        });

        editor.on('paste', function(event) {
            // event.data.type
            // save();
        });

        editor.on('key', function(event) {
            if (event.key === undefined)
                event.key = event.data.keyCode;
            if (debug) console.log(event.key);
            if (teleprompter.fileManager.instructionsAreLoaded() && -1===[1114129,1114177,1114179,1114121,5570578,1114337,4456466,2228240,91,225,27,112,113,114,115,116,117,118,119,120,121,122,123,45,20,33,34,35,36,37,38,39,40].indexOf(event.key)) {
                window.location = '#sidebarAddElement';
                document.getElementById("inputName").focus();
            } else if (event.key===122 || event.key==="F11") {
                toggleFullscreen();
            } else if (event.key===119 || event.key==="F8") {
                togglePrompter();
            }
            return true;
        });

        editor.on('focus', function() {
            editorFocused = true;
            if (debug) console.log('Editor focused.');
            // save();
        });

        editor.on('blur', function() {
            editorFocused = false;
            if (debug) console.log('Editor out of focus.');
            teleprompter.editor.contentEditor.save();
        });
    });

    teleprompter.editor.contentEditor.getEditorContent = function() {
        return CKEDITOR.instances.prompt.getData()
    }
})