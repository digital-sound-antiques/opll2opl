import VGM from "./vgm";

import { InputBuffer, OutputBuffer } from "./buffer";
import OPLLToOPL from "./opll2opl";

export default class Converter {
  private _vgm: VGM;
  private _data: InputBuffer;
  private _output: OutputBuffer;
  private _orgLoopOffset: number; // original loop offset from top of the data.
  private _newLoopOffset: number; // new loop offset from top of the data.
  private _converter: OPLLToOPL;
  private _destChip: "ym3812" | "ym3526" | "y8950";

  constructor(vgm: VGM, dest: string) {
    this._vgm = vgm;
    this._orgLoopOffset =
      this._vgm.header.offsets.loop - this._vgm.header.offsets.data;
    this._newLoopOffset = 0;
    this._data = new InputBuffer(vgm.data.buffer);
    this._output = new OutputBuffer(new ArrayBuffer(8));
    const chip = ((chip: string) => {
      switch (chip) {
        case "ym3812":
        case "ym3526":
        case "y8950":
          return chip;
        default:
          return "ym3812";
      }
    })(dest);

    this._converter = new OPLLToOPL(chip);
    this._destChip = chip;
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
    const a = this._data.readByte();
    const d = this._data.readByte();

    const data = this._converter.interpretOpll(a, d);

    for (let i = 0; i < data.length; i++) {
      const { a, d } = data[i];
      this._output.writeByte(this._converter.command);
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
    if (this._orgLoopOffset !== 0 && this._newLoopOffset === 0) {
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
    vgm.header.offsets.loop = vgm.header.offsets.data + this._newLoopOffset;
    vgm.header.offsets.eof = vgm.header.offsets.data + dataLength;
    vgm.header.chips[this._destChip] = {
      clock: vgm.header.chips.ym2413!.clock,
    };
    vgm.header.chips.ym2413 = undefined;
    return vgm.build();
  }

  convert() {
    if (!this._vgm.header.chips.ym2413) {
      throw new Error("There is no YM2413 data sequences.");
    }

    while (!this._data.eod) {
      this._detectNewLoopOffset();
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
        this._processYm2413();
      } else if (0x52 <= d && d <= 0x5f) {
        this._output.writeByte(d);
        this._processCommon();
      } else if (d == 0xa0) {
        this._output.writeByte(d);
        this._processCommon();
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
    }

    return this._buildVGM();
  }
}
