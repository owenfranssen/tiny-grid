const gulp = require('gulp');

const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const cssnano = require('cssnano');
const rename = require('gulp-rename');
const scsscombine = require('gulp-scss-combine');
const concat = require('gulp-concat');
const strip = require('gulp-strip-comments');
const tidy = require('gulp-remove-empty-lines');

let env = process.env.NODE_ENV || 'development';
const src = './src';

gulp.task('set-dev-env', function(cb) {
    env = 'development';
    cb();
});

gulp.task('set-prod-env', function(cb) {
    env = 'production';
    cb();
});

gulp.task('grid-sass', function(cb) {
    let stream = gulp.src('scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
        //outputStyle: "compressed",
        includePaths: ["node_modules"]
    }).on('error', sass.logError))
    .pipe(postcss([
        autoprefixer({
            overrideBrowserslist: ['last 2 versions']
        }),
    ]))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./css'));

    return stream;
});

gulp.task('css-min', function() {
    let stream = gulp.src('css/grid.css')
    .pipe(sass({
        outputStyle: "compressed",
        includePaths: ["node_modules"]
    }).on('error', sass.logError))
    .pipe(postcss([
        autoprefixer(),
        cssnano()
    ]))
    .pipe(rename('grid.min.css'))
    .pipe(gulp.dest('./css'));

    return stream;
});

gulp.task('grid-shopify', function() {
    // combine all sass @import files into one file.
    return gulp.src('scss/grid.scss')
    .pipe(scsscombine())
    .pipe(scsscombine())
    .pipe(scsscombine())
    //.pipe(replace(/\/[\*]{1,2}([\n\s\S]+?)[\*]{2}\//g, ''))
    //.pipe(replace(/[\r\n]+/g, '\n'))
    .pipe(strip.text())
    .pipe(tidy())
    .pipe(concat('grid-shopify.scss.liquid'))
    .pipe(gulp.dest('shopify-src-scss'));
});

gulp.task('gen-css', gulp.series('grid-sass', 'css-min'));

gulp.task('watch-grid', function() {
    gulp.watch(`${src}/scss/grid/**/*.scss`, gulp.series('grid-sass', 'css-min'));
});

gulp.task('default', gulp.series('watch-grid'));