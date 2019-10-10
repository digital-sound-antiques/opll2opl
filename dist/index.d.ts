import VGM from "./vgm";
export default class Converter {
    private _vgm;
    private _data;
    private _output;
    private _orgLoopOffset;
    private _newLoopOffset;
    private _psg2opl?;
    private _opll2opl?;
    private _opllTo;
    private _psgTo;
    private _oplClock;
    constructor(vgm: VGM, opllTo: string, psgTo: string);
    private _processGameGearPsg;
    private _processSn76489;
    private _processYm2413;
    _opl3initialized: boolean;
    private _initializeOPL3;
    private _processAY8910;
    private _processCommon;
    private _processCommon2;
    private _processSeekPcmDataBank;
    private _processDataBlock;
    private _detectNewLoopOffset;
    private _buildVGM;
    convert(): ArrayBuffer;
}
