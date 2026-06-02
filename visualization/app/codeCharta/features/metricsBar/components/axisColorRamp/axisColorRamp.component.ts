import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { ColorRange, MapColors } from "../../../../codeCharta.model"
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
    readonly mapColors = input<Pick<MapColors, "positive" | "neutral" | "negative">>({
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
        return heights.map((height, index) => {
            const midpoint = min + (span * (index + 0.5)) / BIN_COUNT
            const color = computeBinColor(midpoint, range, colors)
            return { height, color }
        })
    })
}

function computeBinColor(midpoint: number, range: ColorRange, colors: Pick<MapColors, "positive" | "neutral" | "negative">): string {
    if (range.from === null || range.to === null) {
        return colors.neutral
    }
    const lower = Math.min(range.from, range.to)
    const upper = Math.max(range.from, range.to)
    if (midpoint < lower) {
        return colors.positive
    }
    if (midpoint > upper) {
        return colors.negative
    }
    return colors.neutral
}
