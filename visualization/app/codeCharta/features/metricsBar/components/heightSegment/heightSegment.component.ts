import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { HeightMetricService } from "../../services/heightMetric.service"
import { MetricSegmentBase } from "../../util/metricSegmentBase"
import { MetricSegmentComponent } from "../metricSegment/metricSegment.component"
import { HeightSettingsPopoverComponent } from "../heightSettingsPopover/heightSettingsPopover.component"

@Component({
    selector: "cc-height-segment",
    templateUrl: "./heightSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [MetricSegmentComponent, HeightSettingsPopoverComponent]
})
export class HeightSegmentComponent extends MetricSegmentBase {
    readonly searchPopoverId = "metric-select-popover-height"
    readonly searchAnchorName = "metric-segment-height"
    readonly settingsPopoverId = "metric-settings-popover-height"
    readonly settingsAnchorName = "metric-segment-height-cog"

    private readonly heightMetricService = inject(HeightMetricService)

    readonly heightMetric = toSignal(this.heightMetricService.heightMetric$(), { initialValue: "" })
    protected readonly metric = this.heightMetric

    handleMetricSelected(value: string) {
        this.heightMetricService.setHeightMetric(value)
    }
}
