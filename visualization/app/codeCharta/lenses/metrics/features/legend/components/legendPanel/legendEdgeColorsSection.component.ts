import { ChangeDetectionStrategy, Component } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { LegendService } from "../../services/legend.service"
import { LegendColorRowComponent } from "./legendColorRow.component"

@Component({
    selector: "cc-legend-edge-colors-section",
    templateUrl: "./legendEdgeColorsSection.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [LegendColorRowComponent]
})
export class LegendEdgeColorsSectionComponent {
    constructor(private readonly legendService: LegendService) {}

    readonly edgeMetric = toSignal(this.legendService.edgeMetric$(), { initialValue: null })
}
