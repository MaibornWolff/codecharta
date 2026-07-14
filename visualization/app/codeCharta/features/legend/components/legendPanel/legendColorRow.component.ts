import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { HexMapColor } from "../../../../model/codeCharta.model"
import { defaultMapColors, MapStateReadWindow } from "../../../../stores/mapState/mapState.read.facade"
import { MapColorLabelPipe } from "../../../../util/pipes/mapColorLabel.pipe"
import { LegendMetricRangeStore } from "../../stores/legendMetricRange.store"

@Component({
    selector: "cc-legend-color-row",
    templateUrl: "./legendColorRow.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MapColorLabelPipe]
})
export class LegendColorRowComponent {
    constructor(
        private readonly mapStateReadWindow: MapStateReadWindow,
        private readonly legendMetricRangeStore: LegendMetricRangeStore
    ) {}

    readonly mapColorFor = input.required<HexMapColor>()

    readonly colorMetric = toSignal(this.mapStateReadWindow.colorMetric$, { initialValue: "" })
    readonly colorRange = toSignal(this.mapStateReadWindow.colorRange$, { initialValue: { from: 0, to: 0 } })
    readonly nodeMetricRange = toSignal(this.legendMetricRangeStore.selectedColorMetricData$, {
        initialValue: { values: [] as number[], minValue: 0, maxValue: 0 }
    })
    private readonly mapColors = toSignal(this.mapStateReadWindow.mapColors$, { initialValue: defaultMapColors })

    readonly color = computed(() => this.mapColors()[this.mapColorFor()] as string)
}
