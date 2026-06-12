import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { HexMapColor } from "../../../../codeCharta.model"
import { defaultMapColors } from "../../../../state/store/appSettings/mapColors/mapColors.reducer"
import { MapColorLabelPipe } from "../../../../util/pipes/mapColorLabel.pipe"
import { LegendColorMetricService } from "../../services/colorMetric.service"
import { LegendColorRangeService } from "../../services/colorRange.service"
import { LegendMapColorsService } from "../../services/mapColors.service"
import { LegendSelectedColorMetricDataService } from "../../services/selectedColorMetricData.service"

@Component({
    selector: "cc-legend-color-row",
    templateUrl: "./legendColorRow.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MapColorLabelPipe]
})
export class LegendColorRowComponent {
    constructor(
        private readonly colorMetricService: LegendColorMetricService,
        private readonly colorRangeService: LegendColorRangeService,
        private readonly selectedColorMetricDataService: LegendSelectedColorMetricDataService,
        private readonly mapColorsService: LegendMapColorsService
    ) {}

    readonly mapColorFor = input.required<HexMapColor>()

    readonly colorMetric = toSignal(this.colorMetricService.colorMetric$(), { initialValue: "" })
    readonly colorRange = toSignal(this.colorRangeService.colorRange$(), { initialValue: { from: 0, to: 0 } })
    readonly nodeMetricRange = toSignal(this.selectedColorMetricDataService.selectedColorMetricData$(), {
        initialValue: { values: [] as number[], minValue: 0, maxValue: 0 }
    })
    private readonly mapColors = toSignal(this.mapColorsService.mapColors$(), { initialValue: defaultMapColors })

    readonly color = computed(() => this.mapColors()[this.mapColorFor()] as string)
}
