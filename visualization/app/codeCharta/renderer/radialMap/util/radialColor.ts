import convert from "color-convert"
import { ColorMode, ColorRange, MapColors, RadialFolderStyle, RadialFolderValue } from "../../../model/codeCharta.model"
import { getColorByMetricValue } from "../../../util/color/gradientCalculator"
import { MetricMinMax } from "../../../util/metric/metricRange"
import { NEUTRAL_FOLDER_COLOR, tintColor } from "../../../util/radialFolderValues"
import { RadialNode } from "./radialTree"

export interface RadialFolderColoring {
    values: ReadonlyMap<string, number>
    value: RadialFolderValue
    style: RadialFolderStyle
    tint: number
}

export interface RadialColoring {
    /** The unary metric counts nodes rather than measuring them, so every node shows as good. */
    isUnaryMetric: boolean
    colorRange: ColorRange
    colorMode: ColorMode
    mapColors: MapColors
    colorMetricRange: MetricMinMax
    folders: RadialFolderColoring
}

const DARK_TEXT = "#1f2937"
const LIGHT_TEXT = "#ffffff"
const LUMINANCE_THRESHOLD_FOR_DARK_TEXT = 0.5
const RED_LUMA_WEIGHT = 0.299
const GREEN_LUMA_WEIGHT = 0.587
const BLUE_LUMA_WEIGHT = 0.114
const MAX_CHANNEL_VALUE = 255

type ColoredNode = Pick<RadialNode, "path" | "isFile" | "colorValue" | "isFlat">

export function nodeColor({ path, isFile, colorValue, isFlat }: ColoredNode, coloring: RadialColoring): string {
    const { mapColors } = coloring
    if (colorValue === undefined) {
        return mapColors.base
    }
    if (isFlat) {
        return mapColors.flat
    }
    return isFile ? fileColor(colorValue, coloring) : folderColor(path, coloring)
}

function fileColor(colorValue: number, coloring: RadialColoring): string {
    if (coloring.isUnaryMetric) {
        return coloring.mapColors.positive
    }
    return getColorByMetricValue(coloring.mapColors, coloring.colorRange, coloring.colorMode, coloring.colorMetricRange, colorValue)
}

function folderColor(path: string, coloring: RadialColoring): string {
    const { folders, mapColors } = coloring
    const folderValue = folders.values.get(path)
    if (folderValue === undefined) {
        return mapColors.base
    }
    if (folders.style === RadialFolderStyle.Neutral) {
        return NEUTRAL_FOLDER_COLOR
    }
    const valueColor = coloring.isUnaryMetric
        ? mapColors.positive
        : getColorByMetricValue(mapColors, coloring.colorRange, coloring.colorMode, coloring.colorMetricRange, folderValue)
    return tintColor(valueColor, folders.tint)
}

export function readableTextColor(backgroundHex: string): string {
    const [red, green, blue] = convert.hex.rgb(backgroundHex)
    const relativeLuminance = (RED_LUMA_WEIGHT * red + GREEN_LUMA_WEIGHT * green + BLUE_LUMA_WEIGHT * blue) / MAX_CHANNEL_VALUE
    return relativeLuminance > LUMINANCE_THRESHOLD_FOR_DARK_TEXT ? DARK_TEXT : LIGHT_TEXT
}
