import { rimraf } from "rimraf";
import { spawn } from "node:child_process";
import { dest, parallel, series, src, watch } from "gulp";
import cssnano from "cssnano";
import stylelint from "stylelint";
import postcssBundler from "@csstools/postcss-bundler";
import postcss from "gulp-postcss";

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

const pipelineCss = () =>
  src(paths.styles)
    .pipe(postcss([stylelint, postcssBundler, cssnano]))
    .pipe(dest("theme"));
const removeUnusedCss = () => rimraf(paths.unused, { glob: true });
const css = series(pipelineCss, removeUnusedCss);
const watchCss = () => watch(paths.styles, css);
const serve = parallel(pelican, watchCss);

export { pelican, serve };
export default css;
