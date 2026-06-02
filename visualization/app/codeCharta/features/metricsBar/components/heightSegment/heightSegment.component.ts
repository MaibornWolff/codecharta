import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"
import { visibleNodeMetricValuesSelector } from "../../../../state/selectors/visibleNodeMetricValues/visibleNodeMetricValues.selector"
import { setHeightMetric } from "../../../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { heightMetricSelector } from "../../../../state/store/dynamicSettings/heightMetric/heightMetric.selector"
import { DistributionSegmentComponent } from "../distributionSegment/distributionSegment.component"
import { HeightSettingsPopoverComponent } from "../heightSettingsPopover/heightSettingsPopover.component"

@Component({
    selector: "cc-height-segment",
    templateUrl: "./heightSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [DistributionSegmentComponent, HeightSettingsPopoverComponent]
})
export class HeightSegmentComponent {
    private readonly store = inject(Store<CcState>)

    readonly searchPopoverId = "metric-select-popover-height"
    readonly searchAnchorName = "metric-segment-height"
    readonly settingsPopoverId = "metric-settings-popover-height"
    readonly settingsAnchorName = "metric-segment-height-cog"

    readonly heightMetric = toSignal(this.store.select(heightMetricSelector), { initialValue: "" })
    readonly visibleMetricValues = toSignal(this.store.select(visibleNodeMetricValuesSelector), { initialValue: {} })

    readonly currentMetric = computed(() => this.visibleMetricValues()[this.heightMetric()] ?? null)
    readonly values = computed(() => this.currentMetric()?.values ?? [])
    readonly minLabel = computed(() => this.currentMetric()?.minValue.toLocaleString() ?? "0")
    readonly maxLabel = computed(() => this.currentMetric()?.maxValue.toLocaleString() ?? "0")

    handleMetricSelected(value: string) {
        this.store.dispatch(setHeightMetric({ value }))
    }
}
