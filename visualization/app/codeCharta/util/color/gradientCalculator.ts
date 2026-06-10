import { ColorMode, ColorRange, MapColors } from "../../codeCharta.model"
import { ColorConverter } from "./colorConverter"
import { Color } from "three"
import { MetricMinMax } from "../../state/selectors/accumulatedData/metricData/selectedColorMetricData.selector"

export type CategoricalMapColors = Pick<MapColors, "positive" | "neutral" | "negative">

/**
 * Single source of truth for mapping a metric value to its display color.
 * Used by the 3D map (getBuildingColor) and the metrics-bar color ramp so
 * both always classify boundary values identically (a value exactly at
 * colorRange.to is negative).
 */
export function getColorByMetricValue(
    mapColors: CategoricalMapColors,
    colorRange: ColorRange,
    colorMode: ColorMode,
    nodeMetricDataRange: MetricMinMax,
    metricValue: number
): string {
    if (colorMode === ColorMode.absolute) {
        if (metricValue < colorRange.from || colorRange.from === nodeMetricDataRange.maxValue) {
            return mapColors.positive
        }
        if (metricValue < colorRange.to || colorRange.to === nodeMetricDataRange.maxValue) {
            return mapColors.neutral
        }
        return mapColors.negative
    }
    if (colorMode === ColorMode.trueGradient) {
        return gradientCalculator.getColorByTrueGradient(mapColors, colorRange, nodeMetricDataRange, metricValue)
    }
    if (colorMode === ColorMode.focusedGradient) {
        return gradientCalculator.getColorByFocusedGradient(mapColors, colorRange, nodeMetricDataRange, metricValue)
    }
    return gradientCalculator.getColorByWeightedGradient(mapColors, colorRange, nodeMetricDataRange, metricValue)
}

export const gradientCalculator = {
    getColorByTrueGradient(
        mapColors: CategoricalMapColors,
        colorRange: ColorRange,
        nodeMetricDataRange: MetricMinMax,
        metricValue: number
    ) {
        const middle = (colorRange.from + colorRange.to) / 2
        const neutralColorRGB = ColorConverter.convertHexToColorObject(mapColors.neutral)

        if (metricValue <= middle) {
            const neutralFactor = metricValue / middle
            const positiveColorRGB = ColorConverter.convertHexToColorObject(mapColors.positive)
            return ColorConverter.convertColorToHex(new Color().lerpColors(positiveColorRGB, neutralColorRGB, neutralFactor))
        }

        const negativeFactor = (metricValue - middle) / (nodeMetricDataRange.maxValue - middle)
        const negativeColorRGB = ColorConverter.convertHexToColorObject(mapColors.negative)
        return ColorConverter.convertColorToHex(new Color().lerpColors(neutralColorRGB, negativeColorRGB, negativeFactor))
    },

    getColorByFocusedGradient(
        mapColors: CategoricalMapColors,
        colorRange: ColorRange,
        nodeMetricDataRange: MetricMinMax,
        metricValue: number
    ) {
        const middle = (colorRange.from + colorRange.to) / 2
        const neutralColorRGB = ColorConverter.convertHexToColorObject(mapColors.neutral)

        if (metricValue < colorRange.from || colorRange.from === nodeMetricDataRange.maxValue) {
            return mapColors.positive
        }

        if (metricValue >= colorRange.to && colorRange.to !== nodeMetricDataRange.maxValue) {
            return mapColors.negative
        }

        if (metricValue === middle) {
            return mapColors.neutral
        }

        if (metricValue < middle) {
            const neutralFactor = metricValue / (middle + colorRange.from)
            const positiveColorRGB = ColorConverter.convertHexToColorObject(mapColors.positive)
            return ColorConverter.convertColorToHex(new Color().lerpColors(positiveColorRGB, neutralColorRGB, neutralFactor))
        }

        const negativeFactor = (metricValue - middle) / (colorRange.to - middle)
        const negativeColorRGB = ColorConverter.convertHexToColorObject(mapColors.negative)
        return ColorConverter.convertColorToHex(new Color().lerpColors(neutralColorRGB, negativeColorRGB, negativeFactor))
    },

    getColorByWeightedGradient(
        mapColors: CategoricalMapColors,
        colorRange: ColorRange,
        nodeMetricDataRange: MetricMinMax,
        metricValue: number
    ) {
        const endPositive = Math.max(colorRange.from - (colorRange.to - colorRange.from) / 2, colorRange.from / 2)
        const startNeutral = 2 * colorRange.from - endPositive
        const endNeutral = colorRange.to - (colorRange.to - colorRange.from) / 2
        const startNegative = colorRange.to

        if (endPositive === startNeutral && startNeutral === endNeutral && endNeutral === startNegative) {
            if (metricValue < endPositive || colorRange.to === nodeMetricDataRange.maxValue) {
                return mapColors.positive
            }
            return mapColors.negative
        }

        if (metricValue <= endPositive) {
            return mapColors.positive
        }

        if (metricValue < startNeutral) {
            const factor = (metricValue - endPositive) / (startNeutral - endPositive)
            const positiveColorRGB = ColorConverter.convertHexToColorObject(mapColors.positive)
            const neutralColorRGB = ColorConverter.convertHexToColorObject(mapColors.neutral)
            return ColorConverter.convertColorToHex(new Color().lerpColors(positiveColorRGB, neutralColorRGB, factor))
        }

        if (metricValue <= endNeutral) {
            return mapColors.neutral
        }

        if (metricValue < startNegative || colorRange.to === nodeMetricDataRange.maxValue) {
            const factor = (metricValue - endNeutral) / (startNegative - endNeutral)
            const neutralColorRGB = ColorConverter.convertHexToColorObject(mapColors.neutral)
            const negativeColorRGB = ColorConverter.convertHexToColorObject(mapColors.negative)
            return ColorConverter.convertColorToHex(new Color().lerpColors(neutralColorRGB, negativeColorRGB, factor))
        }

        return mapColors.negative
    }
}
