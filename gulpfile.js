var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

getMLVersion = function() {
  return require('./lib/ml.js').ML.VERSION.replace('js', '');
};

gulp.task('browserify', function() {
  return gulp.src('./lib/ml.js')
    .pipe($.browserify())
    .pipe(gulp.dest('dist'))
});

gulp.task('watch', function(){
  gulp.watch('./lib/**/*.js', ['browserify'])
});

gulp.task('uglify', ['browserify'], function() {
  return gulp.src('dist/ml.js')
    .pipe($.uglify())
    .pipe($.rename('ml-mini.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('compress-scripts', ['uglify'], function() {
  var version = getMLVersion();
  return gulp.src(['dist/ml.js', 'dist/ml-mini.js'])
    .pipe($.tar('ml-javascript-sdk-' + version + '.tar'))
    .pipe($.gzip())
    .pipe(gulp.dest('dist'));
});

gulp.task('docs', $.shell.task([
  'mkdir -p dist/js-sdk-api-docs',
  'JSDOCDIR=tools/jsdoc-toolkit/ sh tools/jsdoc-toolkit/jsrun.sh -d=dist/js-sdk-api-docs -t=tools/jsdoc-toolkit/templates/jsdoc dist/ml.js'
]));

gulp.task('compress-docs', ['docs'], function() {
  var version = getMLVersion();
  return gulp.src(['dist/js-sdk-api-docs/**'])
    .pipe($.tar('js-sdk-api-docs-' + version + '.tar'))
    .pipe($.gzip())
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', function() {
  gulp.src(['dist/'])
    .pipe($.clean({force: true}));
});

gulp.task('release', ['clean'], function(){
  gulp.start([
    'browserify',
    'uglify',
    'compress-scripts',
    'docs',
    'compress-docs'
  ]);
});
