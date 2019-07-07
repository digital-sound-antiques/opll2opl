export declare class InputBuffer {
    private _view;
    private _rp;
    constructor(buffer: ArrayBuffer);
    readonly eod: boolean;
    readOffset: number;
    readonly buffer: ArrayBuffer;
    readonly byteOffset: number;
    peekByte(): number;
    readByte(): number;
    peekWord(): number;
    readWord(): number;
    peekDword(): number;
    readDword(): number;
}
export declare class OutputBuffer {
    private _view;
    private _wp;
    constructor(buffer: ArrayBuffer);
    writeOffset: number;
    readonly buffer: ArrayBuffer;
    readonly byteOffset: number;
    private _stretchBuffer;
    writeByte(value: number): void;
    writeWord(value: number): void;
    writeDword(value: number): void;
}
