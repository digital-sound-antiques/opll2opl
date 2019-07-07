import { OPLLVoice } from "./opll-voices";
export default class OPLLToOPL {
    _regs: Uint8Array;
    _oplRegs: Uint8Array;
    _type: string;
    _command: number;
    constructor(type: "ym3526" | "y8950" | "ym3812");
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
    _interpretOpll(a: number, d: number): {
        a: number;
        d: number;
    }[];
    _initialized: boolean;
    interpretOpll(a: number, d: number): {
        a: number;
        d: number;
    }[];
}
