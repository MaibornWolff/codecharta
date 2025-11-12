import { Component, input } from "@angular/core"
import { CcState } from "../../../codeCharta.model"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { Store } from "@ngrx/store"
import { metricTitles } from "../../../util/metric/metricTitles"
import { AsyncPipe } from "@angular/common"
import { AttributeDescriptorTooltipPipe } from "../../../util/pipes/attributeDescriptorTooltip.pipe"

@Component({
    selector: "cc-legend-block",
    templateUrl: "./legendBlock.component.html",
    styleUrls: ["./legendBlock.component.scss"],
    imports: [AsyncPipe, AttributeDescriptorTooltipPipe]
})
export class LegendBlockComponent {
    metricName = input.required<string>()
    metricSpecification = input.required<string>()
    attributeDescriptors$ = this.store.select(attributeDescriptorsSelector)
    fallbackTitles: Map<string, string> = metricTitles

    constructor(private store: Store<CcState>) {}
}
