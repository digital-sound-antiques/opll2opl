#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var zlib_1 = __importDefault(require("zlib"));
var path_1 = __importDefault(require("path"));
var yargs_1 = __importDefault(require("yargs"));
var vgm_1 = __importDefault(require("./vgm"));
var index_1 = __importDefault(require("./index"));
var yargs = yargs_1.default.usage("Usage: $0 [options] vgmfile")
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
    describe: "Convert ay-3-8910 track to specified device. ym2413 and ay-3-8910 tracks are converted simultaneously only if ymf262 is selected.",
    choices: ["ym3812", "ym3526", "y8950", "ymf262", "none"],
    default: "none",
})
    .demandCommand(1)
    .help();
var argv = yargs.argv;
function loadVgm(input) {
    var vgm;
    var buf = fs_1.default.readFileSync(input);
    try {
        vgm = zlib_1.default.gunzipSync(buf);
    }
    catch (e) {
        vgm = buf;
    }
    return vgm_1.default.parse(vgm.buffer);
}
function saveVgm(name, data, zip) {
    var m = name.match(/^(.*)(\.vg(m|z))$/i);
    var nameExt = m ? m[1] + "." + (zip ? "vgz" : "vgm") : name;
    var buf = zip ? zlib_1.default.gzipSync(data) : data;
    fs_1.default.writeFileSync("" + nameExt, new Uint8Array(buf));
}
var input = argv._[0];
var opllTo = argv.to.toLowerCase();
var psgTo = argv["psg-to"].toLowerCase();
if (input == null) {
    yargs.showHelp();
    process.exit(1);
}
var vgm = loadVgm(input);
var res = new index_1.default(vgm, opllTo, psgTo).convert();
var name = argv.output ? "" + argv.output : path_1.default.basename(input) + ".out.vgm";
saveVgm(name, res, argv.zip || false);
