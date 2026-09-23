import convert from "color-convert"
import { ColorMode, ColorRange, MapColors } from "../../../model/codeCharta.model"
import { getColorByMetricValue } from "../../../util/color/gradientCalculator"
import { MetricMinMax } from "../../../util/metric/metricRange"
import { SunburstNode } from "./sunburstTree"

export interface SunburstColoring {
    /** The unary metric counts nodes rather than measuring them, so every node shows as good. */
    isUnaryMetric: boolean
    colorRange: ColorRange
    colorMode: ColorMode
    mapColors: MapColors
    colorMetricRange: MetricMinMax
}

const DARK_TEXT = "#1f2937"
const LIGHT_TEXT = "#ffffff"
const LUMINANCE_THRESHOLD_FOR_DARK_TEXT = 0.5
const RED_LUMA_WEIGHT = 0.299
const GREEN_LUMA_WEIGHT = 0.587
const BLUE_LUMA_WEIGHT = 0.114
const MAX_CHANNEL_VALUE = 255

export function nodeColor({ colorValue, isFlat }: Pick<SunburstNode, "colorValue" | "isFlat">, coloring: SunburstColoring): string {
    const { mapColors } = coloring
    if (colorValue === undefined) {
        return mapColors.base
    }
    if (isFlat) {
        return mapColors.flat
    }
    if (coloring.isUnaryMetric) {
        return mapColors.positive
    }
    return getColorByMetricValue(mapColors, coloring.colorRange, coloring.colorMode, coloring.colorMetricRange, colorValue)
}

export function readableTextColor(backgroundHex: string): string {
    const [red, green, blue] = convert.hex.rgb(backgroundHex)
    const relativeLuminance = (RED_LUMA_WEIGHT * red + GREEN_LUMA_WEIGHT * green + BLUE_LUMA_WEIGHT * blue) / MAX_CHANNEL_VALUE
    return relativeLuminance > LUMINANCE_THRESHOLD_FOR_DARK_TEXT ? DARK_TEXT : LIGHT_TEXT
}
