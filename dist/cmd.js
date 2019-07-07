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
    .option("type", {
    alias: "t",
    describe: "Specify output chip",
    choices: ["ym3812", "ym3526", "y8950"],
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
    var buf = zip ? zlib_1.default.gzipSync(data) : data;
    fs_1.default.writeFileSync(name + "." + (zip ? "vgz" : "vgm"), new Uint8Array(buf));
}
var input = argv._[0];
var type = argv.type.toLowerCase();
if (input == null) {
    yargs.showHelp();
    process.exit(1);
}
var vgm = loadVgm(input);
var res = new index_1.default(vgm, type).convert();
var name = argv.output ? "" + argv.output : path_1.default.basename(input) + "." + type;
saveVgm(name, res, argv.zip || false);
