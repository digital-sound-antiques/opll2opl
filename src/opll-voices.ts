export type OPLLOperatorParam = {
  am: number;
  pm: number;
  eg: number;
  ml: number;
  kr: number;
  kl: number;
  tl: number;
  ar: number;
  dr: number;
  sl: number;
  rr: number;
  wf: number;
  fb: number;
};

export type OPLLVoice = {
  mod: OPLLOperatorParam;
  car: OPLLOperatorParam;
};

export const OPLL_RAW_VOICES: Uint8Array[] = [
  new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
  new Uint8Array([0x61, 0x61, 0x1e, 0x17, 0xf0, 0x7f, 0x00, 0x17]),
  new Uint8Array([0x13, 0x41, 0x17, 0x0e, 0xff, 0xff, 0x23, 0x13]),
  new Uint8Array([0x23, 0x01, 0x9a, 0x04, 0xa3, 0xf4, 0xf0, 0x23]),
  new Uint8Array([0x11, 0x61, 0x0e, 0x07, 0xfa, 0x64, 0x70, 0x17]),
  new Uint8Array([0x32, 0x21, 0x1e, 0x06, 0xe1, 0x76, 0x01, 0x28]),
  new Uint8Array([0x21, 0x22, 0x16, 0x05, 0xf0, 0x71, 0x00, 0x18]),
  new Uint8Array([0x21, 0x61, 0x1d, 0x07, 0x82, 0x81, 0x11, 0x07]),
  new Uint8Array([0x23, 0x21, 0x2d, 0x16, 0x90, 0x90, 0x00, 0x07]),
  new Uint8Array([0x21, 0x21, 0x1b, 0x06, 0x64, 0x65, 0x10, 0x17]),
  new Uint8Array([0x21, 0x21, 0x0b, 0x1a, 0x85, 0xa0, 0x70, 0x07]),
  new Uint8Array([0x23, 0x01, 0x83, 0x10, 0xff, 0xb4, 0x10, 0xf4]),
  new Uint8Array([0x97, 0xc1, 0x20, 0x07, 0xff, 0xf4, 0x22, 0x22]),
  new Uint8Array([0x61, 0x00, 0x0c, 0x05, 0xd2, 0xf6, 0x40, 0x43]),
  new Uint8Array([0x01, 0x01, 0x56, 0x03, 0xf4, 0xf0, 0x03, 0x02]),
  new Uint8Array([0x21, 0x41, 0x89, 0x03, 0xf1, 0xf4, 0xf0, 0x23]),
  new Uint8Array([0x01, 0x01, 0x18, 0x0f, 0xdf, 0xf8, 0x6a, 0x6d]), // B.D
  new Uint8Array([0x01, 0x01, 0x00, 0x00, 0xc8, 0xd8, 0xa7, 0x68]), // HH & TOM
  new Uint8Array([0x05, 0x01, 0x00, 0x00, 0xf8, 0xaa, 0x59, 0x55]), // SD & CYM
];

export function rawVoiceToVoice(d: Uint8Array): OPLLVoice {
  return {
    mod: {
      am: (d[0] >> 7) & 1,
      pm: (d[0] >> 6) & 1,
      eg: (d[0] >> 5) & 1,
      kr: (d[0] >> 4) & 1,
      ml: d[0] & 0xf,
      kl: (d[2] >> 6) & 3,
      tl: d[2] & 0x3f,
      ar: (d[4] >> 4) & 0xf,
      dr: d[4] & 0xf,
      sl: (d[6] >> 4) & 0xf,
      rr: d[6] & 0xf,
      wf: (d[3] >> 3) & 1,
      fb: d[3] & 7,
    },
    car: {
      am: (d[1] >> 7) & 1,
      pm: (d[1] >> 6) & 1,
      eg: (d[1] >> 5) & 1,
      kr: (d[1] >> 4) & 1,
      ml: d[1] & 0xf,
      kl: (d[3] >> 6) & 3,
      tl: 0,
      ar: (d[5] >> 4) & 0xf,
      dr: d[5] & 0xf,
      sl: (d[7] >> 4) & 0xf,
      rr: d[7] & 0xf,
      wf: (d[3] >> 4) & 1,
      fb: 0,
    },
  };
}

const OPLL_VOICES: OPLLVoice[] = OPLL_RAW_VOICES.map(rawVoiceToVoice);
export default OPLL_VOICES;
