import { ChangeDetectionStrategy, Component, input, output } from "@angular/core"
import { PrimaryMetrics } from "../../../../model/codeCharta.model"
import { AxisCardComponent } from "../../../shared/facade"
import { MetricBarSelectPopoverComponent } from "../metricBarSelectPopover/metricBarSelectPopover.component"
import { MetricMetaValueComponent } from "../metricMetaValue/metricMetaValue.component"

@Component({
    selector: "cc-metric-segment",
    templateUrl: "./metricSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [AxisCardComponent, MetricMetaValueComponent, MetricBarSelectPopoverComponent]
})
export class MetricSegmentComponent {
    readonly label = input.required<string>()
    readonly metricName = input("")
    readonly metricFor = input.required<keyof PrimaryMetrics>()
    readonly placeholder = input("")
    readonly searchPopoverId = input.required<string>()
    readonly searchAnchorName = input.required<string>()
    readonly settingsPopoverId = input.required<string>()
    readonly settingsAnchorName = input.required<string>()
    readonly testIdPrefix = input.required<string>()
    readonly metricSelected = output<string>()
}
