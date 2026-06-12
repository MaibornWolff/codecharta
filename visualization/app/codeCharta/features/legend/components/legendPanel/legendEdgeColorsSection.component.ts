import { ChangeDetectionStrategy, Component } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { LegendEdgeMetricService } from "../../services/edgeMetric.service"
import { LegendColorRowComponent } from "./legendColorRow.component"

@Component({
    selector: "cc-legend-edge-colors-section",
    templateUrl: "./legendEdgeColorsSection.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [LegendColorRowComponent]
})
export class LegendEdgeColorsSectionComponent {
    constructor(private readonly edgeMetricService: LegendEdgeMetricService) {}

    readonly edgeMetric = toSignal(this.edgeMetricService.edgeMetric$(), { initialValue: null })
}
