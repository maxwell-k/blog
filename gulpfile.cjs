const gulp = require("gulp");
const cssnano = require("cssnano");
const stylelint = require("stylelint");
const cssimport = require("postcss-import");
const postcss = require("gulp-postcss");
const sourcemaps = require("gulp-sourcemaps");

const paths = {
  styles: ["theme/src/**/*.css"],
};

function css() {
  return gulp
    .src(paths.styles)
    .pipe(sourcemaps.init())
    .pipe(postcss([stylelint, cssimport, cssnano]))
    .pipe(gulp.dest("theme"));
}

gulp.task("watch", function () {
  gulp.watch(paths.styles, css);
});

gulp.task("default", css);
