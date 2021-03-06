import { OPLLVoice } from "./opll-voices";
import OPLType from "./opl-type";
export default class OPLL2OPL {
    _regs: Uint8Array;
    _oplRegs: Uint8Array;
    _type: OPLType;
    _opllClock: number;
    _oplClock: number;
    _command: number;
    constructor(type: OPLType, opllClock: number, oplClock: number);
    readonly type: OPLType;
    readonly clock: number;
    readonly command: number;
    _buildVoiceSetup(ch: number, v: OPLLVoice, modVolume: number | null, carVolume: number | null, al: number): {
        a: number;
        d: number;
    }[];
    _rflag: boolean;
    _buildInstAndVolume(ch: number): {
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
