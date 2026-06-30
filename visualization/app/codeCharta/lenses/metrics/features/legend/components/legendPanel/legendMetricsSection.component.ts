import { ChangeDetectionStrategy, Component } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { LegendService } from "../../services/legend.service"
import { LegendMetricRowComponent } from "./legendMetricRow.component"

@Component({
    selector: "cc-legend-metrics-section",
    templateUrl: "./legendMetricsSection.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [LegendMetricRowComponent]
})
export class LegendMetricsSectionComponent {
    constructor(private readonly legendService: LegendService) {}

    readonly areaMetric = toSignal(this.legendService.areaMetric$(), { initialValue: "" })
    readonly heightMetric = toSignal(this.legendService.heightMetric$(), { initialValue: "" })
    readonly colorMetric = toSignal(this.legendService.colorMetric$(), { initialValue: "" })
    readonly edgeMetric = toSignal(this.legendService.edgeMetric$(), { initialValue: null })
}
