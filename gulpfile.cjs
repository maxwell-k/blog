const { rimraf } = require("rimraf");
const { spawn } = require("child_process");
const { dest, parallel, series, src, watch } = require("gulp");
const cssnano = require("cssnano");
const stylelint = require("stylelint");
const postcssBundler = require("@csstools/postcss-bundler");
const postcss = require("gulp-postcss");

const paths = {
  styles: ["theme/src/**/*.css"],
  unused: ["theme/static/css/_*.css"],
};

function pelican(cb) {
  const cmd = spawn(
    "uv",
    [
      "tool",
      "run",
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

const pipeline = () =>
  src(paths.styles)
    .pipe(postcss([stylelint, postcssBundler, cssnano]))
    .pipe(dest("theme"));
const clean = () => rimraf(paths.unused, { glob: true });
const css = series(pipeline, clean);
const watch_css = () => watch(paths.styles, css);

exports.css = css;
exports.pelican = pelican;
exports.watch = parallel(pelican, watch_css);
exports.default = css;
