import VGM from "./vgm";
export default class Converter {
    private _vgm;
    private _data;
    private _output;
    private _orgLoopOffset;
    private _newLoopOffset;
    private _converter;
    private _destChip;
    constructor(vgm: VGM, dest: string);
    private _processGameGearPsg;
    private _processSn76489;
    private _processYm2413;
    private _processCommon;
    private _processCommon2;
    private _processSeekPcmDataBank;
    private _processDataBlock;
    private _detectNewLoopOffset;
    private _buildVGM;
    convert(): ArrayBuffer;
}
