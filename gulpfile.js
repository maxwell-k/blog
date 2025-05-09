import { rimraf } from "rimraf";
import { spawn } from "node:child_process";
import { dest, parallel, series, src, watch } from "gulp";
import cssnano from "cssnano";
import stylelint from "stylelint";
import postcssBundler from "@csstools/postcss-bundler";
import postcss from "gulp-postcss";
import process from "node:process";
import uglify from "gulp-uglify";

const sourcemaps = process.env.SOURCEMAP === "true";

const paths = {
  jsInput: "custom/src/copy.js",
  cssInputs: ["custom/src/*.css"],
  cssBundle: ["custom/src/bundle.css"],
  _static: "custom/static",
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

const css = () =>
  src(paths.cssBundle, { sourcemaps })
    .pipe(postcss([stylelint, postcssBundler, cssnano]))
    .pipe(dest(paths._static, { sourcemaps }));
const js = () =>
  src(paths.jsInput, { sourcemaps })
    .pipe(uglify())
    .pipe(dest(paths._static, { sourcemaps }));
const removeOutput = () => rimraf(paths.output);
const pelican = (cb) => {
  const cmd = _spawn();
  cmd.on("close", (code) => {
    if (code !== 0) cb(new Error("Error during build"));
    else cb();
  });
};
const build = series(js, css, removeOutput, pelican);
const watchCss = () => watch(paths.cssInputs, css);
const watchJs = () => watch(paths.jsInput, js);
const pelicanListen = (cb) => {
  const cmd = _spawn(["--autoreload", "--listen"]);
  cmd.on("close", function (code) {
    console.log("Server exited with code " + code);
    cb(code);
  });
};
const serve = series(
  parallel(js, css),
  removeOutput,
  parallel(watchCss, watchJs, pelicanListen),
);

export { build, serve };
export default css;

// gulpfile.js
// Copyright 2024 Keith Maxwell
// SPDX-License-Identifier: MPL-2.0
