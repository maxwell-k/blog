import fs from "fs/promises";
import { dest, parallel, series, src, watch } from "gulp";
import uglify from "gulp-uglify";
import { bundle } from "lightningcss";
import { spawn } from "node:child_process";
import process from "node:process";
import path from "path";
import { rimraf } from "rimraf";
import stylelint_ from "stylelint";

const sourcemaps = process.env.SOURCEMAP === "true";

const paths = {
  jsInput: "src/copy.js",
  css: ["src/main.css", "src/_*.css"],
  _static: "theme/static",
  output: "output",
};

function _spawn(extraArgs = []) {
  return spawn("./pelicanconf.py", extraArgs, { stdio: "inherit" });
}

async function stylelint() {
  const result = await stylelint_.lint({ files: paths.css, formatter: "string" });
  if (result.report) {
    console.log(result.report);
  }
  if (result.errored) {
    console.info("Check again with:\nnpm exec stylelint " + paths.css.join(" "));
    throw new Error("Stylelint failed.");
  }
}

async function css_() {
  const target = path.join(paths._static, path.basename(paths.css[0]));
  const { code, map } = bundle({
    filename: paths.css[0],
    minify: !sourcemaps,
    sourceMap: sourcemaps,
  });
  await fs.writeFile(target, code);
  if (map) {
    let trailer = `\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,`;
    trailer += map.toString("base64");
    trailer += ` */\n`;
    await fs.appendFile(target, trailer);
  }
}

const css = parallel(css_, stylelint);
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
build.description = "Write processed CSS, HTML and JavaScript to the file system.";
const watchCss = () => watch(paths.css, css);
const watchJs = () => watch(paths.jsInput, js);
const pelicanListen = (cb) => {
  const cmd = _spawn(["--autoreload", "--listen"]);
  cmd.on("close", function(code) {
    console.log("Server exited with code " + code);
    cb(code);
  });
};
const serve = series(
  parallel(js, css),
  removeOutput,
  parallel(watchCss, watchJs, pelicanListen),
);
serve.description = "Serve at http://127.0.0.1:8000 and watch for changes.";
const default_ = parallel(css, js);
default_.description = "Write processed CSS and JavaScript to the file system.";

export { build, serve };
export default default_;

// gulpfile.js
// Copyright 2024 Keith Maxwell
// SPDX-License-Identifier: MPL-2.0
