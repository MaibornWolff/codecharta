export interface colorRange {
    from : number;
    to : number;
    flipped : boolean;
}

export enum MapColors {
    positive = 0x69AE40,
    neutral = 0xddcc00,
    negative = 0x820E0E,
    odd = 0xdedede,
    even = 0xcdcdcd,
    fanout = 0x222222,
    selected = 0xEB8319,
    defaultC = 0x89ACB4,
    positiveDelta = 0x69ff40,
    negativeDelta = 0xff0E0E,
    base = 0x666666
}

export interface renderSettings {
    heightKey : string;
    colorKey : string;
    renderDeltas : boolean;
    colorRange : colorRange;
    mapSize : number;
    deltaColorFlipped: boolean;
    fanoutLevels: number[];
}