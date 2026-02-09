import { mkdirSync } from "fs";
import fs from "fs/promises";
import { dest, parallel, series, src, watch } from "gulp";
import uglify from "gulp-uglify";
import { bundle } from "lightningcss";
import { spawn } from "node:child_process";
import process from "node:process";
import path from "path";
import { PurgeCSS } from "purgecss";
import { rimraf } from "rimraf";
import stylelint_ from "stylelint";

const sourcemaps = process.env.SOURCEMAPS === "true";
const loopback = "http://127.0.0.1:8000";

const callbacks = [];

const paths = {
  jsInput: "src/copy.js",
  css: ["src/*.css"],
  cssMain: "src/main.css",
  _static: "theme/static",
  _templates: "theme/templates/",
  output: "output",
};

function _spawnPelican(extraArgs = []) {
  mkdirSync("content/images", { recursive: true }); // avoid a warning
  const args = [
    `--extra-settings=SITEURL="${loopback}"`,
    ...extraArgs,
  ];
  return spawn("./pelicanconf.py", args, { stdio: "inherit" });
}
const pelican = (cb) => {
  const child = _spawnPelican(["--fatal=warnings"]);
  child.on("close", (code) => {
    if (code === 0) cb();
    else cb(new Error());
  });
};
const pelicanListen = (cb) => {
  let server = undefined;
  process.on("SIGINT", () => {
    if (server) server.kill();
    for (const cb of callbacks) cb();
    process.exit();
  });
  callbacks.push(cb);
  server = _spawnPelican(["--autoreload", "--listen"]);
  server.on("close", (code) => {
    if (code === 0) cb();
    else cb(new Error());
  });
};

async function stylelint() {
  const result = await stylelint_.lint({ files: paths.css, formatter: "string" });
  if (result.report) {
    console.log(result.report);
  }
  if (result.errored) {
    console.info("Check again with: `npm exec stylelint`.");
    throw new Error("Stylelint failed.");
  }
}

async function css(cb) {
  const target = path.join(paths._templates, path.basename(paths.cssMain));
  const { code, map } = bundle({
    filename: paths.cssMain,
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
  cb();
}

const js = () =>
  src(paths.jsInput, { sourcemaps })
    .pipe(uglify())
    .pipe(dest(paths._static, { sourcemaps }));
const removeOutput = () => rimraf(paths.output);

async function purge() {
  const result = await new PurgeCSS().purge({
    content: ["output/**/*.html"],
    css: ["src/*.css"],
    rejected: true,
    safelist: {
      standard: ["img", "h4", "h5", "h6", "dl"],
    },
  });
  const rejected = result.map((i) => i.rejected).flat().map((i) => i.trim());
  if (rejected.length > 0) {
    console.log(rejected.join("\n"));
    throw new Error("Unused CSS detected.");
  }
}
function _run(cb, cmd) {
  const args = cmd.split(" ");
  const child = spawn(args[0], args.slice(1), { stdio: "pipe" });
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", data => stdout += data.toString());
  child.stderr.on("data", data => stderr += data.toString());
  child.on("close", (code) => {
    if (code === 0) cb();
    else {
      console.log(stdout.trim());
      console.error(stderr.trim());
      throw new Error(`Error during '${cmd}'`);
    }
  });
}
const uv = "uv tool run --with-requirements=requirements.txt";
const djlintLint = (cb) => _run(cb, `${uv} djlint --lint theme output`);
const djlintCheck = (cb) => _run(cb, `${uv} djlint --check theme`);
const reuse = (cb) => _run(cb, `${uv} reuse lint`);
const yamllint = (cb) => _run(cb, `${uv} yamllint --strict .`);
const renovateConfigValidator = (cb) => _run(cb, `npm exec --no renovate-config-validator`);
const dprint = (cb) => _run(cb, `npm exec --no dprint check`);
const watchCss = (cb) => {
  callbacks.push(cb);
  return watch(paths.css, css);
};
const watchJs = (cb) => {
  callbacks.push(cb);
  return watch(paths.jsInput, js);
};

const check = parallel(
  djlintCheck,
  djlintLint,
  dprint,
  purge,
  renovateConfigValidator,
  reuse,
  stylelint,
  yamllint,
);
const tasks = [parallel(js, css), removeOutput, pelican, check];
const default_ = series(...tasks);
default_.description = "Build then run all checks";
const serve = series(...tasks, parallel(watchCss, watchJs, pelicanListen));
serve.description = `Build, check then serve at ${loopback} and watch for changes.`;
export { serve };
export default default_;

// gulpfile.js
// Copyright 2024 Keith Maxwell
// SPDX-License-Identifier: MPL-2.0
