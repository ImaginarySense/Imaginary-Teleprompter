const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const uglifycss = require('gulp-uglifycss');
var del = require('del');

gulp.task('clean', function() {
    return del(['./dist']);
});

gulp.task('copy:files', function() {
    return gulp.src(['resources/**/*']).pipe(gulp.dest('./dist'));
});

gulp.task('editor:css', function() {
    return gulp.src(['./src/editor/css/*.css', '!./src/editor/css/reset.css'])
        .pipe(concat({ path: 'teleprompter-editor.css', stat: { mode: 0666 }}))
        .pipe(uglifycss({ "uglyComments": true }))
        .pipe(gulp.dest('./dist/assets/custom/css'));
});

gulp.task('editor:js', function() {
    return gulp.src(['./src/editor/js/*.js', '!./src/editor/js/editor.js', './src/editor/js/editor.js'])
        .pipe(concat('teleprompter-editor.js'))
        .pipe(uglify().on('error', ()=>{}))
        .pipe(gulp.dest('./dist/assets/custom/js'));
});

gulp.task('prompter:css', function() {
    return gulp.src(['./src/prompter/css/*.css'])
        .pipe(concat({ path: 'teleprompter-prompter.css', stat: { mode: 0666 }}))
        .pipe(uglifycss({ "uglyComments": true }))
        .pipe(gulp.dest('./dist/assets/custom/css'));
});

gulp.task('prompter:js', function() {
    return gulp.src(['./src/editor/js/commandsMapping.js', './src/prompter/js/*.js'])
        .pipe(concat('teleprompter-prompter.js'))
        // .pipe(uglify().on('error', ()=>{}))
        .pipe(gulp.dest('./dist/assets/custom/js'));
});

gulp.task('universal:css', function() {
    return gulp.src(['./src/universal/css/*.css'])
        .pipe(concat({ path: 'teleprompter-universal.css', stat: { mode: 0666 }}))
        .pipe(uglifycss({ "uglyComments": true }))
        .pipe(gulp.dest('./dist/assets/custom/css'));
});

gulp.task('universal:js', function() {
    return gulp.src(['./src/universal/js/universal.js', './src/universal/js/*.js'])
        .pipe(concat('teleprompter-universal.js'))
        // .pipe(uglify().on('error', ()=>{}))
        .pipe(gulp.dest('./dist/assets/custom/js'));
});

gulp.task('electron:js', function() {
    return gulp.src(['./src/main.js', './package.json'])
        .pipe(gulp.dest('./dist'));
});

gulp.task('default', 
    gulp.series(
        'clean',
        'copy:files',
        'editor:css',
        'editor:js',
        'prompter:css',
        'prompter:js',
        'universal:css',
        'universal:js',
        'electron:js'
    )
);