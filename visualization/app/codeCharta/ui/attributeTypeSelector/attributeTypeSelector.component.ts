import "./attributeTypeSelector.component.scss"
import { StoreService } from "../../state/store.service"
import { AttributeTypeValue } from "../../codeCharta.model"
import { setAttributeTypes } from "../../state/store/fileSettings/attributeTypes/attributeTypes.actions"

export class AttributeTypeSelectorController {
	/* @ngInject */
	constructor(private storeService: StoreService) {}

	public setToAbsolute(metricName: string, category: string) {
		this.setAttributeType(metricName, category, AttributeTypeValue.absolute)
	}

	public setToRelative(metricName: string, category: string) {
		this.setAttributeType(metricName, category, AttributeTypeValue.relative)
	}

	private setAttributeType(metricName: string, category: string, type: AttributeTypeValue) {
		const attributeTypes = this.storeService.getState().fileSettings.attributeTypes
		if (attributeTypes[category]) {
			attributeTypes[category][metricName] = type
		}
		this.storeService.dispatch(setAttributeTypes(attributeTypes))
	}
}

export const attributeTypeSelectorComponent = {
	selector: "attributeTypeSelectorComponent",
	template: require("./attributeTypeSelector.component.html"),
	controller: AttributeTypeSelectorController,
	bindings: { type: "@", metric: "@" }
}
