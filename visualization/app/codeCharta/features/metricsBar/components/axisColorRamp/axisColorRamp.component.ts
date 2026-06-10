import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { ColorMode, ColorRange } from "../../../../codeCharta.model"
import { CategoricalMapColors, getColorByMetricValue } from "../../../../util/color/gradientCalculator"
import { histogramBins } from "../../util/histogramBins"

const BIN_COUNT = 12

@Component({
    selector: "cc-axis-color-ramp",
    templateUrl: "./axisColorRamp.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "flex items-end gap-px h-6 w-full" }
})
export class AxisColorRampComponent {
    readonly values = input<readonly number[]>([])
    readonly min = input(0)
    readonly max = input(0)
    readonly colorRange = input<ColorRange>({ from: null, to: null })
    readonly colorMode = input<ColorMode>(ColorMode.absolute)
    readonly mapColors = input<CategoricalMapColors>({
        positive: "#69AE40",
        neutral: "#ddcc00",
        negative: "#820E0E"
    })

    readonly heights = computed(() => histogramBins(this.values(), BIN_COUNT, { min: this.min(), max: this.max() }))

    readonly bars = computed(() => {
        const heights = this.heights()
        const min = this.min()
        const max = this.max()
        const span = max - min
        const range = this.colorRange()
        const colors = this.mapColors()
        const colorMode = this.colorMode()
        return heights.map((height, index) => {
            const midpoint = min + (span * (index + 0.5)) / BIN_COUNT
            const color = computeBinColor(midpoint, range, colors, colorMode, { minValue: min, maxValue: max })
            return { height, color }
        })
    })
}

function computeBinColor(
    midpoint: number,
    range: ColorRange,
    colors: CategoricalMapColors,
    colorMode: ColorMode,
    metricMinMax: { minValue: number; maxValue: number }
): string {
    if (range.from === null || range.to === null) {
        return colors.neutral
    }
    // delegate to the map's color classification so bins at the thresholds
    // get exactly the color their buildings have on the 3D map
    return getColorByMetricValue(colors, range, colorMode, metricMinMax, midpoint)
}
