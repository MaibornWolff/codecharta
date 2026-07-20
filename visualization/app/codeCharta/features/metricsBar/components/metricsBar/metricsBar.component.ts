import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { map } from "rxjs"
import { FileStoreReadWindow } from "../../../../stores/fileStore/fileStore.facade"
import { AxisCardComponent, BAR_BOTTOM_ABOVE_FILE_EXTENSION_BAR, BarShellDirective } from "../../../shared/facade"
import { MetricsBarReadStore } from "../../stores/metricsBar.read.store"
import { AreaSegmentComponent } from "../areaSegment/areaSegment.component"
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
    hostDirectives: [BarShellDirective],
    host: { "[style.bottom]": "barBottom" }
})
export class MetricsBarComponent {
    readonly barBottom = BAR_BOTTOM_ABOVE_FILE_EXTENSION_BAR

    private readonly fileStoreReadWindow = inject(FileStoreReadWindow)
    private readonly metricsBarReadStore = inject(MetricsBarReadStore)

    readonly isDeltaState = toSignal(this.fileStoreReadWindow.isDeltaState$, { initialValue: false })
    readonly hasEdgeMetric = toSignal(this.metricsBarReadStore.metricData$.pipe(map(metricData => metricData.edgeMetricData.length > 0)), {
        initialValue: false
    })

    readonly showColorMetricSegment = computed(() => !this.isDeltaState())

    readonly deltaColorSettingsPopoverId = "metric-settings-popover-color-delta"
    readonly deltaColorSettingsAnchorName = "metric-segment-color-settings"
}
