const gulp = require('gulp');
const imgmin = require('gulp-imagemin');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const runSequence = require('run-sequence');
const concatCss = require('gulp-concat-css');
const browserSync = require('browser-sync').create();
const useref = require('gulp-useref');
const gulpIf = require('gulp-if');
const sourcemaps = require('gulp-sourcemaps');
const lazypipe = require('lazypipe');


gulp.task('logger', function() {
    console.log('This function is writing to the console');
});

gulp.task('default', function(callback) {
    runSequence('watch', callback);
});

gulp.task('copyAllHTML', function() {
    gulp.src('src/*.html')
    .pipe(gulp.dest('dist'));
});

gulp.task('minifyImgs', () => {
    gulp.src('src/imgs/**/*')
    .pipe(imgmin())
    .pipe(gulp.dest('dist/imgs'));
});

gulp.task('processJS', function() {
    gulp.src('src/js/**/*.js')
    .pipe(uglify())
    //.pipe(concat('application.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('sass2CSS', function() {
    return gulp.src('src/sass/**/*.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('src/css'))
    .pipe(browserSync.stream());
});

gulp.task('processCSS', function() {
    return gulp.src('src/css/**/*.css')
    .pipe(concatCss('styles.css'))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('build', function(callback) {
    runSequence('sass2CSS', ['copyAllHTML', 'minifyImgs', 'processJS', 'processCSS'], callback);
});

gulp.task('prodJS', function() {
    return gulp.src('src/**/*.html')
    .pipe(useref({}, lazypipe().pipe(sourcemaps.init, {loadMaps: true})))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest('dist'));
});

gulp.task('prod', function(callback) {
    runSequence('sass2CSS', ['minifyImgs', 'prodJS'], callback);
});

gulp.task('watch', ['browserSync'], function() {
    gulp.watch('src/**/*.html', ['copyAllHTML']);
    gulp.watch('src/js/**/*.js', ['processJS']);
    gulp.watch('src/imgs/**/*', ['minifyImgs']);
    gulp.watch('src/sass/**/*.scss', ['sass2CSS']);
    gulp.watch('src/css/**/*.css', ['processCSS']);
    
    //reloaders
    gulp.watch('src/**/*.html', browserSync.reload);
    gulp.watch('src/js/**/*.js', browserSync.reload);
    gulp.watch('src/imgs/**/*', browserSync.reload);
    gulp.watch('src/sass/**/*.scss', browserSync.reload);
    gulp.watch('src/css/**/*.css', browserSync.reload);
});

gulp.task('browserSync', function() {
    browserSync.init({
        server: './dist',
        port: 8080,
        ui: { port: 8081}
    })
});
