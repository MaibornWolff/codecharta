import { ChangeDetectionStrategy, Component } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { MapStateReadWindow } from "../../../../stores/mapState/mapState.read.facade"
import { LegendMetricRowComponent } from "./legendMetricRow.component"

@Component({
    selector: "cc-legend-metrics-section",
    templateUrl: "./legendMetricsSection.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [LegendMetricRowComponent]
})
export class LegendMetricsSectionComponent {
    constructor(private readonly mapStateReadWindow: MapStateReadWindow) {}

    readonly areaMetric = toSignal(this.mapStateReadWindow.areaMetric$, { initialValue: "" })
    readonly heightMetric = toSignal(this.mapStateReadWindow.heightMetric$, { initialValue: "" })
    readonly colorMetric = toSignal(this.mapStateReadWindow.colorMetric$, { initialValue: "" })
    readonly edgeMetric = toSignal(this.mapStateReadWindow.edgeMetric$, { initialValue: null })
}
