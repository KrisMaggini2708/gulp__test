const gulp = require("gulp")
const { dest,src, parallel, series } = require("gulp")


// плагины
const concat = require("gulp-concat")
const del = require("del")
const browserSync = require("browser-sync").create()
const rename = require("gulp-rename")
const sourcemaps = require("gulp-sourcemaps")
const autoprefixer = require("gulp-autoprefixer")
const fileInclude = require("gulp-file-include")


// css
const sass = require("gulp-sass")(require("sass"))

// js
const uglify = require("gulp-uglify")
const rigger = require("gulp-rigger")

// img 
const imagemin = require("gulp-imagemin")
const newer = require("gulp-newer")

// html
const htmlmin = require("gulp-htmlmin")

// пути
const paths = {
  html:{
    src: 'src/*.html',
    build: 'dist/',
    watching: 'src/**/*.html',
  },
  style:{
    src: 'src/styles/**/*.scss',
    build: 'dist/css/',
    watching: 'src/styles/**/*.scss',
  },
  scripts:{
    src: 'src/scripts/**/*.js',
    build: 'dist/js/',
    watching: 'src/scripts/**/*.js',
  },
  img:{
    src: 'src/img/**/*',
    build: 'dist/img/',
    watching: 'src/img/**/*',
  }
}


// таски

const html = () => {
  return src(paths.html.src)
  .pipe(fileInclude())
  .pipe(dest(paths.html.build))
  .pipe(htmlmin({collapseWhitespace:true}))
  .pipe(dest(paths.html.build))
  .pipe(browserSync.stream())
}

const style = () => {
 return src(paths.style.src,{sourcemaps:true})
 .pipe(sourcemaps.init())
 .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
 .pipe(autoprefixer({cascade:false}))
  .pipe(rename({
    suffix:".min",
    extname:".css"
  }))
  .pipe(sourcemaps.write('./'))
 .pipe(gulp.dest(paths.style.build))
 .pipe(browserSync.stream())
}

const srcripts = () => {
  return src(paths.scripts.src)
  .pipe(sourcemaps.init())
  .pipe(rigger())
  .pipe(uglify())
  .pipe(concat('main.min.js'))
  .pipe(sourcemaps.write('./'))
  .pipe(dest(paths.scripts.build))
  .pipe(browserSync.stream())
} 

const img = () => {
  return src(paths.img.src)
  .pipe(newer(paths.img.build))
  .pipe(imagemin([
    imagemin.gifsicle({interlaced: true}),
    imagemin.mozjpeg({quality: 100, progressive: true}),
    imagemin.optipng({optimizationLevel: 7}),
    imagemin.svgo({
      plugins: [
        {removeViewBox: true},
        {cleanupIDs: false}
      ]
    })
  ]))
  .pipe(dest(paths.img.build))
}

// сервер и очистка
const clean = () =>{
  return del(['dist/*', '!dist/img'])
}

const serve = () => {
  browserSync.init({
    server: {
      baseDir: "dist/"
    }
  });
}

// сборка и отлеживание
const watchFile = () => {
  gulp.watch(paths.html.watching,html)
  gulp.watch(paths.style.watching,style)
  gulp.watch(paths.scripts.watching,srcripts)
  gulp.watch(paths.img.watching,img)
} 

const build = gulp.series(clean,html,gulp.parallel(style,srcripts,img))
const watch = gulp.parallel(build,watchFile,serve)

exports.watchFile = watchFile
exports.clean = clean
exports.html = html
exports.srcripts = srcripts
exports.style = style
exports.img = img
exports.build = build
exports.default = watch
