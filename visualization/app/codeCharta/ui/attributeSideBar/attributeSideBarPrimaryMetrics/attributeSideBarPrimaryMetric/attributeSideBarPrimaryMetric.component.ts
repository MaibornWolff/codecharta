import { Component, Input, ViewEncapsulation } from "@angular/core"
import { Observable } from "rxjs"
import { Store } from "../../../../state/angular-redux/store"

import { Metric } from "../../util/metric"
import { showAttributeTypeSelectorSelector } from "../../util/showAttributeTypeSelector.selector"

@Component({
	selector: "cc-attribute-side-bar-primary-metric",
	templateUrl: "./attributeSideBarPrimaryMetric.component.html",
	encapsulation: ViewEncapsulation.None
})
export class AttributeSideBarPrimaryMetricComponent {
	@Input() iconName: string
	@Input() metric: Metric
	showAttributeTypeSelector$: Observable<boolean>

	constructor(store: Store) {
		this.showAttributeTypeSelector$ = store.select(showAttributeTypeSelectorSelector)
	}
}
