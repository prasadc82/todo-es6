'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('csslint', function () {
  return gulp.src('styles/*.css')
    .pipe($.csslint({
      ids: false // allows ids to be used in CSS selectors
    }))
    .pipe($.csslint.reporter());
});

gulp.task('jshint', function () {
  return gulp.src(['gulpfile.js', 'scripts/**/*.js'])
    .pipe($.jshint())
    .pipe($.jshint.reporter($.jshintStylish));
});

gulp.task('traceur', function () {
  var runtimePath = $.traceur.RUNTIME_PATH;
  var filter = $.filter('!traceur-runtime.js');

  return gulp.src([runtimePath, 'scripts/**/*.js'])
    .pipe($.order([
      'generators.js',
      'todo.js',
      'todolist.js',
      'app.js'
    ]))
    .pipe(filter)
    .pipe($.traceur({
      experimental: true,
      // sourceMap: true,
      modules: 'register',
      moduleName: true
    }))
    // .pipe(filter.restore())
    // .pipe($.concat('app.js'))
    .pipe($.insert.append('System.get("app" + "");'))
    .pipe(gulp.dest('build'));
});

gulp.task('clean', function () {
  return gulp.src('build', { read: false })
    .pipe($.clean());
});

gulp.task('connect', function () {
  var connect = require('connect');
  var app = connect()
    .use(require('connect-livereload')({
      port: 35729
    }))
    .use(connect.static('.'))
    .use(connect.directory('.'));

  require('http').createServer(app)
    .listen(4000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:4000');
    });
});

gulp.task('serve', ['connect'], function () {
  require('opn')('http://localhost:4000');
});

gulp.task('watch', ['connect', 'serve'], function () {
  var server = $.livereload();

  gulp.watch([
    '*.html',
    'styles/*.css',
    'build/*.js'
  ]).on('change', function (file) {
    server.changed(file.path);
  });

  gulp.watch(['styles/*.css'], ['csslint']);
  gulp.watch(['gulpfile.js', 'scripts/*.js'], ['jshint', 'traceur']);
});

gulp.task('default', ['csslint', 'jshint', 'traceur', 'connect', 'watch']);
