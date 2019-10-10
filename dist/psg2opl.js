"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getModOffset(ch) {
    return 8 * Math.floor(ch / 3) + (ch % 3);
}
function type2cmd(type) {
    switch (type) {
        case "ym3526":
            return 0x5b;
        case "y8950":
            return 0x5c;
        case "ymf262":
            return 0x5f;
        case "ym3812":
        default:
            return 0x5a;
    }
}
var PSGToOPL = /** @class */ (function () {
    function PSGToOPL(type, psgClock, oplClock) {
        this._regs = new Uint8Array(256).fill(0);
        this._oplRegs = new Uint8Array(256).fill(0);
        this._initialized = false;
        this._type = type;
        this._psgClock = psgClock;
        this._oplClock = oplClock;
        this._command = type2cmd(this._type);
    }
    Object.defineProperty(PSGToOPL.prototype, "type", {
        get: function () {
            return this._type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PSGToOPL.prototype, "clock", {
        get: function () {
            return this._type === "ymf262" ? this._oplClock * 4 : this._oplClock;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PSGToOPL.prototype, "command", {
        get: function () {
            return this._command;
        },
        enumerable: true,
        configurable: true
    });
    PSGToOPL.prototype._updateFreq = function (ch, freq) {
        var fnum = Math.floor((freq << 19) / (this._oplClock / 72));
        var blk = 1;
        while (fnum > 1023) {
            fnum >>= 1;
            blk++;
        }
        if (blk > 7)
            blk = 7;
        return [
            { a: 0xa0 + ch, d: fnum & 0xff },
            { a: 0xb0 + ch, d: 0x20 | ((blk & 7) << 2) | ((fnum >> 8) & 3) },
        ];
    };
    PSGToOPL.prototype._updateVol = function (ch, vol) {
        var tl = [63, 62, 56, 52, 46, 42, 36, 32, 28, 24, 20, 16, 12, 8, 4, 0][vol & 0xf];
        var t = ((1 << ch) & this._regs[0x7]) === 0;
        var n = ((8 << ch) & this._regs[0x7]) === 0;
        var moff = getModOffset(ch);
        var coff = moff + 3;
        return [{ a: 0x40 + coff, d: t || n ? tl : 0x3f }];
    };
    PSGToOPL.prototype._updateTone = function (ch) {
        var t = ((1 << ch) & this._regs[0x7]) === 0;
        var n = ((8 << ch) & this._regs[0x7]) === 0;
        var moff = getModOffset(ch);
        return [{ a: 0x40 + moff, d: t && n ? 0x10 : t ? 0x1b : 0x00 }];
    };
    PSGToOPL.prototype._interpret = function (a, d) {
        this._regs[a & 0xff] = d & 0xff;
        if (a <= 0x05) {
            var ch = a >> 1;
            var tp = (this._regs[ch * 2 + 1] << 8) | this._regs[ch * 2];
            var freq = this._psgClock / (16 * tp);
            return this._updateFreq(ch, freq);
        }
        if (0x08 <= a && a <= 0x0a) {
            var ch = a - 8;
            var vol = d & 0x10 ? 0 : d & 0xf;
            return this._updateVol(ch, vol);
        }
        if (a === 0x07) {
            return this._updateTone(0)
                .concat(this._updateTone(1))
                .concat(this._updateTone(2));
        }
        return [];
    };
    PSGToOPL.prototype.interpret = function (a, d) {
        var _this = this;
        var res = [];
        if (!this._initialized) {
            for (var ch = 0; ch < 3; ch++) {
                var moff = getModOffset(ch);
                var coff = moff + 3;
                res = res.concat([
                    { a: 0x20 + moff, d: 0x02 },
                    { a: 0x20 + coff, d: 0x01 },
                    { a: 0x40 + moff, d: 0x1b },
                    { a: 0x40 + coff, d: 0x00 },
                    { a: 0x60 + moff, d: 0xf0 },
                    { a: 0x60 + coff, d: 0xf0 },
                    { a: 0x80 + moff, d: 0x00 },
                    { a: 0x80 + coff, d: 0x00 },
                    { a: 0xc0 + ch, d: this._type === "ymf262" ? 0xfe : 0x0e },
                    { a: 0xe0 + ch, d: 0x00 },
                ]);
            }
            this._initialized = true;
        }
        res = res.concat(this._interpret(a, d));
        res = res.filter(function (_a) {
            var a = _a.a, d = _a.d;
            return _this._oplRegs[a] !== d;
        });
        res.forEach(function (_a) {
            var a = _a.a, d = _a.d;
            _this._oplRegs[a] = d;
        });
        return res;
    };
    return PSGToOPL;
}());
exports.default = PSGToOPL;
