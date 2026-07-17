import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { MapStateReadWindow } from "../../../../stores/mapState/mapState.read.facade"
import { MetricsBarWriteStore } from "../../stores/metricsBar.write.store"
import { HeightSettingsPopoverComponent } from "../heightSettingsPopover/heightSettingsPopover.component"
import { MetricSegmentComponent } from "../metricSegment/metricSegment.component"

@Component({
    selector: "cc-height-segment",
    templateUrl: "./heightSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [MetricSegmentComponent, HeightSettingsPopoverComponent]
})
export class HeightSegmentComponent {
    readonly searchPopoverId = "metric-select-popover-height"
    readonly searchAnchorName = "metric-segment-height"
    readonly settingsPopoverId = "metric-settings-popover-height"
    readonly settingsAnchorName = "metric-segment-height-cog"

    private readonly mapStateReadWindow = inject(MapStateReadWindow)
    private readonly metricsBarWriteStore = inject(MetricsBarWriteStore)

    readonly heightMetric = toSignal(this.mapStateReadWindow.heightMetric$, { initialValue: "" })

    handleMetricSelected(value: string) {
        this.metricsBarWriteStore.setHeightMetric(value)
    }
}
