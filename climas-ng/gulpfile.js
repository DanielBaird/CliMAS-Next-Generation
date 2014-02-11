var gulp = require('gulp');
var gutil = require('gulp-util');

// using gulp-load-plugins to save having to load everything separately
// info: https://github.com/jackfranklin/gulp-load-plugins
var plugins = require('gulp-load-plugins')();


// -------------------------------------- show all the loaded plugins
gulp.task('plugins', function() {

    console.log('Loaded Plugins:');
    Object.keys(plugins).forEach( function(key) {
        console.log('    ' + key);
    });
});

// ----------------------------------------------------- default task
gulp.task('default', ['styles', 'js', 'watch']);

// ------------------------------------------------------ compile css
gulp.task('styles', ['cleancss'], function() {
    return gulp.src('climasng/src/css/page-*.less')
        .pipe(plugins.less())
        .on('error', gutil.log).on('error', gutil.beep)
        .pipe(plugins.autoprefixer())
        .pipe(gulp.dest('climasng/static/css/'))
        .pipe(plugins.rename({ suffix: '.min' }))
        .pipe(plugins.minifyCss())
        .pipe(gulp.dest('climasng/static/css/')) ;
});

// ------------------------------------------------------ compile css
gulp.task('js', ['cleanjs'], function() {
    return gulp.src('climasng/src/js/page-*.js')
        .pipe(gulp.dest('climasng/static/js/')) ;
});

// ------------------------------------------------- delete built css
gulp.task('cleancss', function() {
    return gulp.src(['climasng/static/css/*.css'], {read: false}).pipe(plugins.clean());
});

// -------------------------------------------------- delete built js
gulp.task('cleanjs', function() {
    return gulp.src(['climasng/static/js/*.js'], {read: false}).pipe(plugins.clean());
});
