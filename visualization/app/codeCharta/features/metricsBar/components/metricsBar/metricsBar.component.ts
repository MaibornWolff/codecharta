import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { map } from "rxjs"
import { IsDeltaStateService } from "../../services/isDeltaState.service"
import { MetricDataService } from "../../services/metricData.service"
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
        class: "fixed left-0 right-0 mx-auto flex bg-base-100 rounded-box shadow-lg border border-base-300",
        "[style.bottom]": "'calc(var(--cc-bottom-bar-height, 32px) + var(--cc-file-extension-bar-height, 17px) + 12px)'",
        "[style.width]": "'max-content'",
        "[style.maxWidth]": "'min(95vw, 1200px)'",
        "[style.zIndex]": "50",
        "[style.pointerEvents]": "'auto'"
    }
})
export class MetricsBarComponent {
    private readonly isDeltaStateService = inject(IsDeltaStateService)
    private readonly metricDataService = inject(MetricDataService)

    readonly isDeltaState = toSignal(this.isDeltaStateService.isDeltaState$(), { initialValue: false })
    readonly hasEdgeMetric = toSignal(this.metricDataService.metricData$().pipe(map(metricData => metricData.edgeMetricData.length > 0)), {
        initialValue: false
    })

    readonly showColorMetricSegment = computed(() => !this.isDeltaState())

    readonly deltaColorSettingsPopoverId = "metric-settings-popover-color-delta"
    readonly deltaColorSettingsAnchorName = "metric-segment-color-settings"
}
