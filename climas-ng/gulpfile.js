var gulp = require('gulp');
var gutil = require('gulp-util');

// using gulp-load-plugins to save having to load everything separately
// info: https://github.com/jackfranklin/gulp-load-plugins
var plugins = require('gulp-load-plugins')();


// -------------------------------------- show all the loaded plugins
gulp.task('plugins', function(){
    console.log('Loaded Plugins:');
    Object.keys(plugins).forEach( function(key) {
        console.log('    ' + key);
    });
});

// ----------------------------------------------------- default task
gulp.task('default', function(){
  // place code for your default task here
});

// ------------------------------------------------------ compile css
gulp.task('styles', function(){
    gulp.src('climasng/static/css/map.less')
        .pipe(plugins.less())
        .on('error', gutil.log).on('error', gutil.beep)
        .pipe(plugins.autoprefixer())
        .pipe(gulp.dest('climasng/static/css/'))
        .pipe(plugins.rename({ suffix: '.min' }))
        .pipe(plugins.minifyCss())
        .pipe(gulp.dest('climasng/static/css/'))
        ;
});