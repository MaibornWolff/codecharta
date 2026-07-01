import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { HexMapColor } from "../../../../../../codeCharta.model"
import { defaultMapColors } from "../../../../../../appearance/appearance.facade"
import { MapColorLabelPipe } from "../../../../../../util/pipes/mapColorLabel.pipe"
import { LegendService } from "../../services/legend.service"

@Component({
    selector: "cc-legend-color-row",
    templateUrl: "./legendColorRow.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MapColorLabelPipe]
})
export class LegendColorRowComponent {
    constructor(private readonly legendService: LegendService) {}

    readonly mapColorFor = input.required<HexMapColor>()

    readonly colorMetric = toSignal(this.legendService.colorMetric$(), { initialValue: "" })
    readonly colorRange = toSignal(this.legendService.colorRange$(), { initialValue: { from: 0, to: 0 } })
    readonly nodeMetricRange = toSignal(this.legendService.selectedColorMetricData$(), {
        initialValue: { values: [] as number[], minValue: 0, maxValue: 0 }
    })
    private readonly mapColors = toSignal(this.legendService.mapColors$(), { initialValue: defaultMapColors })

    readonly color = computed(() => this.mapColors()[this.mapColorFor()] as string)
}
