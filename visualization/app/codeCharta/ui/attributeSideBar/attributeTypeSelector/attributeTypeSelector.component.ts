import { Component, Input, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { AttributeTypes, AttributeTypeValue, CcState } from "../../../codeCharta.model"
import { updateAttributeType } from "../../../state/store/fileSettings/attributeTypes/attributeTypes.actions"
import { attributeTypesSelector } from "../../../state/store/fileSettings/attributeTypes/attributeTypes.selector"

@Component({
	selector: "cc-attribute-type-selector",
	templateUrl: "./attributeTypeSelector.component.html",
	styleUrls: ["./attributeTypeSelector.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class AttributeTypeSelectorComponent {
	@Input() metricName: string
	@Input() metricType: keyof AttributeTypes

	attributeTypes$ = this.store.select(attributeTypesSelector)

	constructor(private store: Store<CcState>) {}

	setToAbsolute() {
		this.setAttributeType(AttributeTypeValue.absolute)
	}

	setToRelative() {
		this.setAttributeType(AttributeTypeValue.relative)
	}

	private setAttributeType(attributeTypeValue: AttributeTypeValue) {
		this.store.dispatch(
			updateAttributeType({
				category: this.metricType,
				name: this.metricName,
				attributeType: attributeTypeValue
			})
		)
	}
}
