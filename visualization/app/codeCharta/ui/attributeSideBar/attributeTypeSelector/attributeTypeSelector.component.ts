import { Component, Inject, Input, ViewEncapsulation } from "@angular/core"
import { AttributeTypes, AttributeTypeValue } from "../../../codeCharta.model"
import { updateAttributeType } from "../../../state/store/fileSettings/attributeTypes/attributeTypes.actions"
import { Store } from "../../../state/angular-redux/store"
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

	constructor(@Inject(Store) private store: Store) {}

	setToAbsolute() {
		this.setAttributeType(AttributeTypeValue.absolute)
	}

	setToRelative() {
		this.setAttributeType(AttributeTypeValue.relative)
	}

	private setAttributeType(attributeTypeValue: AttributeTypeValue) {
		this.store.dispatch(updateAttributeType(this.metricType, this.metricName, attributeTypeValue))
	}
}
