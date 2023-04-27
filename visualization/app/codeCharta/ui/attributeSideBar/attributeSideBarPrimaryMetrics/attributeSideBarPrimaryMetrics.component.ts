import { Component, ViewEncapsulation } from "@angular/core"
import { Observable } from "rxjs"

import { Store } from "../../../state/angular-redux/store"
import { showAttributeTypeSelectorSelector } from "../util/showAttributeTypeSelector.selector"
import { PrimaryMetrics, primaryMetricsSelector } from "../../../state/selectors/primaryMetrics/primaryMetrics.selector"
import { AttributeDescriptors } from "../../../codeCharta.model"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"

@Component({
	selector: "cc-attribute-side-bar-primary-metrics",
	templateUrl: "./attributeSideBarPrimaryMetrics.component.html",
	encapsulation: ViewEncapsulation.None
})
export class AttributeSideBarPrimaryMetricsComponent {
	primaryMetrics$: Observable<PrimaryMetrics>
	showAttributeTypeSelector$: Observable<boolean>
	attributeDescriptors: AttributeDescriptors

	constructor(store: Store) {
		this.primaryMetrics$ = store.select(primaryMetricsSelector)
		this.showAttributeTypeSelector$ = store.select(showAttributeTypeSelectorSelector)
		store.select(attributeDescriptorsSelector).subscribe(descriptors => (this.attributeDescriptors = descriptors))
	}
}
