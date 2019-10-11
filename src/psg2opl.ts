import OPLType from "./opl-type";

function getModOffset(ch: number) {
  return 8 * Math.floor(ch / 3) + (ch % 3);
}

function type2cmd(type: OPLType) {
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

export default class PSGToOPL {
  _regs = new Uint8Array(256).fill(0);
  _oplRegs = new Uint8Array(256).fill(0);
  _type: OPLType;
  _psgClock: number;
  _oplClock: number;
  _command: number;

  constructor(type: OPLType, psgClock: number, oplClock: number) {
    this._type = type;
    this._psgClock = psgClock;
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

  _updateFreq(ch: number, freq: number) {
    let fnum = Math.floor((freq << 19) / (this._oplClock / 72));
    let blk = 1;
    while (fnum > 1023) {
      fnum >>= 1;
      blk++;
    }
    if (blk > 7) blk = 7;
    return [
      { a: 0xb0 + ch, d: 0x20 | ((blk & 7) << 2) | ((fnum >> 8) & 3) },
      { a: 0xa0 + ch, d: fnum & 0xff },
    ];
  }

  _updateNoiseFreq(np: number) {
    const fnum = 1024 / (np + 1) - 1;
    const blk = 7;
    const res = [];
    for (let ch = 3; ch < 6; ch++) {
      res.push({
        a: 0xb0 + ch,
        d: 0x20 | ((blk & 7) << 2) | ((fnum >> 8) & 3),
      });
      res.push({ a: 0xa0 + ch, d: fnum & 0xff });
    }
    return res;
  }

  _initialized = false;

  _setupVoice() {
    let res: { a: number; d: number }[] = [];
    // TONE
    for (let ch = 0; ch < 3; ch++) {
      const moff = getModOffset(ch);
      const coff = moff + 3;
      res = res.concat([
        { a: 0x20 + moff, d: 0x02 }, // ML(mod)
        { a: 0x20 + coff, d: 0x01 }, // ML(car)
        { a: 0x40 + moff, d: 0x1b }, // TL(mod)
        { a: 0x40 + coff, d: 0x3f }, // TL(car)
        { a: 0x60 + moff, d: 0xf0 },
        { a: 0x60 + coff, d: 0xf0 },
        { a: 0x80 + moff, d: 0x00 },
        { a: 0x80 + coff, d: 0x00 },
        { a: 0xc0 + ch, d: this._type === "ymf262" ? 0xfe : 0x0e },
        { a: 0xe0 + ch, d: 0x00 },
      ]);
    }
    // NOISE
    for (let ch = 3; ch < 6; ch++) {
      const moff = getModOffset(ch);
      const coff = moff + 3;
      res = res.concat([
        { a: 0x20 + moff, d: 0x0f }, // ML(mod)
        { a: 0x20 + coff, d: 0x0f }, // ML(car)
        { a: 0x40 + moff, d: 0x04 }, // TL(mod)
        { a: 0x40 + coff, d: 0x3f }, // TL(car)
        { a: 0x60 + moff, d: 0xf0 },
        { a: 0x60 + coff, d: 0xf0 },
        { a: 0x80 + moff, d: 0x00 },
        { a: 0x80 + coff, d: 0x00 },
        { a: 0xc0 + ch, d: this._type === "ymf262" ? 0xfe : 0x0e },
        { a: 0xe0 + ch, d: 0x00 },
      ]);
    }
    return res;
  }

  _updateTone(ch: number) {
    let res: { a: number; d: number }[] = [];

    if (!this._initialized) {
      res = this._setupVoice();
      this._initialized = true;
    }

    const t = ((1 << ch) & this._regs[0x7]) === 0;
    const n = ((8 << ch) & this._regs[0x7]) === 0;
    const v = this._regs[0x08 + ch];
    const vol = v & 0x10 ? 0 : v & 0xf;

    const tl = [63, 62, 56, 52, 46, 42, 36, 32, 28, 24, 20, 16, 12, 8, 4, 0][
      vol & 0xf
    ];

    const coff = getModOffset(ch) + 3;
    if (t) {
      res.push({ a: 0x40 + coff, d: tl });
    } else {
      res.push({ a: 0x40 + coff, d: 0x3f });
    }

    const coff2 = getModOffset(ch + 3) + 3;
    if (n) {
      res.push({ a: 0x40 + coff2, d: tl });
    } else {
      res.push({ a: 0x40 + coff2, d: 0x3f });
    }

    return res;
  }

  _interpret(a: number, d: number): { a: number; d: number }[] {
    this._regs[a & 0xff] = d & 0xff;
    if (a <= 0x05) {
      const ch = a >> 1;
      const tp = (this._regs[ch * 2 + 1] << 8) | this._regs[ch * 2];
      const freq = this._psgClock / (16 * tp);
      return this._updateFreq(ch, freq);
    }

    if (0x08 <= a && a <= 0x0a) {
      return this._updateTone(a - 0x08);
    }

    if (a === 0x06) {
      const np = this._regs[0x06] & 0x1f;
      return this._updateNoiseFreq(np);
    }

    if (a === 0x07) {
      return this._updateTone(0)
        .concat(this._updateTone(1))
        .concat(this._updateTone(2));
    }

    return [];
  }

  interpret(a: number, d: number) {
    let res: { a: number; d: number }[] = [];
    res = res.concat(this._interpret(a, d));
    res = res.filter(({ a, d }) => this._oplRegs[a] !== d);
    res.forEach(({ a, d }) => {
      this._oplRegs[a] = d;
    });
    return res;
  }
}
