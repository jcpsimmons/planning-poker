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
    output: './dist/images',
  },
};

/**
 * Gulp Packages
 */
const bs = require('browser-sync');
const gulp = require('gulp');

const { series } = gulp;

const browserSync = bs.create();

/**
 * Gulp Tasks
 */

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
  });
};

exports.build = series(buildImages, buildJS, serve);
