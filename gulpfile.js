var gulp = require('gulp');
var plumber = require('gulp-plumber');
var to5 = require('gulp-6to5');
var changed = require('gulp-changed');
var browserSync = require('browser-sync');
var jshint = require('gulp-jshint');
var runSequence = require('run-sequence');
var vinylPaths = require('vinyl-paths');
var del = require('del');
var stylish = require('jshint-stylish');
var assign = Object.assign || require('object.assign');
var sourcemaps = require("gulp-sourcemaps");
var ngHtml2Js = require("gulp-ng-html2js");
var htmlMin = require('gulp-minify-html');

var compilerOptions = {
  filename: '',
  filenameRelative: '',
  blacklist: [],
  whitelist: [],
  modules: '',
  sourceMap: true,
  sourceMapName: '',
  sourceFileName: '',
  sourceRoot: '',
  moduleRoot: '',
  moduleIds: false,
  runtime: false,
  experimental: false,
  format: {
    comments: false,
    compact: false,
    indent: {
      parentheses: true,
      adjustMultilineComment: true,
      style: "  ",
      base: 0
    }
  }
};

var path = {
  source:'src/**/*.js',
  html:'**/*.html',
  templates: 'src/**/*.html',
  output:'dist/'
};

var jshintConfig = {esnext:true};

gulp.task('clean', function() {
 return gulp.src([path.output])
    .pipe(vinylPaths(del));
});

gulp.task('build-html', function () {
  return gulp.src(path.templates)
    .pipe(plumber())
    .pipe(changed(path.output, {extension: '.html'}))
    .pipe(htmlMin({
      empty: true,
      spare: true,
      quotes: true
    }))
    /*.pipe(ngHtml2Js({
      moduleName: function (file) {
        console.log(file)
        var path = file.split('/'),
            folder = path[path.length - 2];

        return folder.replace(/-[a-z]/g, function (match) {
          return match.substr(1).toUpperCase();
        });
      }
    }))*/
    .pipe(ngHtml2Js({
      moduleName: 'templates'
    }))
    .pipe(gulp.dest(path.output))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('build-system', function () {
  return gulp.src(path.source)
    .pipe(plumber())
    .pipe(changed(path.output, {extension: '.js'}))
    //.pipe(sourcemaps.init())
    .pipe(to5(assign({}, compilerOptions, {modules:'system'})))
    //.pipe(sourcemaps.write("."))
    .pipe(gulp.dest(path.output))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('build', function(callback) {
  return runSequence(
    'clean',
    ['build-html', 'build-system'],
    callback
  );
});

gulp.task('lint', function() {
  return gulp.src(path.source)
    .pipe(jshint(jshintConfig))
    .pipe(jshint.reporter(stylish));
});

gulp.task('serve', ['build'], function(done) {
  browserSync({
    open: false,
    port: 9000,
    server: {
      baseDir: ['.'],
      middleware: function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
      }
    }
  }, done);
});

gulp.task('watch', ['serve'], function() {
  var watcher = gulp.watch([path.source, path.html], ['build']);
  watcher.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });
});

// todo:
// gulp.task('build', []);
