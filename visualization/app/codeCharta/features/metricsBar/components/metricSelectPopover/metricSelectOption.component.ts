import { ChangeDetectionStrategy, Component, input, output } from "@angular/core"
import { AttributeDescriptor, EdgeMetricData, NodeMetricData } from "../../../../codeCharta.model"
import { AttributeDescriptorTooltipPipe } from "../../../../util/pipes/attributeDescriptorTooltip.pipe"

@Component({
    selector: "cc-metric-select-option",
    templateUrl: "./metricSelectOption.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [AttributeDescriptorTooltipPipe]
})
export class MetricSelectOptionComponent {
    readonly option = input.required<NodeMetricData | EdgeMetricData>()
    readonly isActive = input(false)
    readonly isSelected = input(false)
    readonly descriptor = input<AttributeDescriptor | null>(null)
    readonly selectOption = output<string>()
    readonly hovered = output<void>()
}
