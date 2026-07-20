import { ChangeDetectionStrategy, Component } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { MapStateReadWindow } from "../../../../stores/mapState/mapState.read.facade"
import { PreferencesReadWindow } from "../../../../stores/preferences/preferences.read.facade"
import { AxisCardComponent } from "../../../shared/facade"
import { MetricsBarWriteStore } from "../../stores/metricsBar.write.store"
import { ColorSettingsPopoverComponent } from "../colorSettingsPopover/colorSettingsPopover.component"
import { MetricMetaValueComponent } from "../metricMetaValue/metricMetaValue.component"
import { MetricSelectPopoverComponent } from "../metricSelectPopover/metricSelectPopover.component"

@Component({
    selector: "cc-color-segment",
    templateUrl: "./colorSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [AxisCardComponent, MetricSelectPopoverComponent, MetricMetaValueComponent, ColorSettingsPopoverComponent]
})
export class ColorSegmentComponent {
    constructor(
        private readonly mapStateReadWindow: MapStateReadWindow,
        private readonly preferencesReadWindow: PreferencesReadWindow,
        private readonly metricsBarWriteStore: MetricsBarWriteStore
    ) {}

    readonly searchPopoverId = "metric-select-popover-color"
    readonly searchAnchorName = "metric-segment-color"
    readonly settingsPopoverId = "metric-settings-popover-color"
    readonly settingsAnchorName = "metric-segment-color-cog"

    readonly colorMetric = toSignal(this.mapStateReadWindow.colorMetric$, { initialValue: "" })
    readonly isLinked = toSignal(this.preferencesReadWindow.isColorMetricLinkedToHeightMetric$, { initialValue: false })

    handleMetricSelected(value: string) {
        this.metricsBarWriteStore.setColorMetric(value)
    }
}
