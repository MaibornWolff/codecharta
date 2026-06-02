import { ChangeDetectionStrategy, Component, input, output } from "@angular/core"
import { PrimaryMetrics } from "../../../../codeCharta.model"
import { AxisCardComponent } from "../axisCard/axisCard.component"
import { AxisDistributionComponent } from "../axisDistribution/axisDistribution.component"
import { MetricMetaValueComponent } from "../metricMetaValue/metricMetaValue.component"
import { MetricSelectPopoverComponent } from "../metricSelectPopover/metricSelectPopover.component"

@Component({
    selector: "cc-distribution-segment",
    templateUrl: "./distributionSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [AxisCardComponent, AxisDistributionComponent, MetricMetaValueComponent, MetricSelectPopoverComponent]
})
export class DistributionSegmentComponent {
    readonly label = input.required<string>()
    readonly metricName = input("")
    readonly metricFor = input.required<keyof PrimaryMetrics>()
    readonly placeholder = input("")
    readonly searchPopoverId = input.required<string>()
    readonly searchAnchorName = input.required<string>()
    readonly settingsPopoverId = input.required<string>()
    readonly settingsAnchorName = input.required<string>()
    readonly testIdPrefix = input.required<string>()
    readonly values = input<number[]>([])
    readonly minLabel = input("0")
    readonly maxLabel = input("0")
    readonly metricSelected = output<string>()
}
