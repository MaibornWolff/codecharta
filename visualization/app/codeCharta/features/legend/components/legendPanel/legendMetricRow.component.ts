import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { MetricsLensFacade } from "../../../../lenses/metrics/metricsLens.facade"
import { AttributeDescriptors } from "../../../../model/codeCharta.model"
import { metricTitles } from "../../../../util/metric/metricTitles"
import { AttributeDescriptorTooltipPipe } from "../../../../util/pipes/attributeDescriptorTooltip.pipe"

@Component({
    selector: "cc-legend-metric-row",
    templateUrl: "./legendMetricRow.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AttributeDescriptorTooltipPipe]
})
export class LegendMetricRowComponent {
    constructor(private readonly metricsLensFacade: MetricsLensFacade) {}

    readonly label = input.required<string>()
    readonly metricName = input.required<string>()

    private readonly attributeDescriptors = toSignal(this.metricsLensFacade.descriptors$, {
        initialValue: {} as AttributeDescriptors
    })

    readonly descriptor = computed(() => this.attributeDescriptors()[this.metricName()])
    readonly title = computed(() => this.descriptor()?.title || metricTitles.get(this.metricName()) || this.metricName())
}
