import convert from "color-convert"
import { ColorMode, ColorRange, MapColors } from "../../../model/codeCharta.model"
import { getColorByMetricValue } from "../../../util/color/gradientCalculator"
import { MetricMinMax } from "../../../util/metric/metricRange"
import { UNARY_METRIC } from "../../../util/metric/unaryMetric"
import { SunburstNode } from "./sunburstTree"

export interface SunburstColoring {
    colorMetric: string
    colorRange: ColorRange
    colorMode: ColorMode
    mapColors: MapColors
    colorMetricRange: MetricMinMax
}

const DARK_TEXT = "#1f2937"
const LIGHT_TEXT = "#ffffff"
const LUMINANCE_THRESHOLD_FOR_DARK_TEXT = 0.5

export function nodeColor({ colorValue, isFlat }: Pick<SunburstNode, "colorValue" | "isFlat">, coloring: SunburstColoring): string {
    const { mapColors } = coloring
    if (colorValue === undefined) {
        return mapColors.base
    }
    if (isFlat) {
        return mapColors.flat
    }
    if (coloring.colorMetric === UNARY_METRIC) {
        return mapColors.positive
    }
    return getColorByMetricValue(mapColors, coloring.colorRange, coloring.colorMode, coloring.colorMetricRange, colorValue)
}

export function readableTextColor(backgroundHex: string): string {
    const [red, green, blue] = convert.hex.rgb(backgroundHex)
    const relativeLuminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255
    return relativeLuminance > LUMINANCE_THRESHOLD_FOR_DARK_TEXT ? DARK_TEXT : LIGHT_TEXT
}
