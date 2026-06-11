import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { AttributeDescriptorTooltipPipe } from "../../../../util/pipes/attributeDescriptorTooltip.pipe"
import { MetricRow } from "../../selectors/inspectorMetricRows.selector"
import { formatMetricNumber } from "../../util/formatMetricNumber"
import { MetricSeverity } from "../../util/metricSeverity"

@Component({
    selector: "cc-inspector-metric-row",
    templateUrl: "./inspectorMetricRow.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AttributeDescriptorTooltipPipe],
    host: { class: "block" }
})
export class InspectorMetricRowComponent {
    private static readonly SEVERITY_CLASSES: Record<MetricSeverity, string> = {
        success: "bg-success",
        warning: "bg-warning",
        error: "bg-error",
        neutral: "bg-base-content/30"
    }

    readonly row = input.required<MetricRow>()
    readonly positiveDeltaColor = input.required<string>()
    readonly negativeDeltaColor = input.required<string>()

    readonly formattedValue = computed(() => formatMetricNumber(this.row().value))
    readonly hasDelta = computed(() => Boolean(this.row().delta))
    readonly formattedDelta = computed(() => `Δ${formatMetricNumber(this.row().delta)}`)
    readonly deltaColor = computed(() => ((this.row().delta ?? 0) > 0 ? this.positiveDeltaColor() : this.negativeDeltaColor()))
    readonly barClasses = computed(() => `h-full rounded ${InspectorMetricRowComponent.SEVERITY_CLASSES[this.row().severity]}`)
    readonly barWidthPercentage = computed(() => this.row().fraction * 100)
}
