import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"
import { visibleNodeMetricValuesSelector } from "../../../../state/selectors/visibleNodeMetricValues/visibleNodeMetricValues.selector"
import { setAreaMetric } from "../../../../state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { areaMetricSelector } from "../../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { AreaSettingsPopoverComponent } from "../areaSettingsPopover/areaSettingsPopover.component"
import { DistributionSegmentComponent } from "../distributionSegment/distributionSegment.component"

@Component({
    selector: "cc-area-segment",
    templateUrl: "./areaSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [DistributionSegmentComponent, AreaSettingsPopoverComponent]
})
export class AreaSegmentComponent {
    private readonly store = inject(Store<CcState>)

    readonly searchPopoverId = "metric-select-popover-area"
    readonly searchAnchorName = "metric-segment-area"
    readonly settingsPopoverId = "metric-settings-popover-area"
    readonly settingsAnchorName = "metric-segment-area-cog"

    readonly areaMetric = toSignal(this.store.select(areaMetricSelector), { initialValue: "" })
    readonly visibleMetricValues = toSignal(this.store.select(visibleNodeMetricValuesSelector), { initialValue: {} })

    readonly currentMetric = computed(() => this.visibleMetricValues()[this.areaMetric()] ?? null)
    readonly values = computed(() => this.currentMetric()?.values ?? [])
    readonly minLabel = computed(() => this.currentMetric()?.minValue.toLocaleString() ?? "0")
    readonly maxLabel = computed(() => this.currentMetric()?.maxValue.toLocaleString() ?? "0")

    handleMetricSelected(value: string) {
        this.store.dispatch(setAreaMetric({ value }))
    }
}
