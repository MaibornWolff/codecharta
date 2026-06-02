import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { AreaMetricService } from "../../services/areaMetric.service"
import { MetricSegmentBase } from "../../util/metricSegmentBase"
import { AreaSettingsPopoverComponent } from "../areaSettingsPopover/areaSettingsPopover.component"
import { DistributionSegmentComponent } from "../distributionSegment/distributionSegment.component"

@Component({
    selector: "cc-area-segment",
    templateUrl: "./areaSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [DistributionSegmentComponent, AreaSettingsPopoverComponent]
})
export class AreaSegmentComponent extends MetricSegmentBase {
    readonly searchPopoverId = "metric-select-popover-area"
    readonly searchAnchorName = "metric-segment-area"
    readonly settingsPopoverId = "metric-settings-popover-area"
    readonly settingsAnchorName = "metric-segment-area-cog"

    private readonly areaMetricService = inject(AreaMetricService)

    readonly areaMetric = toSignal(this.areaMetricService.areaMetric$(), { initialValue: "" })
    protected readonly metric = this.areaMetric

    handleMetricSelected(value: string) {
        this.areaMetricService.setAreaMetric(value)
    }
}
