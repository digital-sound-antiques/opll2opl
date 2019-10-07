#!/usr/bin/env node
import fs from "fs";
import zlib from "zlib";
import path from "path";
import YARGS from "yargs";

import VGM from "./vgm";
import Converter from "./index";

const yargs = YARGS.usage("Usage: $0 [options] vgmfile")
  .option("type", {
    alias: "t",
    describe: "Specify output chip",
    choices: ["ym3812", "ym3526", "y8950", "ymf262"],
    default: "ym3812",
  })
  .option("output", {
    alias: "o",
    describe: "Specify output file name (without file extension)",
  })
  .option("zip", {
    alias: "z",
    describe: "Zip-compress output",
    boolean: true,
  })
  .demandCommand(1)
  .help();

const argv = yargs.argv;

function loadVgm(input: string): VGM {
  let vgm: Buffer;
  const buf = fs.readFileSync(input);
  try {
    vgm = zlib.gunzipSync(buf);
  } catch (e) {
    vgm = buf;
  }
  return VGM.parse(vgm!.buffer);
}

function saveVgm(name: string, data: ArrayBuffer, zip: boolean) {
  const buf = zip ? zlib.gzipSync(data) : data;
  fs.writeFileSync(`${name}.${zip ? "vgz" : "vgm"}`, new Uint8Array(buf));
}

const input = argv._[0];
const type = argv.type.toLowerCase();

if (input == null) {
  yargs.showHelp();
  process.exit(1);
}

const vgm = loadVgm(input);
const res = new Converter(vgm, type).convert();

const name = argv.output ? `${argv.output}` : `${path.basename(input)}.${type}`;
saveVgm(name, res, argv.zip || false);
