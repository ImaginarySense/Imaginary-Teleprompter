const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const uglifycss = require('gulp-uglifycss');
const del = require('del');
const fs = require('fs');

// Example code taken from
// build-number-generator from Ferdinand Prantl
// https://github.com/prantlf/build-number-generator
///////////////////////////////////////////////////
function getBuildStamp () {
    const now = new Date()
    const year = now.getFullYear() % 100
    const month = now.getMonth() + 1
    const day = now.getDate()
    // Count 2-minute intervals elapsed since midnight:(HH * 60 + MM) / 2
    const counter = parseInt((now.getHours() * 60 + now.getMinutes()) / 2)
    // Format the stamp as YYMMDDCCC
    return `${pad2(year)}${pad2(month)}${pad2(day)}${pad3(counter)}`
}
function pad2 (value) {
    return value > 9 ? `${value}` : `0${value}`
}
function pad3 (value) {
    return value > 99 ? `${value}` : value > 9 ? `0${value}` : `00${value}`
} 
///////////////////////////////////////////////////
gulp.task('revision', function() {
    return new Promise((resolve, reject) => {
        fs.readFile('./package.json', (err, data) => {
            if (err) throw err;
        
            var package = JSON.parse(data);
            package.revision = getBuildStamp();
            package = JSON.stringify(package, null, 2);
        
            fs.writeFile('./package.json', package, (err) => {
                if (err) throw err;
                resolve();
            });
        });
    });
});

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
        // .pipe(uglify().on('error', ()=>{}))
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
    return gulp.src(['./src/electron/main.js', './src/electron/router.js', './src/electron/teleprompter.js', './src/electron/handler.js', './src/electron/settings.js', './package.json'])
        .pipe(gulp.dest('./dist'));
});

gulp.task('default', 
    gulp.series(
        'revision',
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