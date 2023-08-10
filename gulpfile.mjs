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
import bs from 'browser-sync';
import gulp from 'gulp';
import autoprefixer from 'gulp-autoprefixer';
import imagemin from 'gulp-imagemin';
import plumber from 'gulp-plumber';
import gulpSass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import * as dartSass from 'sass';

const browserSync = bs.create();
const sass = gulpSass(dartSass);

/**
 * Gulp Tasks
 */

// SASS.
gulp.task('sass', function () {
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
});

// Minify images.
gulp.task('imgmin', () =>
  gulp
    .src(settings.images.input)
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
      })
    )
    .pipe(gulp.dest(settings.img.output))
);

// JS es6 to es5.
gulp.task('es6', () =>
  gulp
    .src(settings.js.input)
    .pipe(
      babel({
        presets: ['es2015'],
      })
    )
    .pipe(gulp.dest(settings.js.output))
);

// browserSync.
gulp.task('serve', function () {
  browserSync.init({
    port: 3001,
    open: false,
    proxy: settings.server.proxy,
    // injectChanges: true
  });

  gulp.watch(theme_base_path + 'css/*.css', browserSync.reload);
  gulp.watch(theme_base_path + 'js/**/*.js', browserSync.reload);
});

// Default task.
gulp.task('default', ['serve', 'sass'], function () {
  console.log('here')
  gulp.watch(settings.styles.input, ['sass']);

  if (settings.js.es6) {
    gulp.watch(settings.js.input, ['es6']);
  }

  if (settings.img.min) {
    gulp.watch(settings.img.input, ['imgmin']);
  }
});
