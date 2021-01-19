const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
// const reload = browserSync.reload;
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const del = require('del');
const rename = require('gulp-rename');

let path = {
    build: {
        html: 'dist/',
        js: 'dist/js/',
        css: 'dist/css/',
        images: 'dist/img/'
    },
    src: {
        html: 'src/index.html',
        js: 'src/js/**/*.js',
        css: 'src/scss/style.scss',
        images: 'src/img/**/*.{jpg,png,svg,gif,ico}'
    },
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        css: 'src/scss/**/*.scss',
        images: 'src/img/**/*.{jpg,png,svg,gif,ico}'
    },
    clean: './dist'
}

// BrowserSync
function browsersync() {
    browserSync.init({
        server: { baseDir: 'dist/' }, // Указываем папку сервера
        host:  '192.168.56.2',
        notify: false, // Отключаем уведомления
        online: true // Режим работы сетью (через сеть или без сети): true или false
    })
}

// Sripts
function scripts() {
    return src(path.src.js, {base: 'src/js/'})
        .pipe(concat('app.js'))
        .pipe(dest(path.build.js))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify())
        .pipe(dest(path.build.js))
        .pipe(browserSync.stream());
}

// Html
function html() {
    return src(path.src.html, {base:'src/'})
        .pipe(dest(path.build.html))
        .pipe(browserSync.stream());
}

// Styles
function styles() {
    return src(path.src.css, {base:'src/scss'})
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({ overrideBrowserslist: ['last 4 versions'], grid: true }))
        .pipe(dest(path.build.css))
        .pipe(cleancss({ level: { 1: { specialComments: 0 } } }))
        .pipe(rename({
            suffix: '.min',
            extname: '.css'
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(path.build.css))
        .pipe(browserSync.stream());
}

// Images
function images() {
    return src(path.src.images)
        .pipe(newer(path.build.images))
        .pipe(imagemin())
        .pipe(dest(path.build.images))
        .pipe(browserSync.stream());
}

// CleanImg
function cleanimg() {
    return del('dist/img/**/*', { force: true }); 
}

// CleanDist
function cleandist() {
    return del('dist/**/*', { force: true });
}

// StartWatch
function startwatch() {
    watch([path.watch.js], scripts);
    watch([path.watch.css], styles).on('change', browserSync.reload);
    watch([path.watch.html], html);   
    watch([path.watch.images], images);
}

exports.browsersync = browsersync;
exports.scripts = scripts;
exports.html = html;
exports.styles = styles;
exports.images = images;
exports.cleanimg = cleanimg;
exports.cleandist = cleandist;
exports.startwatch = startwatch;

exports.default = series(parallel(html, styles, scripts, images), parallel(browsersync, startwatch));