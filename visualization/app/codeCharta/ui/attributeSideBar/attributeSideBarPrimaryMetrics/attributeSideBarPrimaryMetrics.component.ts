import { Component, ViewEncapsulation } from "@angular/core"
import { Observable } from "rxjs"

import { showAttributeTypeSelectorSelector } from "../util/showAttributeTypeSelector.selector"
import { PrimaryMetrics, primaryMetricsSelector } from "../../../state/selectors/primaryMetrics/primaryMetrics.selector"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"

@Component({
	selector: "cc-attribute-side-bar-primary-metrics",
	templateUrl: "./attributeSideBarPrimaryMetrics.component.html",
	encapsulation: ViewEncapsulation.None
})
export class AttributeSideBarPrimaryMetricsComponent {
	primaryMetrics$: Observable<PrimaryMetrics>
	showAttributeTypeSelector$: Observable<boolean>
	attributeDescriptors$ = this.store.select(attributeDescriptorsSelector)

	constructor(private store: Store<CcState>) {
		this.primaryMetrics$ = store.select(primaryMetricsSelector)
		this.showAttributeTypeSelector$ = store.select(showAttributeTypeSelectorSelector)
	}
}
