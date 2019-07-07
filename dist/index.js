"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var vgm_1 = __importDefault(require("./vgm"));
var buffer_1 = require("./buffer");
var opll2opl_1 = __importDefault(require("./opll2opl"));
var Converter = /** @class */ (function () {
    function Converter(vgm, dest) {
        this._vgm = vgm;
        this._orgLoopOffset =
            this._vgm.header.offsets.loop - this._vgm.header.offsets.data;
        this._newLoopOffset = 0;
        this._data = new buffer_1.InputBuffer(vgm.data.buffer);
        this._output = new buffer_1.OutputBuffer(new ArrayBuffer(8));
        var chip = (function (chip) {
            switch (chip) {
                case "ym3812":
                case "ym3526":
                case "y8950":
                    return chip;
                default:
                    return "ym3812";
            }
        })(dest);
        this._converter = new opll2opl_1.default(chip);
        this._destChip = chip;
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
        var a = this._data.readByte();
        var d = this._data.readByte();
        var data = this._converter.interpretOpll(a, d);
        for (var i = 0; i < data.length; i++) {
            var _a = data[i], a_1 = _a.a, d_1 = _a.d;
            this._output.writeByte(this._converter.command);
            this._output.writeByte(a_1);
            this._output.writeByte(d_1);
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
        if (this._orgLoopOffset !== 0 && this._newLoopOffset === 0) {
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
        vgm.header.offsets.loop = vgm.header.offsets.data + this._newLoopOffset;
        vgm.header.offsets.eof = vgm.header.offsets.data + dataLength;
        vgm.header.chips[this._destChip] = {
            clock: vgm.header.chips.ym2413.clock,
        };
        vgm.header.chips.ym2413 = undefined;
        return vgm.build();
    };
    Converter.prototype.convert = function () {
        if (!this._vgm.header.chips.ym2413) {
            throw new Error("There is no YM2413 data sequences.");
        }
        while (!this._data.eod) {
            this._detectNewLoopOffset();
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
                this._processYm2413();
            }
            else if (0x52 <= d && d <= 0x5f) {
                this._output.writeByte(d);
                this._processCommon();
            }
            else if (d == 0xa0) {
                this._output.writeByte(d);
                this._processCommon();
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
        }
        return this._buildVGM();
    };
    return Converter;
}());
exports.default = Converter;
