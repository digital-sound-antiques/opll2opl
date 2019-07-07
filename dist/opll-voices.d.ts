export declare type OPLLOperatorParam = {
    am: number;
    pm: number;
    eg: number;
    ml: number;
    kr: number;
    kl: number;
    tl: number;
    ar: number;
    dr: number;
    sl: number;
    rr: number;
    wf: number;
    fb: number;
};
export declare type OPLLVoice = {
    mod: OPLLOperatorParam;
    car: OPLLOperatorParam;
};
export declare const OPLL_RAW_VOICES: Uint8Array[];
export declare function rawVoiceToVoice(d: Uint8Array): OPLLVoice;
declare const OPLL_VOICES: OPLLVoice[];
export default OPLL_VOICES;
