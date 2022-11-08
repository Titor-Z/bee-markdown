
const typescript = require("rollup-plugin-typescript2")
const resolve = require("@rollup/plugin-node-resolve");
const babel =require("@rollup/plugin-babel");
const commonjs =require("@rollup/plugin-commonjs");
const json = require("@rollup/plugin-json")


exports.default = {
  input: "src/command.ts",
  output: {
    format: "cjs",
    file: "bin/bin.js",
    banner: "#!/usr/bin/env node \n",
  },
  plugins: [
    babel({ babelHelpers: "bundled" }),
    typescript(),
    resolve(),
    commonjs(),
    json()
  ],
  external: [
    "process",
    "fs",
    "buffer",
    "path/posix",
    "chalk",
    "yargs",
    "highlight.js",
    "markdown-it"
  ],
};
