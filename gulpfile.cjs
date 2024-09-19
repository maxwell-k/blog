const { spawn } = require("child_process");
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
  return (
    gulp
      .src(paths.styles)
      .pipe(sourcemaps.init())
      .pipe(postcss([stylelint, cssimport, cssnano]))
      // .pipe(sourcemaps.write()) // to debug in Chrome Developer Tools
      .pipe(gulp.dest("theme"))
  );
}

function csswatch() {
  gulp.watch(paths.styles, css);
}

function pelican(cb) {
  const cmd = spawn(
    "uvx",
    [
      "--with-requirements=requirements.txt",
      "pelican",
      "--autoreload",
      "--listen",
    ],
    { stdio: "inherit" },
  );
  cmd.on("close", function (code) {
    console.log("Server exited with code " + code);
    cb(code);
  });
}

gulp.task("pelican", pelican);

gulp.task("watch", gulp.parallel("pelican", csswatch));

gulp.task("default", css);
