import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { AttributeDescriptorTooltipPipe } from "../../../../util/pipes/attributeDescriptorTooltip.pipe"
import { MappingBlock, MappingBlockKind } from "../../selectors/inspectorMappingBlocks.selector"
import { formatMetricNumber } from "../../util/formatMetricNumber"

@Component({
    selector: "cc-inspector-mapping-block",
    templateUrl: "./inspectorMappingBlock.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AttributeDescriptorTooltipPipe],
    host: { class: "block py-2" }
})
export class InspectorMappingBlockComponent {
    private static readonly ICONS: Record<MappingBlockKind, string> = {
        area: "fa fa-arrows-alt",
        height: "fa fa-arrows-v",
        color: "fa fa-paint-brush",
        edge: "fa fa-exchange"
    }

    readonly block = input.required<MappingBlock>()

    readonly iconClasses = computed(() => `${InspectorMappingBlockComponent.ICONS[this.block().kind]} text-xs text-primary`)
    readonly rangeText = computed(() => `${formatMetricNumber(this.block().min)} – ${formatMetricNumber(this.block().max)}`)
    readonly edgeCountText = computed(() => `${formatMetricNumber(this.block().incoming)}/${formatMetricNumber(this.block().outgoing)}`)
}
