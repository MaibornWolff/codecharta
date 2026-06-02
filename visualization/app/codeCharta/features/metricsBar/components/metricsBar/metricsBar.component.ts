import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { map } from "rxjs"
import { CcState } from "../../../../codeCharta.model"
import { metricDataSelector } from "../../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { isDeltaStateSelector } from "../../../../state/selectors/isDeltaState.selector"
import { AreaSegmentComponent } from "../areaSegment/areaSegment.component"
import { AxisCardComponent } from "../axisCard/axisCard.component"
import { ColorSegmentComponent } from "../colorSegment/colorSegment.component"
import { ColorSettingsPopoverComponent } from "../colorSettingsPopover/colorSettingsPopover.component"
import { EdgeSegmentComponent } from "../edgeSegment/edgeSegment.component"
import { HeightSegmentComponent } from "../heightSegment/heightSegment.component"
import { LabelsScenariosSegmentComponent } from "../labelsScenariosSegment/labelsScenariosSegment.component"
import { LinkColorHeightButtonComponent } from "../linkColorHeightButton/linkColorHeightButton.component"

@Component({
    selector: "cc-metrics-bar",
    templateUrl: "./metricsBar.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        AreaSegmentComponent,
        AxisCardComponent,
        ColorSegmentComponent,
        ColorSettingsPopoverComponent,
        EdgeSegmentComponent,
        HeightSegmentComponent,
        LabelsScenariosSegmentComponent,
        LinkColorHeightButtonComponent
    ],
    host: {
        class: "fixed flex bg-base-100 rounded-box shadow-lg border border-base-300 divide-x divide-base-300",
        "[style.bottom]": "'calc(var(--cc-bottom-bar-height, 32px) + 12px)'",
        "[style.left]": "'0'",
        "[style.right]": "'0'",
        "[style.margin-inline]": "'auto'",
        "[style.width]": "'max-content'",
        "[style.maxWidth]": "'min(95vw, 1200px)'",
        "[style.zIndex]": "50",
        "[style.pointerEvents]": "'auto'"
    }
})
export class MetricsBarComponent {
    private readonly store = inject(Store<CcState>)

    readonly isDeltaState = toSignal(this.store.select(isDeltaStateSelector), { initialValue: false })
    readonly hasEdgeMetric = toSignal(this.store.select(metricDataSelector).pipe(map(metricData => metricData.edgeMetricData.length > 0)), {
        initialValue: false
    })

    readonly showColorMetricSegment = computed(() => !this.isDeltaState())

    readonly deltaColorSettingsPopoverId = "metric-settings-popover-color-delta"
    readonly deltaColorSettingsAnchorName = "metric-segment-color-settings"
}
