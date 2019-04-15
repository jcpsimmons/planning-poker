var gulp        = require('gulp');
var browserSync = require('browser-sync').create();

// Static server
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
    gulp.watch("./index.*").on('change', browserSync.reload);
});

// or...

gulp.task('browser-sync', function() {
    browserSync.init({
        proxy: "localhost:3000"
    });
});
