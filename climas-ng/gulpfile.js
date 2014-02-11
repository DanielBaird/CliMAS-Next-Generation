var gulp = require('gulp');
var gutil = require('gulp-util');

// this gulpfile uses gulp-load-plugins to load plugins, which saves
// having to load everything separately.
// info: https://github.com/jackfranklin/gulp-load-plugins
var plugins = require('gulp-load-plugins')();

// ----------------------------------------------------- default task
gulp.task('default', ['build', 'watch']);

// --------------------------------------------- build ALL the things
gulp.task('build', ['cssbuild', 'jsbuild']);

// ------------------------------------------------- lint your source
gulp.task('lint', ['jslint']);

// ------------------------------------------------- lint your source
gulp.task('watch', function() {
    console.log('"watch" task not yet implemented.');
    console.log('Run "gulp tasks" to see what else you can do.');
});

// ------------------------------------------------------ compile css
gulp.task('cssbuild', ['cssclean'], function() {
    return gulp.src('climasng/src/css/page-*.less')
        .pipe(plugins.less())
        .on('error', gutil.log).on('error', gutil.beep)
        .pipe(plugins.autoprefixer())
        .pipe(gulp.dest('climasng/static/css/'))
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(plugins.minifyCss())
        .pipe(gulp.dest('climasng/static/css/')) ;
});

// ------------------------------------------------- delete built css
gulp.task('cssclean', function() {
    return gulp.src(['climasng/static/css/*.css'], {read: false})
        .pipe(plugins.clean());
});

// ------------------------------------------------------- compile js
gulp.task('jsbuild', ['jsclean', 'jslint'], function() {
    return gulp.src('climasng/src/js/page-*.js')
        .pipe(plugins.browserify({
            debug: !gutil.env.production
        }))
        .on('error', gutil.log).on('error', gutil.beep)
        .pipe(gulp.dest('climasng/static/js/'))
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(plugins.uglify())
        .pipe(gulp.dest('climasng/static/js/')) ;
});

// ---------------------------------------------------------- lint js
gulp.task('jslint', function() {
    return gulp.src(['gulpfile.js', 'climasng/src/js/page-*.js'])
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('default'));
});

// -------------------------------------------------- delete built js
gulp.task('jsclean', function() {
    return gulp.src(['climasng/static/js/*.js'], {read: false})
        .pipe(plugins.clean());
});

// ===================================================== meta stuff..

// -------------------------------------- show all the loaded plugins
gulp.task('tasks', function() {
    console.log(gutil.linefeed + 'Available tasks:');
    var taskNames = Object.keys(gulp.tasks);
    var maxLen = taskNames.reduce(function(prev, current) {
        return Math.max(prev, current.length);
    }, 0);

    taskNames.forEach( function(taskName) {
        var task = gulp.tasks[taskName];
        var depList = '';
        if (task.dep.length > 0) {
            depList = Array(maxLen - taskName.length + 1).join(' ');
            depList = depList + '  (' + task.dep.join(', ') + ')';
        }
        console.log('    ' + taskName + depList);
    });
    console.log('execute "gulp <taskname>" to perform a task ' +
        'or "gulp" to perform the default task).' +
        gutil.linefeed
    );
});

// -------------------------------------- show all the loaded plugins
gulp.task('plugins', function() {
    // just outputs your loaded plugins
    console.log(gutil.linefeed + 'Available plugins:');
    Object.keys(plugins).forEach( function(pluginName) {
        console.log('    ' + pluginName);
    });
    console.log();
});

