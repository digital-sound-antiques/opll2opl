"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var opll_voices_1 = __importStar(require("./opll-voices"));
function getModOffset(ch) {
    return 8 * Math.floor(ch / 3) + (ch % 3);
}
function _R(rate) {
    return rate;
}
function type2cmd(type) {
    switch (type) {
        case "ym3526":
            return 0x5b;
        case "y8950":
            return 0x5c;
        case "ymf262":
            return 0x5e;
        case "ym3812":
        default:
            return 0x5a;
    }
}
var OPLLToOPL = /** @class */ (function () {
    function OPLLToOPL(type) {
        this._regs = new Uint8Array(256).fill(0);
        this._oplRegs = new Uint8Array(256).fill(0);
        this._rflag = false;
        this._initialized = false;
        this._type = type;
        this._command = type2cmd(type);
    }
    Object.defineProperty(OPLLToOPL.prototype, "command", {
        get: function () {
            return this._command;
        },
        enumerable: true,
        configurable: true
    });
    OPLLToOPL.prototype._buildVoiceSetup = function (ch, v, modVolume, carVolume, al) {
        var modOffset = getModOffset(ch);
        var carOffset = modOffset + 3;
        return [
            {
                a: 0x20 + modOffset,
                d: (v.mod.am << 7) |
                    (v.mod.pm << 6) |
                    (v.mod.eg << 5) |
                    (v.mod.kr << 4) |
                    v.mod.ml,
            },
            {
                a: 0x20 + carOffset,
                d: (v.car.am << 7) |
                    (v.car.pm << 6) |
                    (v.car.eg << 5) |
                    (v.car.kr << 4) |
                    v.car.ml,
            },
            {
                a: 0x40 + modOffset,
                d: (v.mod.kl << 6) | (modVolume ? modVolume : v.mod.tl),
            },
            {
                a: 0x40 + carOffset,
                d: (v.car.kl << 6) | (carVolume ? carVolume : v.car.tl),
            },
            {
                a: 0x60 + modOffset,
                d: (_R(v.mod.ar) << 4) | _R(v.mod.dr),
            },
            {
                a: 0x60 + carOffset,
                d: (_R(v.car.ar) << 4) | _R(v.car.dr),
            },
            {
                a: 0x80 + modOffset,
                d: (v.mod.sl << 4) | _R(v.mod.rr),
            },
            {
                a: 0x80 + carOffset,
                d: (v.car.sl << 4) | _R(v.car.rr),
            },
            {
                a: 0xc0 + ch,
                d: (v.mod.fb << 1) | al,
            },
            { a: 0xe0 + modOffset, d: v.mod.wf ? 1 : 0 },
            { a: 0xe0 + carOffset, d: v.car.wf ? 1 : 0 },
        ];
    };
    OPLLToOPL.prototype._buildInstAndVolume = function (ch) {
        var d = this._regs[0x30 + ch];
        var inst = (d & 0xf0) >> 4;
        var volume = d & 0xf;
        var voice;
        if (inst === 0) {
            voice = opll_voices_1.rawVoiceToVoice(this._regs);
        }
        else {
            voice = opll_voices_1.default[inst];
        }
        var ret = [];
        if (this._rflag && 6 <= ch) {
            switch (ch) {
                case 6:
                    this._buildVoiceSetup(6, opll_voices_1.default[16], null, (this._regs[0x36] & 0xf) << 1, 0).forEach(function (_a) {
                        var a = _a.a, d = _a.d;
                        ret.push({ a: a, d: d });
                    });
                    break;
                case 7:
                    this._buildVoiceSetup(7, opll_voices_1.default[17], ((this._regs[0x37] >> 4) & 0xf) << 1, (this._regs[0x37] & 0xf) << 1, 1).forEach(function (_a) {
                        var a = _a.a, d = _a.d;
                        ret.push({ a: a, d: d });
                    });
                    break;
                case 8:
                    this._buildVoiceSetup(8, opll_voices_1.default[18], ((this._regs[0x38] >> 4) & 0xf) << 1, (this._regs[0x38] & 0xf) << 1, 1).forEach(function (_a) {
                        var a = _a.a, d = _a.d;
                        ret.push({ a: a, d: d });
                    });
                    break;
            }
        }
        else {
            this._buildVoiceSetup(ch, voice, null, volume << 2, 0).forEach(function (_a) {
                var a = _a.a, d = _a.d;
                ret.push({ a: a, d: d });
            });
        }
        return ret;
    };
    OPLLToOPL.prototype._interpretOpll = function (a, d) {
        this._regs[a & 0xff] = d & 0xff;
        if (a == 0x0e) {
            var ret = [];
            if (d & 0x20 && !this._rflag) {
                this._rflag = true;
                var ret_1 = this._buildInstAndVolume(6);
                ret_1 = ret_1.concat(this._buildInstAndVolume(7));
                ret_1 = ret_1.concat(this._buildInstAndVolume(8));
            }
            else if (!(d & 0x20) && this._rflag) {
                this._rflag = false;
                var ret_2 = this._buildInstAndVolume(6);
                ret_2 = ret_2.concat(this._buildInstAndVolume(7));
                ret_2 = ret_2.concat(this._buildInstAndVolume(8));
                ret_2.push({ a: 0xbd, d: 0xc0 | (d & 0x3f) });
            }
            else {
                this._rflag = d & 0x20 ? true : false;
            }
            ret.push({ a: 0xbd, d: 0xc0 | (d & 0x3f) });
            return ret;
        }
        if (0x10 <= a && a <= 0x18) {
            var ch = a & 0xf;
            return [
                {
                    a: 0xb0 + ch,
                    d: ((this._regs[0x20 + ch] & 0x1f) << 1) | ((d & 0x80) >> 7),
                },
                { a: 0xa0 + ch, d: (d & 0x7f) << 1 },
            ];
        }
        if (0x20 <= a && a <= 0x28) {
            var ch = a & 0xf;
            var res = [
                {
                    a: 0xb0 + ch,
                    d: ((d & 0x1f) << 1) | ((this._regs[0x10 + ch] & 0x80) >> 7),
                },
                { a: 0xa0 + ch, d: (this._regs[0x10 + ch] & 0x7f) << 1 },
            ];
            return res;
        }
        if (0x30 <= a && a <= 0x38) {
            var ch = a & 0xf;
            return this._buildInstAndVolume(ch);
        }
        return [];
    };
    OPLLToOPL.prototype.interpretOpll = function (a, d) {
        var _this = this;
        var res = [];
        if (!this._initialized) {
            res.push({
                a: 0x01,
                d: 0x20,
            });
            this._initialized = true;
        }
        res = res.concat(this._interpretOpll(a, d));
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
    return OPLLToOPL;
}());
exports.default = OPLLToOPL;
