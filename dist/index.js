"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var vgm_1 = __importDefault(require("./vgm"));
var buffer_1 = require("./buffer");
var psg2opl_1 = __importDefault(require("./psg2opl"));
var opll2opl_1 = __importDefault(require("./opll2opl"));
function toOPLType(type) {
    switch (type) {
        case "opl2":
        case "ym3812":
            return "ym3812";
        case "opl":
        case "ym3526":
            return "ym3526";
        case "y8950":
            return "y8950";
        case "opl3":
        case "ymf262":
            return "ymf262";
        default:
            return null;
    }
}
var Converter = /** @class */ (function () {
    function Converter(vgm, opllTo, psgTo) {
        this._opl3initialized = false;
        this._vgm = vgm;
        this._orgLoopOffset =
            this._vgm.header.offsets.loop - this._vgm.header.offsets.data;
        this._newLoopOffset = 0;
        this._data = new buffer_1.InputBuffer(vgm.data.buffer);
        this._output = new buffer_1.OutputBuffer(new ArrayBuffer(8));
        this._opllTo = opllTo;
        this._psgTo = psgTo;
        this._oplClock = vgm.header.chips.ym2413
            ? vgm.header.chips.ym2413.clock
            : 3579545;
        var psgToType = toOPLType(this._psgTo);
        if (psgToType) {
            this._psg2opl = new psg2opl_1.default(psgToType, vgm.header.chips.ay8910 ? vgm.header.chips.ay8910.clock : 3579545 / 2, this._oplClock);
        }
        var opllToType = toOPLType(this._opllTo);
        if (opllToType) {
            this._opll2opl = new opll2opl_1.default(opllToType, vgm.header.chips.ym2413 ? vgm.header.chips.ym2413.clock : 3579545, this._oplClock);
        }
    }
    Converter.prototype._processGameGearPsg = function () {
        var d = this._data.readByte();
        this._output.writeByte(d);
    };
    Converter.prototype._processSn76489 = function () {
        var d = this._data.readByte();
        this._output.writeByte(d);
    };
    Converter.prototype._processYm2413 = function () {
        if (!this._opll2opl)
            return;
        this._initializeOPL3();
        var a = this._data.readByte();
        var d = this._data.readByte();
        var data = this._opll2opl.interpret(a, d);
        for (var i = 0; i < data.length; i++) {
            var _a = data[i], a_1 = _a.a, d_1 = _a.d;
            this._output.writeByte(this._opll2opl.command);
            this._output.writeByte(a_1);
            this._output.writeByte(d_1);
        }
    };
    Converter.prototype._initializeOPL3 = function () {
        if (this._opllTo === "ymf262") {
            if (!this._opl3initialized) {
                this._output.writeByte(0x5e);
                this._output.writeByte(0x05);
                this._output.writeByte(0x01);
                this._opl3initialized = true;
            }
        }
    };
    Converter.prototype._processAY8910 = function () {
        if (!this._psg2opl)
            return;
        this._initializeOPL3();
        var a = this._data.readByte();
        var d = this._data.readByte();
        var data = this._psg2opl.interpret(a, d);
        for (var i = 0; i < data.length; i++) {
            var _a = data[i], a_2 = _a.a, d_2 = _a.d;
            this._output.writeByte(this._psg2opl.command);
            this._output.writeByte(a_2);
            this._output.writeByte(d_2);
        }
    };
    Converter.prototype._processCommon = function () {
        var a = this._data.readByte();
        var d = this._data.readByte();
        this._output.writeByte(a);
        this._output.writeByte(d);
    };
    Converter.prototype._processCommon2 = function () {
        var p = this._data.readByte();
        var a = this._data.readByte();
        var d = this._data.readByte();
        this._output.writeByte(p);
        this._output.writeByte(a);
        this._output.writeByte(d);
    };
    Converter.prototype._processSeekPcmDataBank = function () {
        this._output.writeDword(this._data.readDword());
    };
    Converter.prototype._processDataBlock = function () {
        if (this._data.readByte() != 0x66) {
            throw new Error();
        }
        this._output.writeByte(0x66);
        var type = this._data.readByte();
        var size = this._data.readDword();
        this._output.writeByte(type);
        this._output.writeDword(size);
        for (var i = 0; i < size; i++) {
            this._output.writeByte(this._data.readByte());
        }
    };
    Converter.prototype._detectNewLoopOffset = function () {
        if (0 <= this._orgLoopOffset && this._newLoopOffset === 0) {
            if (this._orgLoopOffset <= this._data.readOffset) {
                this._newLoopOffset = this._output.writeOffset;
            }
        }
    };
    Converter.prototype._buildVGM = function () {
        var dataLength = this._output.writeOffset;
        var vgm = new vgm_1.default(this._vgm.header, this._output.buffer);
        vgm.header.version = 0x171;
        vgm.header.offsets.data = 0x100;
        if (this._newLoopOffset) {
            vgm.header.offsets.loop = vgm.header.offsets.data + this._newLoopOffset;
        }
        else {
            vgm.header.offsets.loop = 0;
        }
        vgm.header.offsets.eof = vgm.header.offsets.data + dataLength;
        if (this._opllTo === "none") {
            vgm.header.chips.ym2413 = undefined;
        }
        else if (this._opll2opl) {
            vgm.header.chips[this._opll2opl.type] = {
                clock: this._opll2opl.clock,
            };
            vgm.header.chips.ym2413 = undefined;
        }
        if (this._psgTo === "none") {
            vgm.header.chips.ay8910 = undefined;
        }
        else if (this._psg2opl) {
            vgm.header.chips[this._psg2opl.type] = {
                clock: this._psg2opl.clock,
            };
            vgm.header.chips.ay8910 = undefined;
        }
        return vgm.build();
    };
    Converter.prototype.convert = function () {
        while (!this._data.eod) {
            var d = this._data.readByte();
            if (d == 0x67) {
                this._output.writeByte(d);
                this._processDataBlock();
            }
            else if (d == 0x61) {
                this._output.writeByte(d);
                this._output.writeWord(this._data.readWord());
            }
            else if (d == 0x62) {
                this._output.writeByte(d);
            }
            else if (d == 0x63) {
                this._output.writeByte(d);
            }
            else if (d == 0x4f) {
                this._output.writeByte(d);
                this._processGameGearPsg();
            }
            else if (d == 0x50) {
                this._output.writeByte(d);
                this._processSn76489();
            }
            else if (d == 0x51) {
                if (this._opll2opl) {
                    this._processYm2413();
                }
                else {
                    this._output.writeByte(d);
                    this._processCommon();
                }
            }
            else if (0x52 <= d && d <= 0x5f) {
                this._output.writeByte(d);
                this._processCommon();
            }
            else if (d == 0xa0) {
                if (this._psg2opl) {
                    this._processAY8910();
                }
                else {
                    this._output.writeByte(d);
                    this._processCommon();
                }
            }
            else if (0xb0 <= d && d <= 0xbf) {
                this._output.writeByte(d);
                this._processCommon();
            }
            else if (0xd0 <= d && d <= 0xd6) {
                this._output.writeByte(d);
                this._processCommon2();
            }
            else if (d == 0xe0) {
                this._output.writeByte(d);
                this._processSeekPcmDataBank();
            }
            else if (0x70 <= d && d <= 0x7f) {
                this._output.writeByte(d);
            }
            else if (0x80 <= d && d <= 0x8f) {
                this._output.writeByte(d);
            }
            else if (d == 0x66) {
                this._output.writeByte(d);
                break;
            }
            else {
                throw new Error("Unsupported command: 0x" + d.toString(16));
            }
            this._detectNewLoopOffset();
        }
        return this._buildVGM();
    };
    return Converter;
}());
exports.default = Converter;
