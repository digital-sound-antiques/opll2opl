#!/usr/bin/env node
import fs from "fs";
import zlib from "zlib";
import path from "path";
import YARGS from "yargs";

import VGM from "./vgm";
import Converter from "./index";

const yargs = YARGS.usage("Usage: $0 [options] vgmfile")
  .option("to", {
    alias: "t",
    describe: "Convert ym2413 track to specified device.",
    choices: ["ym3812", "ym3526", "y8950", "ymf262", "none"],
    default: "ym3812",
  })
  .option("output", {
    alias: "o",
    describe: "Specify output file name",
  })
  .option("zip", {
    alias: "z",
    describe: "Zip-compress output",
    boolean: true,
  })
  .option("psg-to", {
    alias: "p",
    describe:
      "Convert ay-3-8910 track to specified device. ym2413 and ay-3-8910 tracks are converted simultaneously only if ymf262 is selected.",
    choices: ["ym3812", "ym3526", "y8950", "ymf262", "none"],
    default: "none",
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
  const m = name.match(/^(.*)(\.vg(m|z))$/i);
  const nameExt = m ? `${m[1]}.${zip ? "vgz" : "vgm"}` : name;

  const buf = zip ? zlib.gzipSync(data) : data;
  fs.writeFileSync(`${nameExt}`, new Uint8Array(buf));
}

const input = argv._[0];
const opllTo = argv.to.toLowerCase();
const psgTo = argv["psg-to"].toLowerCase();

if (input == null) {
  yargs.showHelp();
  process.exit(1);
}

const vgm = loadVgm(input);
const res = new Converter(vgm, opllTo, psgTo).convert();

const name = argv.output ? `${argv.output}` : `${path.basename(input)}.out.vgm`;

saveVgm(name, res, argv.zip || false);
