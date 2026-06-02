import { ChangeDetectionStrategy, Component } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { setHeightMetric } from "../../../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { heightMetricSelector } from "../../../../state/store/dynamicSettings/heightMetric/heightMetric.selector"
import { MetricSegmentBase } from "../../util/metricSegmentBase"
import { DistributionSegmentComponent } from "../distributionSegment/distributionSegment.component"
import { HeightSettingsPopoverComponent } from "../heightSettingsPopover/heightSettingsPopover.component"

@Component({
    selector: "cc-height-segment",
    templateUrl: "./heightSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [DistributionSegmentComponent, HeightSettingsPopoverComponent]
})
export class HeightSegmentComponent extends MetricSegmentBase {
    readonly searchPopoverId = "metric-select-popover-height"
    readonly searchAnchorName = "metric-segment-height"
    readonly settingsPopoverId = "metric-settings-popover-height"
    readonly settingsAnchorName = "metric-segment-height-cog"

    readonly heightMetric = toSignal(this.store.select(heightMetricSelector), { initialValue: "" })
    protected readonly metric = this.heightMetric

    handleMetricSelected(value: string) {
        this.store.dispatch(setHeightMetric({ value }))
    }
}
