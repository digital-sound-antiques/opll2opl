import OPLL_VOICES, { OPLLVoice, rawVoiceToVoice } from "./opll-voices";
import OPLType from "./opl-type";

function getModOffset(ch: number) {
  return 8 * Math.floor(ch / 3) + (ch % 3);
}

function _R(rate: number) {
  // if (8 < rate && rate < 15) return rate + 1;
  return rate;
}

function type2cmd(type: OPLType) {
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

export default class OPLL2OPL {
  _regs = new Uint8Array(256).fill(0);
  _oplRegs = new Uint8Array(256).fill(0);
  _type: OPLType;
  _opllClock: number;
  _oplClock: number;
  _command: number;

  // clock rate-conversion is still not supported.
  constructor(type: OPLType, opllClock: number, oplClock: number) {
    this._type = type;
    this._opllClock = opllClock;
    this._oplClock = oplClock;
    this._command = type2cmd(this._type);
  }

  get type() {
    return this._type;
  }

  get clock() {
    return this._type === "ymf262" ? this._oplClock * 4 : this._oplClock;
  }

  get command() {
    return this._command;
  }

  _buildVoiceSetup(
    ch: number,
    v: OPLLVoice,
    modVolume: number | null,
    carVolume: number | null,
    al: number
  ): { a: number; d: number }[] {
    const modOffset = getModOffset(ch);
    const carOffset = modOffset + 3;
    return [
      {
        a: 0x20 + modOffset,
        d:
          (v.mod.am << 7) |
          (v.mod.pm << 6) |
          (v.mod.eg << 5) |
          (v.mod.kr << 4) |
          v.mod.ml,
      },
      {
        a: 0x20 + carOffset,
        d:
          (v.car.am << 7) |
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
        d: (this._type === "ymf262" ? 0xf0 : 0) | (v.mod.fb << 1) | al,
      },
      { a: 0xe0 + modOffset, d: v.mod.wf ? 1 : 0 },
      { a: 0xe0 + carOffset, d: v.car.wf ? 1 : 0 },
    ];
  }

  _rflag: boolean = false;

  _buildInstAndVolume(ch: number): { a: number; d: number }[] {
    const d = this._regs[0x30 + ch];
    const inst = (d & 0xf0) >> 4;
    const volume = d & 0xf;
    let voice: OPLLVoice;
    if (inst === 0) {
      voice = rawVoiceToVoice(this._regs);
    } else {
      voice = OPLL_VOICES[inst];
    }

    const ret: { a: number; d: number }[] = [];
    if (this._rflag && 6 <= ch) {
      switch (ch) {
        case 6:
          this._buildVoiceSetup(
            6,
            OPLL_VOICES[16],
            null,
            (this._regs[0x36] & 0xf) << 1,
            0
          ).forEach(({ a, d }) => {
            ret.push({ a, d });
          });
          break;
        case 7:
          this._buildVoiceSetup(
            7,
            OPLL_VOICES[17],
            ((this._regs[0x37] >> 4) & 0xf) << 1,
            (this._regs[0x37] & 0xf) << 1,
            1
          ).forEach(({ a, d }) => {
            ret.push({ a, d });
          });
          break;
        case 8:
          this._buildVoiceSetup(
            8,
            OPLL_VOICES[18],
            ((this._regs[0x38] >> 4) & 0xf) << 1,
            (this._regs[0x38] & 0xf) << 1,
            1
          ).forEach(({ a, d }) => {
            ret.push({ a, d });
          });
          break;
      }
    } else {
      this._buildVoiceSetup(ch, voice, null, volume << 2, 0).forEach(
        ({ a, d }) => {
          ret.push({ a, d });
        }
      );
    }

    return ret;
  }

  _interpret(a: number, d: number): { a: number; d: number }[] {
    this._regs[a & 0xff] = d & 0xff;

    if (a == 0x0e) {
      let ret = [];
      if (d & 0x20 && !this._rflag) {
        this._rflag = true;
        let ret = this._buildInstAndVolume(6);
        ret = ret.concat(this._buildInstAndVolume(7));
        ret = ret.concat(this._buildInstAndVolume(8));
      } else if (!(d & 0x20) && this._rflag) {
        this._rflag = false;
        let ret = this._buildInstAndVolume(6);
        ret = ret.concat(this._buildInstAndVolume(7));
        ret = ret.concat(this._buildInstAndVolume(8));
        ret.push({ a: 0xbd, d: 0xc0 | (d & 0x3f) });
      } else {
        this._rflag = d & 0x20 ? true : false;
      }
      ret.push({ a: 0xbd, d: 0xc0 | (d & 0x3f) });
      return ret;
    }

    if (0x10 <= a && a <= 0x18) {
      const ch = a & 0xf;
      return [
        {
          a: 0xb0 + ch,
          d: ((this._regs[0x20 + ch] & 0x1f) << 1) | ((d & 0x80) >> 7),
        },
        { a: 0xa0 + ch, d: (d & 0x7f) << 1 },
      ];
    }

    if (0x20 <= a && a <= 0x28) {
      const ch = a & 0xf;
      const res = [
        {
          a: 0xb0 + ch,
          d: ((d & 0x1f) << 1) | ((this._regs[0x10 + ch] & 0x80) >> 7),
        },
        { a: 0xa0 + ch, d: (this._regs[0x10 + ch] & 0x7f) << 1 },
      ];
      return res;
    }

    if (0x30 <= a && a <= 0x38) {
      const ch = a & 0xf;
      return this._buildInstAndVolume(ch);
    }

    return [];
  }

  _initialized: boolean = false;

  interpret(a: number, d: number) {
    let res: { a: number; d: number }[] = [];
    if (!this._initialized) {
      res.push({
        a: 0x01,
        d: 0x20, // YM3812 mode
      });
      this._initialized = true;
    }
    res = res.concat(this._interpret(a, d));
    res = res.filter(({ a, d }) => this._oplRegs[a] !== d);
    res.forEach(({ a, d }) => {
      this._oplRegs[a] = d;
    });
    return res;
  }
}
