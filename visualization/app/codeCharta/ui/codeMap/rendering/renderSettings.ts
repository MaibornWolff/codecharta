import {renderingUtil} from "./renderingUtil";
import {node} from "./node";

export interface colorRange {
    from : number;
    to : number;
    flipped : boolean;
}

export function getFloorGradient(nodes: node[]): number[] {
    return renderingUtil.gradient("#333333", "#dddddd", renderingUtil.getMaxNodeDepth(nodes));
}

export const highlightColors = [
    0xFF1D8E,
    0x1d8eff,
    0x1DFFFF,
    0x8eff1d,
    0x8e1dff,
    0xFFFF1D,
];

export enum MapColors {
    positive = 0x69AE40,
    neutral = 0xddcc00,
    negative = 0x820E0E,
    selected = 0xEB8319,
    defaultC = 0x89ACB4,
    positiveDelta = 0x69FF40,
    negativeDelta = 0xff0E0E,
    base = 0x666666,
    flat = 0xAAAAAA,
    lightGrey = 0xDDDDDD,
}

export enum AngularColors {
    green = "#00BFA5",
}

export interface renderSettings {
    heightKey : string;
    colorKey : string;
    renderDeltas : boolean;
    hideFlatBuildings: boolean;
    colorRange : colorRange;
    mapSize : number;
    deltaColorFlipped: boolean;
    whiteColorBuildings: boolean;
}