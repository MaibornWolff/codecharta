import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"
import { selectedColorMetricDataSelector } from "../../../../state/selectors/accumulatedData/metricData/selectedColorMetricData.selector"
import { visibleNodeMetricValuesSelector } from "../../../../state/selectors/visibleNodeMetricValues/visibleNodeMetricValues.selector"
import { mapColorsSelector } from "../../../../state/store/appSettings/mapColors/mapColors.selector"
import { isColorMetricLinkedToHeightMetricSelector } from "../../../../state/store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.selector"
import { setColorMetric } from "../../../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { colorMetricSelector } from "../../../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { colorRangeSelector } from "../../../../state/store/dynamicSettings/colorRange/colorRange.selector"
import { AxisCardComponent } from "../axisCard/axisCard.component"
import { AxisColorRampComponent } from "../axisColorRamp/axisColorRamp.component"
import { ColorSettingsPopoverComponent } from "../colorSettingsPopover/colorSettingsPopover.component"
import { MetricMetaValueComponent } from "../metricMetaValue/metricMetaValue.component"
import { MetricSelectPopoverComponent } from "../metricSelectPopover/metricSelectPopover.component"

@Component({
    selector: "cc-color-segment",
    templateUrl: "./colorSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [
        AxisCardComponent,
        AxisColorRampComponent,
        MetricSelectPopoverComponent,
        MetricMetaValueComponent,
        ColorSettingsPopoverComponent
    ]
})
export class ColorSegmentComponent {
    private readonly store = inject(Store<CcState>)

    readonly searchPopoverId = "metric-select-popover-color"
    readonly searchAnchorName = "metric-segment-color"
    readonly settingsPopoverId = "metric-settings-popover-color"
    readonly settingsAnchorName = "metric-segment-color-cog"

    readonly colorMetric = toSignal(this.store.select(colorMetricSelector), { initialValue: "" })
    readonly isLinked = toSignal(this.store.select(isColorMetricLinkedToHeightMetricSelector), { initialValue: false })
    readonly visibleMetricValues = toSignal(this.store.select(visibleNodeMetricValuesSelector), { initialValue: {} })
    readonly colorMetricData = toSignal(this.store.select(selectedColorMetricDataSelector), {
        initialValue: { values: [] as number[], minValue: 0, maxValue: 0 }
    })
    readonly colorRange = toSignal(this.store.select(colorRangeSelector), { initialValue: { from: null, to: null } })
    readonly mapColors = toSignal(this.store.select(mapColorsSelector))

    // Bar heights reflect the visible (rendered) buildings, but they are binned on the color
    // metric's global value axis — the same range the color thresholds (from/to) are derived
    // from — so the ramp's colors line up with the 3D map and the color settings popover.
    readonly currentMetric = computed(() => this.visibleMetricValues()[this.colorMetric()] ?? null)
    readonly values = computed(() => this.currentMetric()?.values ?? [])
    readonly minValue = computed(() => this.colorMetricData().minValue)
    readonly maxValue = computed(() => this.colorMetricData().maxValue)
    readonly minLabel = computed(() => this.minValue().toLocaleString())
    readonly maxLabel = computed(() => this.maxValue().toLocaleString())

    handleMetricSelected(value: string) {
        this.store.dispatch(setColorMetric({ value }))
    }
}
