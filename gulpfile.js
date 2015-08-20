var path = require('path');
var fs = require('fs');
var gulp = require('gulp');
var clean = require('gulp-clean');
var concat = require("gulp-concat");
var gzip = require('gulp-gzip');
var mocha = require('gulp-mocha');
var jsdoc = require("gulp-jsdoc");
var rename = require('gulp-rename');
var shell = require('gulp-shell');
var tar = require('gulp-tar');
var uglify = require('gulp-uglify');
var order = require('gulp-order');
var source = require('vinyl-source-stream');
var browserify = require('browserify');


getAVVersion = function() {
  return require('./lib/LC.js').LC.VERSION.replace('js', '');
};

gulp.task('browserify', function() {
  var bundle = browserify({entries: './lib/lc-browser.js'});
  return bundle.bundle()
    .pipe(source('lc.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('browserify-core', function() {
  var bundle = browserify({entries: './lib/lc-browser-core.js'});
  return bundle.bundle()
    .pipe(source('lc-core.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('uglify', ['browserify', 'browserify-core'], function() {
  gulp.src('dist/lc-core.js')
    .pipe(uglify())
    .pipe(rename('lc-core-mini.js'))
    .pipe(gulp.dest('dist'));
  return gulp.src('dist/lc.js')
    .pipe(uglify())
    .pipe(rename('lc-mini.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('compress-scripts', ['uglify'], function() {
  var version = getAVVersion();
  return gulp.src(['dist/lc.js', 'dist/lc-mini.js', 'dist/lc-core-mini.js', 'dist/lc-core.js', 'readme.txt'])
    .pipe(tar('avos-javascript-sdk-' + version + '.tar'))
    .pipe(gzip())
    .pipe(gulp.dest('dist'));
});

gulp.task('docs', shell.task([
  'mkdir -p dist/js-sdk-api-docs',
  'JSDOCDIR=tools/jsdoc-toolkit/ sh tools/jsdoc-toolkit/jsrun.sh -d=dist/js-sdk-api-docs -t=tools/jsdoc-toolkit/templates/jsdoc dist/lc.js lib/cloud.js',
]));

gulp.task('compress-docs', ['docs'], function() {
  var version = getAVVersion();
  return gulp.src(['dist/js-sdk-api-docs/**'])
    .pipe(tar('js-sdk-api-docs-' + version + '.tar'))
    .pipe(gzip())
    .pipe(gulp.dest('dist'));
});

gulp.task('test', function() {
  return gulp.src('test/*.js', {read: false})
    .pipe(order([
      'test.js',
      'file.js',
      'error.js',
      'object.js',
      'collection.js',
      'user.js',
      'query.js',
      'geopoint.js',
      'acl.js',
      'master_key.js',
      'status.js',
      'sms.js',
      'search.js'
    ]))
    .pipe(mocha({
      timeout: 100000,
    }));
});

gulp.task('clean', function() {
  gulp.src(['dist/'])
    .pipe(clean({force: true}));
});

gulp.task('release', [
  'browserify',
  'uglify',
  'compress-scripts',
  'docs',
  'compress-docs'
]);
