import "./attributeTypeSelector.component.scss"
import { Component, Inject, Input } from "@angular/core"
import { Observable } from "rxjs"
import { AttributeTypeValue } from "../../codeCharta.model"
import { updateAttributeType } from "../../state/store/fileSettings/attributeTypes/attributeTypes.actions"
import { Store } from "../../state/angular-redux/store"
import { getAttributeTypeOfNodesByMetricSelector } from "../../state/selectors/getAttributeTypeOfNodesByMetric.selector"

@Component({
	selector: "cc-attribute-type-selector",
	template: require("./attributeTypeSelector.component.html")
})
export class AttributeTypeSelectorComponent {
	@Input() metric: string

	getAttributeTypeOfNodesByMetric$: Observable<(metricName: string) => AttributeTypeValue>

	constructor(@Inject(Store) private store: Store) {
		this.getAttributeTypeOfNodesByMetric$ = this.store.select(getAttributeTypeOfNodesByMetricSelector)
	}

	setToAbsolute() {
		this.setAttributeType(AttributeTypeValue.absolute)
	}

	setToRelative() {
		this.setAttributeType(AttributeTypeValue.relative)
	}

	private setAttributeType(type: AttributeTypeValue) {
		this.store.dispatch(updateAttributeType("nodes", this.metric, type))
	}
}
