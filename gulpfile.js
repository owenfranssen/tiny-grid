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

gulp.task('scss', function(cb) {
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
    let stream = gulp.src(['css/*.css','!css/*.min.css'])
    .pipe(sass({
        outputStyle: "compressed",
        includePaths: ["node_modules"]
    }).on('error', sass.logError))
    .pipe(postcss([
        autoprefixer(),
        cssnano()
    ]))
    .pipe(rename((path) => {
        path.basename += '.min';
    }))
    .pipe(gulp.dest('./css'));

    return stream;
});

gulp.task('grid-shopify', function() {
    // combine all sass @import files into one file.
    return gulp.src('scss/grid.scss')
    .pipe(scsscombine())
    .pipe(scsscombine())
    .pipe(scsscombine())
    .pipe(scsscombine())
    .pipe(strip.text())
    .pipe(tidy())
    .pipe(concat('grid-shopify.scss.liquid'))
    .pipe(gulp.dest('shopify-src-scss'));
});

gulp.task('gen-css', gulp.series('scss', 'css-min', 'grid-shopify'));

gulp.task('watch', function() {
    gulp.watch(`${src}/scss/grid/**/*.scss`, gulp.series('gen-css'));
});

gulp.task('default', gulp.series('watch'));