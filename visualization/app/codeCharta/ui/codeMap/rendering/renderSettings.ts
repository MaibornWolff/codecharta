export interface ColorRange {
    from : number;
    to : number;
    flipped : boolean;
}

export const highlightColors = [
    "#FF1D8E",
    "#1D8EFF",
    "#1DFFFF",
    "#8EFF1D",
    "#8E1DFF",
    "#FFFF1D",
];

export enum MapColors {
    positive = "#69AE40",
    neutral = "#DDCC00",
    negative = "#820E0E",
    selected = "#EB8319",
    defaultC = "#89ACB4",
    positiveDelta = "#69FF40",
    negativeDelta = "#ff0E0E",
    base = "#666666",
    flat = "#AAAAAA",
    lightGrey = "#DDDDDD",
    angularGreen = "#00BFA5"
}

export interface RenderSettings {
    heightKey : string;
    colorKey : string;
    renderDeltas : boolean;
    hideFlatBuildings: boolean;
    colorRange : ColorRange;
    mapSize : number;
    deltaColorFlipped: boolean;
    whiteColorBuildings: boolean;
}