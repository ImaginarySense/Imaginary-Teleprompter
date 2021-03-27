loadCSS('assets/summernote/summernote-lite.min.css');
loadScript('assets/summernote/summernote-lite.min.js', () => {
    $('#prompt').summernote({
        toolbar: [
            ['style', ['style', 'height']],
            ['font', ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear']],
            ['fontname', ['fontname', 'fontsize', 'fontsizeunit']],
            ['color', ['color', 'forecolor', 'backcolor']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['table', ['table']],
            ['insert', ['link', 'picture', 'hr']],
            ['view', ['fullscreen', 'codeview', 'undo', 'redo', 'help']],
        ],
        fontSizeUnits: ['em'],
        fontSizes: [0.7],//, '0.8', '0.9', '1.0', '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '2.0', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', '2.9', '3.0'],
        lineHeights: ['0.7', '0.8', '0.9', '1.0', '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '2.0', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', '2.9', '3.0']
    });
    $('#prompt').summernote('fontSize', 0.9);
    $('#prompt').summernote('fontSizeUnit', 'em');

    if (typeof callback === "function") {
        callback();
    }
});