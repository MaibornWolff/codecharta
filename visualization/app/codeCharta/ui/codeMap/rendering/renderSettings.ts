import {renderingUtil} from "./renderingUtil";
import {node} from "./node";

export interface colorRange {
    from : number;
    to : number;
    flipped : boolean;
}

export function getFloorGradient(nodes: node[]): number[] {
    return renderingUtil.gradient("#222222", "#aaaaaa", renderingUtil.getMaxNodeDepth(nodes));
}

export function getHighlightGradient(nodes: node[]): number[] {
    return renderingUtil.gradient("#ffe8f3", "#FF1D8E", renderingUtil.getMaxNodeDepth(nodes));
}

export function getDistinctColors(): number[] {
    const arr = require("distinct-colors")({count: 20});
    const res = [];
    for(let i = 0; i< arr.length;i++) {
        res.push(renderingUtil.rgbToHexNumber(arr[i]["_rgb"][0], arr[i]["_rgb"][1], arr[i]["_rgb"][2]));
    }
    return res;
}

export const highlightColors = [
    "#FF1D8E",
    "#1d8eff",
    "#1DFFFF",
    "#8eff1d",
    "#8e1dff",
    "#ff8e1d",
    "#FFFF1D",
];

export enum MapColors {
    positive = 0x69AE40,
    neutral = 0xddcc00,
    negative = 0x820E0E,
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
}