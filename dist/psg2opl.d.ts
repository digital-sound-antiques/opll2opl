import OPLType from "./opl-type";
export default class PSGToOPL {
    _regs: Uint8Array;
    _oplRegs: Uint8Array;
    _type: OPLType;
    _psgClock: number;
    _oplClock: number;
    _command: number;
    constructor(type: OPLType, psgClock: number, oplClock: number);
    readonly type: OPLType;
    readonly clock: number;
    readonly command: number;
    _updateFreq(ch: number, freq: number): {
        a: number;
        d: number;
    }[];
    _updateVol(ch: number, vol: number): {
        a: number;
        d: number;
    }[];
    _updateTone(ch: number): {
        a: number;
        d: number;
    }[];
    _interpret(a: number, d: number): {
        a: number;
        d: number;
    }[];
    _initialized: boolean;
    interpret(a: number, d: number): {
        a: number;
        d: number;
    }[];
}
