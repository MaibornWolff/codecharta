import convert from "color-convert"
import { ColorMode, ColorRange, MapColors, RadialFolderStyle, RadialFolderValue } from "../../../model/codeCharta.model"
import { getColorByMetricValue } from "../../../util/color/gradientCalculator"
import { MetricMinMax } from "../../../util/metric/metricRange"
import { NEUTRAL_FOLDER_COLOR, tintColor } from "../../../util/radialFolderValues"
import { WHITE } from "./radialChartStyle"
import { RadialNode } from "./radialTree"

export interface RadialFolderColoring {
    values: ReadonlyMap<string, number>
    value: RadialFolderValue
    style: RadialFolderStyle
    tint: number
}

export interface RadialHighlight {
    selectedPath: string | null
    /** While any node is lit, every other one is faded. */
    litPaths: ReadonlySet<string>
}

export interface RadialColoring {
    /** The unary metric counts nodes rather than measuring them, so every node shows as good. */
    isUnaryMetric: boolean
    colorRange: ColorRange
    colorMode: ColorMode
    mapColors: MapColors
    colorMetricRange: MetricMinMax
    folders: RadialFolderColoring
    highlight: RadialHighlight
}

const DARK_TEXT = "#1f2937"
const LUMINANCE_THRESHOLD_FOR_DARK_TEXT = 0.5
const RED_LUMA_WEIGHT = 0.299
const GREEN_LUMA_WEIGHT = 0.587
const BLUE_LUMA_WEIGHT = 0.114
const MAX_CHANNEL_VALUE = 255

type ColoredNode = Pick<RadialNode, "path" | "isFile" | "colorValue" | "isFlat">

export function nodeColor({ path, isFile, colorValue, isFlat }: ColoredNode, coloring: RadialColoring): string {
    const { mapColors } = coloring
    if (path === coloring.highlight.selectedPath) {
        return mapColors.selected
    }
    if (colorValue === undefined) {
        return mapColors.base
    }
    if (isFlat) {
        return mapColors.flat
    }
    return isFile ? colorForMetricValue(colorValue, coloring) : folderColor(path, coloring)
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
    return tintColor(colorForMetricValue(folderValue, coloring), folders.tint)
}

export function colorForMetricValue(value: number, coloring: RadialColoring): string {
    const { mapColors } = coloring
    if (coloring.isUnaryMetric) {
        return mapColors.positive
    }
    return getColorByMetricValue(mapColors, coloring.colorRange, coloring.colorMode, coloring.colorMetricRange, value)
}

export function readableTextColor(backgroundHex: string): string {
    const [red, green, blue] = convert.hex.rgb(backgroundHex)
    const relativeLuminance = (RED_LUMA_WEIGHT * red + GREEN_LUMA_WEIGHT * green + BLUE_LUMA_WEIGHT * blue) / MAX_CHANNEL_VALUE
    return relativeLuminance > LUMINANCE_THRESHOLD_FOR_DARK_TEXT ? DARK_TEXT : WHITE
}
