import { rimraf } from "rimraf";
import { spawn } from "node:child_process";
import { dest, parallel, series, src, watch } from "gulp";
import cssnano from "cssnano";
import stylelint from "stylelint";
import postcssBundler from "@csstools/postcss-bundler";
import postcss from "gulp-postcss";
import process from "node:process";

const sourcemaps = process.env.SOURCEMAP === "true";

const paths = {
  styles: ["theme/src/**/*.css"],
  unused: ["theme/static/_*.css"],
  output: "output",
};

function _spawn(extraArgs = []) {
  const args = [
    "tool",
    "run",
    "--with-requirements=requirements.txt",
    "pelican",
  ].concat(extraArgs);
  return spawn("uv", args, { stdio: "inherit" });
}

const pipelineCss = () =>
  src(paths.styles, { sourcemaps })
    .pipe(postcss([stylelint, postcssBundler, cssnano]))
    .pipe(dest("theme", { sourcemaps }));
const removeUnusedCss = () => rimraf(paths.unused, { glob: true });
const removeOutput = () => rimraf(paths.output);
const css = series(pipelineCss, removeUnusedCss);
const build = series(css, removeOutput, (cb) => {
  const cmd = _spawn();
  cmd.on("close", (code) => {
    if (code !== 0) cb(new Error("Error during build"));
    else cb();
  });
});
const watchCss = () => watch(paths.styles, css);
const serve = series(
  css,
  removeOutput,
  parallel(watchCss, (cb) => {
    const cmd = _spawn(["--autoreload", "--listen"]);
    cmd.on("close", function (code) {
      console.log("Server exited with code " + code);
      cb(code);
    });
  }),
);

export { build, serve };
export default css;
