type ChipType = {
  value: number;
  name: string;
};

export type Chips = {
  sn76489?: {
    clock: number;
    feedback: number;
    shiftRegisterWidth: number;
    flags: number;
  };
  ym2413?: { clock: number };
  ym2612?: { clock: number; chipType: ChipType };
  ym2151?: { clock: number; chipType: ChipType };
  segaPcm?: { clock: number; interfaceRegister: number };
  rf5c68?: { clock: number };
  ym2203?: { clock: number; ssgFlags: number };
  ym2608?: { clock: number; ssgFlags: number };
  ym2610?: { clock: number; chipType: ChipType };
  ym3812?: { clock: number };
  ym3526?: { clock: number };
  y8950?: { clock: number };
  ymf262?: { clock: number };
  ymf278b?: { clock: number };
  ymf271?: { clock: number };
  ymz280b?: { clock: number };
  rf5c164?: { clock: number };
  pwm?: { clock: number };
  ay8910?: {
    clock: number;
    chipType: ChipType;
    flags: number;
  };
  gameBoyDmg?: { clock: number };
  nesApu?: { clock: number; fds: boolean };
  multiPcm?: { clock: number };
  upd7759?: { clock: number };
  okim6258?: { clock: number; flags: number };
  okim6295?: { clock: number };
  k051649?: { clock: number };
  k054539?: { clock: number; flags: number };
  huc6280?: { clock: number };
  c140?: { clock: number; chipType: ChipType };
  k053260?: { clock: number };
  pokey?: { clock: number };
  qsound?: { clock: number };
  scsp?: { clock: number };
  wonderSwan?: { clock: number };
  vsu?: { clock: number };
  saa1099?: { clock: number };
  es5503?: { clock: number; numberOfChannels: number };
  es5505?: { clock: number; chipType: ChipType; numberOfChannels: number };
  x1_010?: { clock: number };
  c352?: { clock: number; clockDivider: number };
  ga20?: { clock: number };
};

export type VGMHeader = {
  version: number;
  offsets: {
    eof: number;
    gd3: number;
    loop: number;
    data: number;
    extraHeader: number;
  };
  samples: {
    total: number;
    loop: number;
  };
  rate: number;
  chips: Chips;
  loopModifier: number;
  loopBase: number;
  volumeModifier: number;
};

function getParamsCommon(d: DataView, clockIndex: number) {
  const clock = d.getUint32(clockIndex, true);
  if (clock) {
    return { clock };
  }
  return undefined;
}

function getParamsCommonWithFlags(
  d: DataView,
  clockIndex: number,
  flagsIndex: number
) {
  const clock = d.getUint32(clockIndex, true);
  if (clock) {
    return { clock, flags: d.getUint8(flagsIndex) };
  }
  return undefined;
}

function getParamsSn76489(d: DataView) {
  const obj = getParamsCommonWithFlags(d, 0x0c, 0x2b);
  if (obj) {
    return {
      ...obj,
      feedback: d.getUint16(0x28, true),
      shiftRegisterWidth: d.getUint8(0x2a),
    };
  }
  return undefined;
}

function getParamsSegaPcm(d: DataView) {
  const obj = getParamsCommon(d, 0x38);
  if (obj) {
    return {
      ...obj,
      interfaceRegister: d.getUint32(0x3c, true),
    };
  }
  return undefined;
}

function getParamsYm2151(d: DataView) {
  const obj = getParamsCommon(d, 0x30);
  if (obj) {
    const t = obj.clock >> 31;
    return {
      ...obj,
      clock: obj.clock & 0x7fffffff,
      chipType: {
        value: t,
        name: t ? "YM2164" : "YM2151",
      },
    };
  }
  return undefined;
}

function getParamsYm2203(d: DataView) {
  const obj = getParamsCommon(d, 0x44);
  if (obj) {
    return {
      ...obj,
      ssgFlags: d.getUint8(0x7a),
    };
  }
  return undefined;
}

function getParamsYm2608(d: DataView) {
  const obj = getParamsCommon(d, 0x48);
  if (obj) {
    return {
      ...obj,
      ssgFlags: d.getUint8(0x7b),
    };
  }
  return undefined;
}

function getParamsYm2610(d: DataView) {
  const obj = getParamsCommon(d, 0x48);
  if (obj) {
    const t = d.getUint8(0x4c);
    return {
      ...obj,
      clock: obj.clock & 0x7fffffff,
      chipType: {
        value: t,
        name: t ? "YM2610" : "YM2610B",
      },
    };
  }
  return undefined;
}

function getParamsYm2612(d: DataView) {
  const obj = getParamsCommon(d, 0x2c);
  if (obj) {
    const t = obj.clock >> 31;
    return {
      ...obj,
      clock: obj.clock & 0x7fffffff,
      chipType: {
        value: t,
        name: t ? "YM3438" : "YM2612",
      },
    };
  }
  return undefined;
}

function getParamsNesApu(d: DataView) {
  const obj = getParamsCommon(d, 0x84);
  if (obj) {
    const fds = obj.clock >> 31 !== 0;
    return {
      ...obj,
      clock: obj.clock & 0x7fffffff,
      fds,
    };
  }
  return undefined;
}

function getParamsEs5503(d: DataView) {
  const obj = getParamsCommon(d, 0xcc);
  if (obj) {
    return {
      ...obj,
      numberOfChannels: d.getUint8(0xd4),
    };
  }
  return undefined;
}

function getParamsEs5505(d: DataView) {
  const obj = getParamsCommon(d, 0xd0);
  if (obj) {
    const t = obj.clock >> 30;
    return {
      ...obj,
      clock: obj.clock & 0x7fffffff,
      chipType: {
        value: t,
        name: t ? "ES5506" : "ES5505",
      },
      numberOfChannels: d.getUint8(0xd5),
    };
  }
  return undefined;
}

function getParamsAy8910(d: DataView) {
  const obj = getParamsCommon(d, 0x74);
  if (obj) {
    const t = d.getUint8(0x78);
    const flags = d.getUint8(0x79);
    return {
      ...obj,
      chipType: {
        value: t,
        name: ((t: number) => {
          switch (t) {
            case 0x00:
              return "AY8910";
            case 0x01:
              return "AY8912";
            case 0x02:
              return "AY8913";
            case 0x03:
              return "AY8930";
            case 0x10:
              return "YM2149";
            case 0x11:
              return "YM3439";
            case 0x12:
              return "YMZ284";
            case 0x13:
              return "YMZ294";
            default:
              return "UNKNOWN";
          }
        })(t),
      },
      flags,
    };
  }
  return undefined;
}

function getParamsC140(d: DataView) {
  const obj = getParamsCommon(d, 0xa8);
  if (obj) {
    const t = d.getUint8(0x96);
    return {
      ...obj,
      chipType: {
        value: t,
        name: ((t: number) => {
          switch (t) {
            case 0x00:
              return "C140, Namco System 2";
            case 0x01:
              return "C140, Namco System 21";
            case 0x02:
              return "219 ASIC, Namco NA-1/2";
            default:
              return "UNKNOWN";
          }
        })(t),
      },
    };
  }
  return undefined;
}

function getParamsC352(d: DataView) {
  const obj = getParamsCommon(d, 0xdc);
  if (obj) {
    return {
      ...obj,
      clockDivider: d.getUint8(0xd6),
    };
  }
  return undefined;
}

export function parse(data: ArrayBuffer): VGMHeader {
  const d = new DataView(data);

  const version = d.getUint32(0x08, true);
  const chips: Chips = {
    sn76489: getParamsSn76489(d),
    ym2413: getParamsCommon(d, 0x10),
  };

  const eof = d.getUint32(0x04, true);
  const gd3 = d.getUint32(0x14, true);
  const loop = d.getUint32(0x1c, true);

  const props = {
    version,
    offsets: {
      eof: eof ? 0x04 + eof : 0,
      gd3: gd3 ? 0x14 + gd3 : 0,
      loop: loop ? 0x1c + loop : 0,
      data: 0x40,
      extraHeader: 0,
    },
    samples: {
      total: d.getUint32(0x18, true),
      loop: d.getUint32(0x20, true),
    },
    rate: d.getUint32(0x24, true),
    chips,
    loopModifier: 0,
    loopBase: 0,
    volumeModifier: 0,
  };

  if (version >= 0x110) {
    chips.ym2612 = getParamsYm2612(d);
    chips.ym2151 = getParamsYm2151(d);
  }

  if (version >= 0x150) {
    props.offsets.data = 0x34 + d.getUint32(0x34, true);
  }

  if (version >= 0x151) {
    chips.segaPcm = getParamsSegaPcm(d);
    chips.rf5c68 = getParamsCommon(d, 0x40);
    chips.ym2203 = getParamsYm2203(d);
    chips.ym2608 = getParamsYm2608(d);
    chips.ym2610 = getParamsYm2610(d);

    chips.ym3812 = getParamsCommon(d, 0x50);
    chips.ym3526 = getParamsCommon(d, 0x54);
    chips.y8950 = getParamsCommon(d, 0x58);
    chips.ymf262 = getParamsCommon(d, 0x5c);
    chips.ymf278b = getParamsCommon(d, 0x60);
    chips.ymf271 = getParamsCommon(d, 0x64);
    chips.ymz280b = getParamsCommon(d, 0x68);
    chips.rf5c164 = getParamsCommon(d, 0x6c);
    chips.pwm = getParamsCommon(d, 0x70);
    chips.ay8910 = getParamsAy8910(d);
    props.loopModifier = d.getUint8(0x7f);
  }

  if (version >= 0x160) {
    props.volumeModifier = d.getUint8(0x7c);
    props.loopBase = d.getUint8(0x7e);
  }

  if (version >= 0x161) {
    chips.gameBoyDmg = getParamsCommon(d, 0x80);
    chips.nesApu = getParamsNesApu(d);
    chips.multiPcm = getParamsCommon(d, 0x88);
    chips.upd7759 = getParamsCommon(d, 0x8c);
    chips.okim6258 = getParamsCommonWithFlags(d, 0x90, 0x94);
    chips.c140 = getParamsC140(d);
    chips.okim6295 = getParamsCommon(d, 0x98);
    chips.k051649 = getParamsCommon(d, 0x9c);
    chips.k054539 = getParamsCommonWithFlags(d, 0xa0, 0x95);
    chips.huc6280 = getParamsCommon(d, 0xa4);
    chips.k053260 = getParamsCommon(d, 0xac);
    chips.pokey = getParamsCommon(d, 0xb0);
    chips.qsound = getParamsCommon(d, 0xb4);
  }

  if (version >= 0x170) {
    const v = d.getUint32(0xbc, true);
    props.offsets.extraHeader = v ? 0xbc + v : 0;
  }

  if (version >= 0x171) {
    chips.scsp = getParamsCommon(d, 0xb8);
    chips.wonderSwan = getParamsCommon(d, 0xc0);
    chips.vsu = getParamsCommon(d, 0xc4);
    chips.saa1099 = getParamsCommon(d, 0xc8);
    chips.es5505 = getParamsEs5505(d);
    chips.es5503 = getParamsEs5503(d);
    chips.x1_010 = getParamsCommon(d, 0xd8);
    chips.c352 = getParamsC352(d);
    chips.ga20 = getParamsCommon(d, 0xe0);
  }

  return props;
}

export function build(header: VGMHeader): ArrayBuffer {
  const buf = new ArrayBuffer(header.offsets.data);
  const view = new DataView(buf);

  const chips = header.chips;

  view.setUint32(0x00, 0x206d6756, true); // "Vgm "
  view.setUint32(0x04, header.offsets.eof - 0x04, true);
  view.setUint32(0x08, header.version, true);
  view.setUint32(0x0c, chips.sn76489 ? chips.sn76489.clock : 0, true);
  view.setUint32(0x10, chips.ym2413 ? chips.ym2413.clock : 0, true);
  view.setUint32(0x14, header.offsets.gd3, true);
  view.setUint32(0x18, header.samples.total, true);
  view.setUint32(
    0x1c,
    0x1c <= header.offsets.loop ? header.offsets.loop - 0x1c : 0,
    true
  );
  view.setUint32(0x20, header.samples.loop, true);

  if (0x101 <= header.version) {
    view.setUint32(0x24, header.rate, true);
  }

  if (0x110 <= header.version) {
    view.setUint16(0x28, chips.sn76489 ? chips.sn76489.feedback : 0, true);
    view.setUint8(0x2a, chips.sn76489 ? chips.sn76489.shiftRegisterWidth : 0);
    view.setUint32(0x2c, chips.ym2612 ? chips.ym2612.clock : 0, true);
    view.setUint32(0x30, chips.ym2151 ? chips.ym2151.clock : 0, true);
  }

  if (0x150 <= header.version) {
    view.setUint32(0x34, header.offsets.data - 0x34, true);
  }

  if (0x151 <= header.version) {
    view.setUint8(0x2b, chips.sn76489 ? chips.sn76489.flags : 0);
    view.setUint32(0x38, chips.segaPcm ? chips.segaPcm.clock : 0, true);
    view.setUint32(
      0x3c,
      chips.segaPcm ? chips.segaPcm.interfaceRegister : 0,
      true
    );
    view.setUint32(0x40, chips.rf5c68 ? chips.rf5c68.clock : 0, true);
    view.setUint32(0x44, chips.ym2203 ? chips.ym2203.clock : 0, true);
    view.setUint32(0x48, chips.ym2608 ? chips.ym2608.clock : 0, true);
    view.setUint32(
      0x4c,
      chips.ym2610
        ? chips.ym2610.clock | (chips.ym2610.chipType.value << 31)
        : 0,
      true
    );
    view.setUint32(0x50, chips.ym3812 ? chips.ym3812.clock : 0, true);
    view.setUint32(0x54, chips.ym3526 ? chips.ym3526.clock : 0, true);
    view.setUint32(0x58, chips.y8950 ? chips.y8950.clock : 0, true);
    view.setUint32(0x5c, chips.ymf262 ? chips.ymf262.clock : 0, true);
    view.setUint32(0x60, chips.ymf278b ? chips.ymf278b.clock : 0, true);
    view.setUint32(0x64, chips.ymf271 ? chips.ymf271.clock : 0, true);
    view.setUint32(0x68, chips.ymz280b ? chips.ymz280b.clock : 0, true);
    view.setUint32(0x6c, chips.rf5c164 ? chips.rf5c164.clock : 0, true);
    view.setUint32(0x70, chips.pwm ? chips.pwm.clock : 0, true);
    view.setUint32(0x74, chips.ay8910 ? chips.ay8910.clock : 0, true);
    view.setUint8(0x78, chips.ay8910 ? chips.ay8910.chipType.value : 0);
    view.setUint8(0x79, chips.ay8910 ? chips.ay8910.flags : 0);
    view.setUint8(0x7a, chips.ym2203 ? chips.ym2203.ssgFlags : 0);
    view.setUint8(0x7b, chips.ym2608 ? chips.ym2608.ssgFlags : 0);
    view.setUint8(0x7f, header.loopModifier);
  }

  if (0x160 <= header.version) {
    view.setUint8(0x7c, header.volumeModifier);
    view.setUint8(0x7d, 0);
    view.setUint8(0x7e, header.loopBase);
  }

  if (0x161 <= header.version) {
    view.setUint32(0x80, chips.gameBoyDmg ? chips.gameBoyDmg.clock : 0, true);
    view.setUint32(
      0x84,
      chips.nesApu ? chips.nesApu.clock | (chips.nesApu.fds ? 1 << 31 : 0) : 0,
      true
    );
    view.setUint32(0x88, chips.multiPcm ? chips.multiPcm.clock : 0, true);
    view.setUint32(0x8c, chips.upd7759 ? chips.upd7759.clock : 0, true);
    view.setUint32(0x90, chips.okim6258 ? chips.okim6258.clock : 0, true);
    view.setUint8(0x94, chips.okim6258 ? chips.okim6258.flags : 0);
    view.setUint8(0x95, chips.k054539 ? chips.k054539.flags : 0);
    view.setUint8(0x96, chips.c140 ? chips.c140.chipType.value : 0);
    view.setUint8(0x97, 0);
    view.setUint32(0x98, chips.okim6295 ? chips.okim6295.clock : 0, true);
    view.setUint32(0x9c, chips.k051649 ? chips.k051649.clock : 0, true);
    view.setUint32(0xa0, chips.k054539 ? chips.k054539.clock : 0, true);
    view.setUint32(0xa4, chips.huc6280 ? chips.huc6280.clock : 0, true);
    view.setUint32(0xa8, chips.c140 ? chips.c140.clock : 0, true);
    view.setUint32(0xac, chips.k053260 ? chips.k053260.clock : 0, true);
    view.setUint32(0xb0, chips.pokey ? chips.pokey.clock : 0, true);
    view.setUint32(0xb4, chips.qsound ? chips.qsound.clock : 0, true);
  }

  if (0x170 <= header.version) {
    view.setUint32(0xbc, header.offsets.extraHeader, true);
  }

  if (0x171 <= header.version) {
    view.setUint32(0xb8, chips.scsp ? chips.scsp.clock : 0, true);
    view.setUint32(0xc0, chips.wonderSwan ? chips.wonderSwan.clock : 0, true);
    view.setUint32(0xc4, chips.vsu ? chips.vsu.clock : 0, true);
    view.setUint32(0xc8, chips.saa1099 ? chips.saa1099.clock : 0, true);
    view.setUint32(0xcc, chips.es5503 ? chips.es5503.clock : 0, true);
    view.setUint32(
      0xd0,
      chips.es5505
        ? chips.es5505.clock | (chips.es5505.chipType.value << 31)
        : 0,
      true
    );
    view.setUint8(0xd4, chips.es5503 ? chips.es5503.numberOfChannels : 0);
    view.setUint8(0xd5, chips.es5505 ? chips.es5505.numberOfChannels : 0);
    view.setUint8(0xd6, chips.c352 ? chips.c352.clockDivider : 0);
    view.setUint32(0xd8, chips.x1_010 ? chips.x1_010.clock : 0, true);
    view.setUint32(0xdc, chips.c352 ? chips.c352.clock : 0, true);
    view.setUint32(0xe0, chips.ga20 ? chips.ga20.clock : 0, true);
  }

  return buf;
}

export function clone(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

export default VGMHeader;
