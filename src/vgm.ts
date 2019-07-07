import VGMHeader, { parse, build, clone } from "./vgm-header";

export default class VGM {
  private _header: VGMHeader;
  private _data: DataView;

  static parse(vgm: ArrayBuffer) {
    const header = parse(vgm);
    return new VGM(header, vgm.slice(header.offsets.data));
  }

  constructor(header: VGMHeader, buffer: ArrayBuffer) {
    this._header = clone(header);
    this._data = new DataView(buffer);
  }

  get header() {
    return this._header;
  }

  get data() {
    return this._data;
  }

  build(): ArrayBuffer {
    const hbuf = new Uint8Array(build(this._header));
    const dbuf = new Uint8Array(
      this._data.buffer,
      this._data.byteOffset,
      this._data.byteLength
    );

    const res = new ArrayBuffer(hbuf.byteLength + dbuf.byteLength);
    const hv = new Uint8Array(res, 0, hbuf.byteLength);
    const dv = new Uint8Array(res, hbuf.byteLength, dbuf.byteLength);
    hv.set(hbuf);
    dv.set(dbuf);

    return res;
  }

  clone(): VGM {
    return new VGM(this._header, this._data.buffer);
  }
}
