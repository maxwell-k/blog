const gulp = require("gulp");
const cssnano = require("cssnano");
const stylelint = require("stylelint");
const cssimport = require("postcss-import");
const postcss = require("gulp-postcss");
const sourcemaps = require("gulp-sourcemaps");

const paths = {
  styles: ["src/**/*.css"],
};

gulp.task("watch", function () {
  gulp.watch(paths.styles, ["css"]);
});

gulp.task("default", function () {
  return gulp
    .src(paths.styles)
    .pipe(sourcemaps.init())
    .pipe(postcss([stylelint, cssimport, cssnano]))
    .pipe(gulp.dest("."));
});
