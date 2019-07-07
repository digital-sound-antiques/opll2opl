export class InputBuffer {
  private _view: DataView;
  private _rp: number = 0;

  constructor(buffer: ArrayBuffer) {
    this._view = new DataView(buffer);
  }

  get eod(): boolean {
    return this._view.byteLength <= this._rp;
  }

  get readOffset() {
    return this._rp;
  }

  set readOffset(offset: number) {
    this._rp = offset;
  }

  get buffer() {
    return this._view.buffer;
  }

  get byteOffset() {
    return this._view.byteLength;
  }

  peekByte() {
    return this._view.getUint8(this._rp);
  }

  readByte() {
    return this._view.getUint8(this._rp++);
  }

  peekWord() {
    return this._view.getUint16(this._rp, true);
  }

  readWord() {
    const ret = this._view.getUint16(this._rp, true);
    this._rp += 2;
    return ret;
  }

  peekDword() {
    return this._view.getUint32(this._rp, true);
  }

  readDword() {
    const ret = this._view!.getUint32(this._rp, true);
    this._rp += 4;
    return ret;
  }
}

export class OutputBuffer {
  private _view: DataView;
  private _wp: number = 0;

  constructor(buffer: ArrayBuffer) {
    this._view = new DataView(buffer);
  }

  get writeOffset() {
    return this._wp;
  }

  set writeOffset(offset: number) {
    this._wp = offset;
  }

  get buffer() {
    return this._view.buffer;
  }

  get byteOffset() {
    return this._view.byteLength;
  }

  private _stretchBuffer() {
    const newBuf = new ArrayBuffer(this._view.byteLength * 2);
    const view = new Uint8Array(newBuf);
    view.set(new Uint8Array(this._view.buffer));
    this._view = new DataView(newBuf);
  }

  writeByte(value: number) {
    if (this._view.byteLength < this._wp + 1) {
      this._stretchBuffer();
    }
    this._view.setUint8(this._wp, value);
    this._wp += 1;
  }

  writeWord(value: number) {
    if (this._view.byteLength < this._wp + 2) {
      this._stretchBuffer();
    }
    this._view.setUint16(this._wp, value, true);
    this._wp += 2;
  }

  writeDword(value: number) {
    if (this._view.byteLength < this._wp + 4) {
      this._stretchBuffer();
    }
    this._view.setUint32(this._wp, value, true);
    this._wp += 4;
  }
}
