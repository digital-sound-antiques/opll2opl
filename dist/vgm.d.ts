import VGMHeader from "./vgm-header";
export default class VGM {
    private _header;
    private _data;
    static parse(vgm: ArrayBuffer): VGM;
    constructor(header: VGMHeader, buffer: ArrayBuffer);
    readonly header: VGMHeader;
    readonly data: DataView;
    build(): ArrayBuffer;
    clone(): VGM;
}
