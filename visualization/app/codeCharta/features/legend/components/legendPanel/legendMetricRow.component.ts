import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { AttributeDescriptors } from "../../../../codeCharta.model"
import { metricTitles } from "../../../../util/metric/metricTitles"
import { AttributeDescriptorTooltipPipe } from "../../../../util/pipes/attributeDescriptorTooltip.pipe"
import { LegendAttributeDescriptorsService } from "../../services/attributeDescriptors.service"

@Component({
    selector: "cc-legend-metric-row",
    templateUrl: "./legendMetricRow.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AttributeDescriptorTooltipPipe]
})
export class LegendMetricRowComponent {
    constructor(private readonly attributeDescriptorsService: LegendAttributeDescriptorsService) {}

    readonly label = input.required<string>()
    readonly metricName = input.required<string>()

    private readonly attributeDescriptors = toSignal(this.attributeDescriptorsService.attributeDescriptors$(), {
        initialValue: {} as AttributeDescriptors
    })

    readonly descriptor = computed(() => this.attributeDescriptors()[this.metricName()])
    readonly title = computed(() => this.descriptor()?.title || metricTitles.get(this.metricName()) || this.metricName())
}
