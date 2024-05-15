import { Component, Input, ViewEncapsulation } from "@angular/core"
import { CcState } from "../../../codeCharta.model"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { Store } from "@ngrx/store"
import { metricTitles } from "../../../util/metric/metricTitles"

@Component({
    selector: "cc-legend-block",
    templateUrl: "./legendBlock.component.html",
    encapsulation: ViewEncapsulation.None
})
export class LegendBlockComponent {
    @Input() metricName: string
    @Input() metricSpecification: string
    attributeDescriptors$ = this.store.select(attributeDescriptorsSelector)
    fallbackTitles: Map<string, string> = metricTitles

    constructor(private store: Store<CcState>) {}
}
