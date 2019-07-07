declare type ChipType = {
    value: number;
    name: string;
};
export declare type Chips = {
    sn76489?: {
        clock: number;
        feedback: number;
        shiftRegisterWidth: number;
        flags: number;
    };
    ym2413?: {
        clock: number;
    };
    ym2612?: {
        clock: number;
        chipType: ChipType;
    };
    ym2151?: {
        clock: number;
        chipType: ChipType;
    };
    segaPcm?: {
        clock: number;
        interfaceRegister: number;
    };
    rf5c68?: {
        clock: number;
    };
    ym2203?: {
        clock: number;
        ssgFlags: number;
    };
    ym2608?: {
        clock: number;
        ssgFlags: number;
    };
    ym2610?: {
        clock: number;
        chipType: ChipType;
    };
    ym3812?: {
        clock: number;
    };
    ym3526?: {
        clock: number;
    };
    y8950?: {
        clock: number;
    };
    ymf262?: {
        clock: number;
    };
    ymf278b?: {
        clock: number;
    };
    ymf271?: {
        clock: number;
    };
    ymz280b?: {
        clock: number;
    };
    rf5c164?: {
        clock: number;
    };
    pwm?: {
        clock: number;
    };
    ay8910?: {
        clock: number;
        chipType: ChipType;
        flags: number;
    };
    gameBoyDmg?: {
        clock: number;
    };
    nesApu?: {
        clock: number;
        fds: boolean;
    };
    multiPcm?: {
        clock: number;
    };
    upd7759?: {
        clock: number;
    };
    okim6258?: {
        clock: number;
        flags: number;
    };
    okim6295?: {
        clock: number;
    };
    k051649?: {
        clock: number;
    };
    k054539?: {
        clock: number;
        flags: number;
    };
    huc6280?: {
        clock: number;
    };
    c140?: {
        clock: number;
        chipType: ChipType;
    };
    k053260?: {
        clock: number;
    };
    pokey?: {
        clock: number;
    };
    qsound?: {
        clock: number;
    };
    scsp?: {
        clock: number;
    };
    wonderSwan?: {
        clock: number;
    };
    vsu?: {
        clock: number;
    };
    saa1099?: {
        clock: number;
    };
    es5503?: {
        clock: number;
        numberOfChannels: number;
    };
    es5505?: {
        clock: number;
        chipType: ChipType;
        numberOfChannels: number;
    };
    x1_010?: {
        clock: number;
    };
    c352?: {
        clock: number;
        clockDivider: number;
    };
    ga20?: {
        clock: number;
    };
};
export declare type VGMHeader = {
    version: number;
    offsets: {
        eof: number;
        gd3: number;
        loop: number;
        data: number;
        extraHeader: number;
    };
    samples: {
        total: number;
        loop: number;
    };
    rate: number;
    chips: Chips;
    loopModifier: number;
    loopBase: number;
    volumeModifier: number;
};
export declare function parse(data: ArrayBuffer): VGMHeader;
export declare function build(header: VGMHeader): ArrayBuffer;
export declare function clone(obj: any): any;
export default VGMHeader;
