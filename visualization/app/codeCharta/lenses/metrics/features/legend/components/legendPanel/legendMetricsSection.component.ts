import { ChangeDetectionStrategy, Component } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { LegendAreaMetricService } from "../../services/areaMetric.service"
import { LegendColorMetricService } from "../../services/colorMetric.service"
import { LegendEdgeMetricService } from "../../services/edgeMetric.service"
import { LegendHeightMetricService } from "../../services/heightMetric.service"
import { LegendMetricRowComponent } from "./legendMetricRow.component"

@Component({
    selector: "cc-legend-metrics-section",
    templateUrl: "./legendMetricsSection.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [LegendMetricRowComponent]
})
export class LegendMetricsSectionComponent {
    constructor(
        private readonly areaMetricService: LegendAreaMetricService,
        private readonly heightMetricService: LegendHeightMetricService,
        private readonly colorMetricService: LegendColorMetricService,
        private readonly edgeMetricService: LegendEdgeMetricService
    ) {}

    readonly areaMetric = toSignal(this.areaMetricService.areaMetric$(), { initialValue: "" })
    readonly heightMetric = toSignal(this.heightMetricService.heightMetric$(), { initialValue: "" })
    readonly colorMetric = toSignal(this.colorMetricService.colorMetric$(), { initialValue: "" })
    readonly edgeMetric = toSignal(this.edgeMetricService.edgeMetric$(), { initialValue: null })
}
