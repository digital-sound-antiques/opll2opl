import VGM from "./vgm";

import { InputBuffer, OutputBuffer } from "./buffer";
import PSG2OPL from "./psg2opl";
import OPLL2OPL from "./opll2opl";
import OPLType from "./opl-type";

function toOPLType(type: string): OPLType | null {
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

export default class Converter {
  private _vgm: VGM;
  private _data: InputBuffer;
  private _output: OutputBuffer;
  private _orgLoopOffset: number; // original loop offset from top of the data.
  private _newLoopOffset: number; // new loop offset from top of the data.
  private _psg2opl?: PSG2OPL;
  private _opll2opl?: OPLL2OPL;
  private _opllTo: string;
  private _psgTo: string;
  private _oplClock: number;

  constructor(vgm: VGM, opllTo: string, psgTo: string) {
    this._vgm = vgm;
    this._orgLoopOffset =
      this._vgm.header.offsets.loop - this._vgm.header.offsets.data;
    this._newLoopOffset = 0;
    this._data = new InputBuffer(vgm.data.buffer);
    this._output = new OutputBuffer(new ArrayBuffer(8));

    this._opllTo = opllTo;
    this._psgTo = psgTo;

    this._oplClock = vgm.header.chips.ym2413
      ? vgm.header.chips.ym2413.clock
      : 3579545;

    const psgToType = toOPLType(this._psgTo);
    if (psgToType) {
      this._psg2opl = new PSG2OPL(
        psgToType,
        vgm.header.chips.ay8910 ? vgm.header.chips.ay8910.clock : 3579545 / 2,
        this._oplClock
      );
    }

    const opllToType = toOPLType(this._opllTo);
    if (opllToType) {
      this._opll2opl = new OPLL2OPL(
        opllToType,
        vgm.header.chips.ym2413 ? vgm.header.chips.ym2413.clock : 3579545,
        this._oplClock
      );
    }
  }

  private _processGameGearPsg() {
    const d = this._data.readByte();
    this._output.writeByte(d);
  }

  private _processSn76489() {
    const d = this._data.readByte();
    this._output.writeByte(d);
  }

  private _processYm2413() {
    if (!this._opll2opl) return;

    this._initializeOPL3();

    const a = this._data.readByte();
    const d = this._data.readByte();

    const data = this._opll2opl.interpret(a, d);

    for (let i = 0; i < data.length; i++) {
      const { a, d } = data[i];
      this._output.writeByte(this._opll2opl.command);
      this._output.writeByte(a);
      this._output.writeByte(d);
    }
  }

  _opl3initialized = false;

  private _initializeOPL3() {
    if (this._opllTo === "ymf262") {
      if (!this._opl3initialized) {
        this._output.writeByte(0x5e);
        this._output.writeByte(0x05);
        this._output.writeByte(0x01);
        this._opl3initialized = true;
      }
    }
  }

  private _processAY8910() {
    if (!this._psg2opl) return;
    this._initializeOPL3();

    const a = this._data.readByte();
    const d = this._data.readByte();

    const data = this._psg2opl.interpret(a, d);

    for (let i = 0; i < data.length; i++) {
      const { a, d } = data[i];
      this._output.writeByte(this._psg2opl.command);
      this._output.writeByte(a);
      this._output.writeByte(d);
    }
  }

  private _processCommon() {
    const a = this._data.readByte();
    const d = this._data.readByte();
    this._output.writeByte(a);
    this._output.writeByte(d);
  }

  private _processCommon2() {
    const p = this._data.readByte();
    const a = this._data.readByte();
    const d = this._data.readByte();
    this._output.writeByte(p);
    this._output.writeByte(a);
    this._output.writeByte(d);
  }

  private _processSeekPcmDataBank() {
    this._output.writeDword(this._data.readDword());
  }

  private _processDataBlock() {
    if (this._data.readByte() != 0x66) {
      throw new Error();
    }
    this._output.writeByte(0x66);
    const type = this._data.readByte();
    const size = this._data.readDword();
    this._output.writeByte(type);
    this._output.writeDword(size);
    for (let i = 0; i < size; i++) {
      this._output.writeByte(this._data.readByte());
    }
  }

  private _detectNewLoopOffset() {
    if (0 <= this._orgLoopOffset && this._newLoopOffset === 0) {
      if (this._orgLoopOffset <= this._data.readOffset) {
        this._newLoopOffset = this._output.writeOffset;
      }
    }
  }

  private _buildVGM() {
    const dataLength = this._output.writeOffset;
    const vgm = new VGM(this._vgm.header, this._output.buffer);

    vgm.header.version = 0x171;
    vgm.header.offsets.data = 0x100;
    if (this._newLoopOffset) {
      vgm.header.offsets.loop = vgm.header.offsets.data + this._newLoopOffset;
    } else {
      vgm.header.offsets.loop = 0;
    }
    vgm.header.offsets.eof = vgm.header.offsets.data + dataLength;

    if (this._opllTo === "none") {
      vgm.header.chips.ym2413 = undefined;
    } else if (this._opll2opl) {
      vgm.header.chips[this._opll2opl.type] = {
        clock: this._opll2opl.clock,
      };
      vgm.header.chips.ym2413 = undefined;
    }

    if (this._psgTo === "none") {
      vgm.header.chips.ay8910 = undefined;
    } else if (this._psg2opl) {
      vgm.header.chips[this._psg2opl.type] = {
        clock: this._psg2opl.clock,
      };
      vgm.header.chips.ay8910 = undefined;
    }

    return vgm.build();
  }

  convert() {
    while (!this._data.eod) {
      const d = this._data.readByte();
      if (d == 0x67) {
        this._output.writeByte(d);
        this._processDataBlock();
      } else if (d == 0x61) {
        this._output.writeByte(d);
        this._output.writeWord(this._data.readWord());
      } else if (d == 0x62) {
        this._output.writeByte(d);
      } else if (d == 0x63) {
        this._output.writeByte(d);
      } else if (d == 0x4f) {
        this._output.writeByte(d);
        this._processGameGearPsg();
      } else if (d == 0x50) {
        this._output.writeByte(d);
        this._processSn76489();
      } else if (d == 0x51) {
        if (this._opll2opl) {
          this._processYm2413();
        } else {
          this._output.writeByte(d);
          this._processCommon();
        }
      } else if (0x52 <= d && d <= 0x5f) {
        this._output.writeByte(d);
        this._processCommon();
      } else if (d == 0xa0) {
        if (this._psg2opl) {
          this._processAY8910();
        } else {
          this._output.writeByte(d);
          this._processCommon();
        }
      } else if (0xb0 <= d && d <= 0xbf) {
        this._output.writeByte(d);
        this._processCommon();
      } else if (0xd0 <= d && d <= 0xd6) {
        this._output.writeByte(d);
        this._processCommon2();
      } else if (d == 0xe0) {
        this._output.writeByte(d);
        this._processSeekPcmDataBank();
      } else if (0x70 <= d && d <= 0x7f) {
        this._output.writeByte(d);
      } else if (0x80 <= d && d <= 0x8f) {
        this._output.writeByte(d);
      } else if (d == 0x66) {
        this._output.writeByte(d);
        break;
      } else {
        throw new Error("Unsupported command: 0x" + d.toString(16));
      }
      this._detectNewLoopOffset();
    }

    return this._buildVGM();
  }
}
