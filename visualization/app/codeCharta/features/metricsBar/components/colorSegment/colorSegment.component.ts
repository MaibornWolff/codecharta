import { ChangeDetectionStrategy, Component } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { ColorMetricService } from "../../services/colorMetric.service"
import { IsHeightAndColorMetricLinkedService } from "../../services/isHeightAndColorMetricLinked.service"
import { AxisCardComponent } from "../axisCard/axisCard.component"
import { ColorSettingsPopoverComponent } from "../colorSettingsPopover/colorSettingsPopover.component"
import { MetricMetaValueComponent } from "../metricMetaValue/metricMetaValue.component"
import { MetricSelectPopoverComponent } from "../metricSelectPopover/metricSelectPopover.component"

@Component({
    selector: "cc-color-segment",
    templateUrl: "./colorSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [AxisCardComponent, MetricSelectPopoverComponent, MetricMetaValueComponent, ColorSettingsPopoverComponent]
})
export class ColorSegmentComponent {
    constructor(
        private readonly colorMetricService: ColorMetricService,
        private readonly isHeightAndColorMetricLinkedService: IsHeightAndColorMetricLinkedService
    ) {}

    readonly searchPopoverId = "metric-select-popover-color"
    readonly searchAnchorName = "metric-segment-color"
    readonly settingsPopoverId = "metric-settings-popover-color"
    readonly settingsAnchorName = "metric-segment-color-cog"

    readonly colorMetric = toSignal(this.colorMetricService.colorMetric$(), { initialValue: "" })
    readonly isLinked = toSignal(this.isHeightAndColorMetricLinkedService.isHeightAndColorMetricLinked$(), { initialValue: false })

    handleMetricSelected(value: string) {
        this.colorMetricService.setColorMetric(value)
    }
}
