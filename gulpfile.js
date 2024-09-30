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
  cssInputs: ["theme/src/static/*.css"],
  cssBundle: ["theme/src/static/bundle.css"],
  cssOutput: "theme/static",
  pelicanOutput: "output",
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

const css = () =>
  src(paths.cssBundle, { sourcemaps })
    .pipe(postcss([stylelint, postcssBundler, cssnano]))
    .pipe(dest(paths.cssOutput, { sourcemaps }));
const removeOutput = () => rimraf(paths.pelicanOutput);
const pelican = (cb) => {
  const cmd = _spawn();
  cmd.on("close", (code) => {
    if (code !== 0) cb(new Error("Error during build"));
    else cb();
  });
};
const build = series(css, removeOutput, pelican);
const watchCss = () => watch(paths.cssInputs, css);
const pelicanListen = (cb) => {
  const cmd = _spawn(["--autoreload", "--listen"]);
  cmd.on("close", function (code) {
    console.log("Server exited with code " + code);
    cb(code);
  });
};
const serve = series(css, removeOutput, parallel(watchCss, pelicanListen));

export { build, serve };
export default css;
