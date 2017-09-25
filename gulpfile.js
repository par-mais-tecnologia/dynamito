var path = require('path');
var gulp = require('gulp');
var eslint = require('gulp-eslint');
var excludeGitignore = require('gulp-exclude-gitignore');
var nsp = require('gulp-nsp');
var plumber = require('gulp-plumber');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var isparta = require('isparta');
var del = require('del');
var babel = require('gulp-babel');

// Initialize the babel transpiler so ES2015 files gets compiled
// when they're loaded
require('babel-core/register');

gulp.task('static', function () {
  return gulp.src([
    'lib/**/*.js',
    '!test/**/*.js',
  ])
    .pipe(excludeGitignore())
    .pipe(eslint({
      globals: {
        expect: true,
        sinon: true
      },
      rules: {
        'eol-last': 2
      }
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('nsp', function (cb) {
  nsp({package: path.resolve('package.json')}, cb);
});

gulp.task('pre-test', function () {
  return gulp.src('lib/**/*.js')
    .pipe(excludeGitignore())
    .pipe(istanbul({
      includeUntested: true,
      instrumenter: isparta.Instrumenter
    }))
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function (cb) {
  var mochaErr;

  gulp.src('test/**/*.js')
    .pipe(plumber())
    .pipe(mocha({
      reporter: 'spec',
      require: [
        './confs/mocha.conf.js',
        './confs/dynamoDB.conf.js',
        './confs/winston.conf.js'
      ],
      timeout: 2000
    }))
    .on('error', function (err) {
      mochaErr = err;
      cb(mochaErr);
    })
    // .pipe(istanbul.writeReports())
    // .pipe(istanbul.enforceThresholds({
    //   thresholds: {
    //     global: 70
    //   }
    // })) // Enforce a coverage of at least 80%
    .on('end', function () {
      cb(mochaErr);
      process.exit();
    });
});

gulp.task('clean', function () {
  return del('dist');
});

gulp.task('babel', ['clean'], function () {
  return gulp.src('lib/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('dist'));
});

gulp.task('prepublish', ['nsp', 'babel']);
gulp.task('default', ['static', 'test']);
