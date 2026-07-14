import { ChangeDetectionStrategy, Component } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { MapStateReadWindow } from "../../../../stores/mapState/mapState.read.facade"
import { LegendColorRowComponent } from "./legendColorRow.component"

@Component({
    selector: "cc-legend-edge-colors-section",
    templateUrl: "./legendEdgeColorsSection.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [LegendColorRowComponent]
})
export class LegendEdgeColorsSectionComponent {
    constructor(private readonly mapStateReadWindow: MapStateReadWindow) {}

    readonly edgeMetric = toSignal(this.mapStateReadWindow.edgeMetric$, { initialValue: null })
}
