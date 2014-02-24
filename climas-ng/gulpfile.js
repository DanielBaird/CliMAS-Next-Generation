var gulp = require('gulp');
var gutil = require('gulp-util');

var path = require('path');

// this gulpfile uses gulp-load-plugins to load plugins, which saves
// having to load everything separately.
// info: https://github.com/jackfranklin/gulp-load-plugins
var plugins = require('gulp-load-plugins')();

// paths this project uses
var cssSourcePaths = [
    'climasng/src/css/*.less',
    'climasng/src/css/*.css'
];
var jsSourcePaths = [
    'climasng/src/js/page-*.js'
];
var jsLintablePaths = jsSourcePaths.concat([
    'gulpfile.js'
]);
var coffeeSourcePaths = [
    'climasng/src/js/oldreports/**/*.coffee'
];

// returns a string consisting of prefix + filePath + postfix,
// with colour highlighting of the filepath.
function colorFileMsg(prefix, filePath, postfix) {
    // maybe a relative path is clearer..
    var nicePath = path.relative('.', filePath);
    if (nicePath.substr(0,2) === '..') {
        nicePath = filePath;
    }
    return (
        gutil.colors.gray(prefix + path.dirname(nicePath) + '/') +
        gutil.colors.magenta(path.basename(nicePath)) +
        gutil.colors.gray(postfix)
    );
}

// **returns a function** that when invoked with an event argument,
// logs a nice message saying that the event will be handled.
// Arg 'message' is what to say instead of "Handled" in the message.
function adviseOfEvent(message) {
    return (function(event) {
        var msg = message || 'Handling';
        gutil.log(colorFileMsg(msg + ' ', event.path, ' for you...'));
    });
}

// ----------------------------------------------------- default task
gulp.task('default', ['build', 'watch'], function() {
    console.log('Running the default task.');
    console.log('This will watch your files and do all the ' +
        'necessary compilation etc.');
    console.log(
        'If this is not what you expected, you should press ' +
        'Ctrl+c to quit this, then run "gulp tasks" to see ' +
        'what else you can do.'
    );
});

// --------------------------------------------- build ALL the things
gulp.task('build', ['cssbuild', 'jsbuild', 'coffeebuild']);

// ------------------------------------------------- lint your source
gulp.task('lint', ['jslint']);

// -------------------------------------------- react to file updates
gulp.task('watch', function() {
    gulp.watch(cssSourcePaths, ['cssbuild'])
        .on('change', adviseOfEvent('Building'));

    gulp.watch(jsLintablePaths, ['jslint'])
        .on('change', adviseOfEvent('Linting'));

    gulp.watch(jsSourcePaths, ['jsbuild'])
        .on('change', adviseOfEvent('Building'));

    gulp.watch(coffeeSourcePaths, ['coffeebuild'])
        .on('change', adviseOfEvent('Compiling'));
});

// ------------------------------------------------------ compile css
gulp.task('cssbuild', ['cssclean'], function() {
    return gulp.src(cssSourcePaths)
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
    return gulp.src(jsSourcePaths)
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
    return gulp.src(jsLintablePaths)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('default'));
});

// -------------------------------------------------- delete built js
gulp.task('jsclean', function() {
    return gulp.src(['climasng/static/js/*.js'], {read: false})
        .pipe(plugins.clean());
});

// --------------------------------------------- compile coffeescript
gulp.task('coffeebuild', [], function() {
    return gulp.src(coffeeSourcePaths)
        .pipe(plugins.coffee({ bare: true }))
        .on('error', gutil.log).on('error', gutil.beep)
        .pipe(gulp.dest('climasng/static/js/oldreports/')) ;
});

// ===================================================== meta stuff..

// --------------------------------------------- show available tasks
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

