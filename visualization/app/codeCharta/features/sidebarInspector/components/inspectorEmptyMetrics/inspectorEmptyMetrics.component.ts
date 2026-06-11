import { ChangeDetectionStrategy, Component, input, signal } from "@angular/core"
import { MetricRow } from "../../selectors/inspectorMetricRows.selector"
import { MetricComparisonMode } from "../../services/inspectorComparisonMode.service"
import { InspectorMetricRowComponent } from "../inspectorMetricRow/inspectorMetricRow.component"

@Component({
    selector: "cc-inspector-empty-metrics",
    templateUrl: "./inspectorEmptyMetrics.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [InspectorMetricRowComponent],
    host: { class: "block" }
})
export class InspectorEmptyMetricsComponent {
    readonly rows = input.required<MetricRow[]>()
    readonly comparisonMode = input.required<MetricComparisonMode>()
    readonly positiveDeltaColor = input.required<string>()
    readonly negativeDeltaColor = input.required<string>()

    readonly showEmptyMetrics = signal(false)

    toggleEmptyMetrics() {
        this.showEmptyMetrics.update(value => !value)
    }
}
