"use strict";

var gulp            = require('gulp'),
    uglify          = require('gulp-uglify'),
    concat          = require('gulp-concat'),
    sass            = require('gulp-ruby-sass'),
    autoprefixer    = require('gulp-autoprefixer'),
    minifycss       = require('gulp-minify-css'),
    plumber         = require('gulp-plumber'),
    rename          = require('gulp-rename'),
    browserSync     = require('browser-sync'),
    notify          = require("gulp-notify"),
    reload          = browserSync.reload;

var src = {
  scss:       './src/styles/styles.scss',
  js:         './src/scripts/main/*.js',
  vendorJs:   './src/scripts/vendors/*.js'
};

gulp.task('serve', ['sass'], function() {
    browserSync({
        server: {
            baseDir: "dist/"
        },
        ghostMode: {
            clicks: false,
            forms: false,
            scroll: false
        },
        notify: false,
        open: "external"
    });

    gulp.watch('./src/styles/*.scss', ['sass']);
    gulp.watch('./dist/*.html').on('change', reload);
    gulp.watch('./dist/scripts/**/*.js').on('change', reload);
});

gulp.task('scripts', function(){
  gulp.src(src.js)
    .pipe(plumber())
    .pipe(uglify())
    .pipe(concat('scripts.min.js'))
    .pipe(gulp.dest('./dist/scripts/'));
  gulp.src(src.vendorJs)
    .pipe(plumber())
    .pipe(uglify())
    .pipe(concat('vendor.min.js'))
    .pipe(gulp.dest('./dist/scripts/'));
});

gulp.task('sass', function() {
  return sass(src.scss, { 
    style: 'expanded', 
    precision: 8,
    sourcemap: false 
    })
    .on('error', function(err) {
        notify.onError({
            title: 'Sass Error!',
            message: '<%= error.message %>',
            sound: 'Basso'
        })(err);
    })
    .pipe(autoprefixer({browsers: ['last 20 versions', 'ff >= 9', 'ie >= 6', 'ios 6', 'android 4']}))
    .pipe(gulp.dest('src/styles'))
    .pipe(minifycss({ keepSpecialComments: 0 }))
    .pipe(rename({suffix: '.min' }))
    .pipe(gulp.dest('./dist/styles/'))
    .pipe(reload({ stream: true }));
});

gulp.task('watch', function(){  
  gulp.watch(src.js,                 ['scripts']);
  gulp.watch(src.tmp  + '**/*.html', ['layout']);
});

gulp.task('default', ['scripts', 'sass', 'watch', 'serve']);
