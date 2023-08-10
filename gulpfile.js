/**
 * Settings
 */
const theme_base_path = './planning-poker-theme/';
const settings = {
  server: {
    proxy: 'localhost:3000',
  },
  styles: {
    input: theme_base_path + 'sass/**/*.{scss,sass}',
    output: theme_base_path + 'css',
  },
  js: {
    es6: false,
    input: theme_base_path + 'js/*',
    output: theme_base_path + 'dist/js',
  },
  img: {
    min: false,
    input: theme_base_path + 'images/*',
    output: theme_base_path + 'dist/images',
  },
};

/**
 * Gulp Packages
 */
const bs = require('browser-sync');
const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const plumber = require('gulp-plumber');
const gulpSass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const dartSass = require('sass');

const { series, watch } = gulp;

const browserSync = bs.create();
const sass = gulpSass(dartSass);

/**
 * Gulp Tasks
 */

// SASS.
const buildSass = () => {
  return gulp
    .src(settings.styles.input)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        errLogToConsole: true,
        outputStyle: 'expanded', // expanded, compact, compressed
      }).on('error', sass.logError)
    )
    .pipe(autoprefixer({ browsers: ['last 2 versions'] }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(settings.styles.output));
};

// Minify images.
const buildImages = () => {
  return gulp.src(settings.img.input).pipe(gulp.dest(settings.img.output));
};

// // JS es6 to es5.
const buildJS = () => {
  return gulp.src(settings.js.input).pipe(gulp.dest(settings.js.output));
};

const serve = () => {
  return browserSync.init({
    port: 3001,
    open: false,
    proxy: settings.server.proxy,
    // injectChanges: true
  });
};

//   gulp.watch(theme_base_path + 'css/*.css', browserSync.reload);
//   gulp.watch(theme_base_path + 'js/**/*.js', browserSync.reload);
// });

// // Default task.
// gulp.task('default', ['serve', 'sass'], function () {
//   console.log('here')
//   gulp.watch(settings.styles.input, ['sass']);

//   if (settings.js.es6) {
//     gulp.watch(settings.js.input, ['es6']);
//   }

//   if (settings.img.min) {
//     gulp.watch(settings.img.input, ['imgmin']);
//   }
// });

exports.build = series(buildSass, buildImages, buildJS, serve);
