import { Component, Input, ViewEncapsulation } from "@angular/core"
import { AttributeDescriptor, AttributeDescriptors } from "../../../codeCharta.model"
import { Observable } from "rxjs"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"

@Component({
	selector: "cc-legend-block",
	templateUrl: "./legendBlock.component.html",
	encapsulation: ViewEncapsulation.None
})
export class LegendBlockComponent {
	@Input() metricName: string
	@Input() attributeDescriptors?: Observable<AttributeDescriptors> = this.store.select(attributeDescriptorsSelector)
	attributeDescriptor: AttributeDescriptor
}
