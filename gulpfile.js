var gulp = require('gulp');
var Server = require('karma').Server;
var bower = require('gulp-bower');
var runSequence = require('run-sequence');
var del = require('del');
var less = require('gulp-less');
var concat = require('gulp-concat');
var fs = require('fs');
var uglify = require('gulp-uglifyjs');

gulp.task('test', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true,
  }, done).start();
});

gulp.task('bower', function() {
  return bower();
});

gulp.task('vendor:fa:css', function () {
  return gulp.src('bower_components/fontawesome/css/*').pipe(gulp.dest('vendor/fontawesome/css'));
});

gulp.task('vendor:fa:fonts', function () {
  return gulp.src('bower_components/fontawesome/fonts/*').pipe(gulp.dest('vendor/fontawesome/fonts'));
});

gulp.task('vendor:fa', ['vendor:fa:fonts', 'vendor:fa:css']);



gulp.task('vendor:webix', function () {
  return gulp.src('bower_components/webix/codebase/*.*').pipe(gulp.dest('vendor/webix'));
});


gulp.task('vendor:fa', ['vendor:fa:fonts', 'vendor:fa:css']);



gulp.task('vendor:jquery', function () {
  return gulp.src('bower_components/jquery/dist/*').pipe(gulp.dest('vendor/jquery'));
});

gulp.task('vendor:sio', function () {
  return gulp.src('bower_components/socket.io-client/socket.io.js').pipe(gulp.dest('vendor'));
});

gulp.task('vendor:clean', function() {
  return del(['vendor/**/*']);
});

gulp.task('jekyll:build', function (done){
  var spawn = require('child_process').spawn;
  var jekyll = spawn('jekyll', ['build'], {stdio: 'inherit'});
  jekyll.on('exit', function(code) {
    done(code === 0 ? null : 'ERROR: Jekyll process exited with code: ' + code);
  });
});

gulp.task('jekyll:clean', function() {
  return del(['_site']);
});

gulp.task('jekyll:serve', function (done){
  var spawn = require('child_process').spawn;
  var jekyll = spawn('jekyll', ['serve', '--incremental', '--watch'], {stdio: 'inherit'});
  jekyll.on('exit', function(code) {
    done(code === 0 ? null : 'ERROR: Jekyll process exited with code: ' + code);
  });
});

gulp.task('default', function() {
  runSequence(
    'bower',
    'vendor:clean',
    [
      'vendor:jquery',
      'vendor:fa',
      'vendor:sio',
      'vendor:webix'
    ],
    'jekyll:clean',
    'jekyll:build');
});

gulp.task('serve', function() {
  runSequence(
    'bower',
    'vendor:clean',
    [
      'vendor:jquery',
      'vendor:fa',
      'vendor:sio',
      'vendor:webix'
    ],
    'jekyll:clean',
    'jekyll:serve');
});
