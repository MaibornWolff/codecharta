import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { MapStateReadWindow } from "../../../../stores/mapState/mapState.read.facade"
import { MetricsBarWriteStore } from "../../stores/metricsBar.write.store"
import { AreaSettingsPopoverComponent } from "../areaSettingsPopover/areaSettingsPopover.component"
import { MetricSegmentComponent } from "../metricSegment/metricSegment.component"

@Component({
    selector: "cc-area-segment",
    templateUrl: "./areaSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [MetricSegmentComponent, AreaSettingsPopoverComponent]
})
export class AreaSegmentComponent {
    readonly searchPopoverId = "metric-select-popover-area"
    readonly searchAnchorName = "metric-segment-area"
    readonly settingsPopoverId = "metric-settings-popover-area"
    readonly settingsAnchorName = "metric-segment-area-cog"

    private readonly mapStateReadWindow = inject(MapStateReadWindow)
    private readonly metricsBarWriteStore = inject(MetricsBarWriteStore)

    readonly areaMetric = toSignal(this.mapStateReadWindow.areaMetric$, { initialValue: "" })

    handleMetricSelected(value: string) {
        this.metricsBarWriteStore.setAreaMetric(value)
    }
}
