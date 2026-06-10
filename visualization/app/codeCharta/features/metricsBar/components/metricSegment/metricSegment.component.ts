import { ChangeDetectionStrategy, Component, input, output } from "@angular/core"
import { PrimaryMetrics } from "../../../../codeCharta.model"
import { AxisCardComponent } from "../axisCard/axisCard.component"
import { MetricMetaValueComponent } from "../metricMetaValue/metricMetaValue.component"
import { MetricSelectPopoverComponent } from "../metricSelectPopover/metricSelectPopover.component"

@Component({
    selector: "cc-metric-segment",
    templateUrl: "./metricSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [AxisCardComponent, MetricMetaValueComponent, MetricSelectPopoverComponent]
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
