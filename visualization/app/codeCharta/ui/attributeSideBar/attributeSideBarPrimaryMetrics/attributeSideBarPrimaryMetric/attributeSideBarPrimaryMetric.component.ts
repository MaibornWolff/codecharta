import { Component, Inject, Input } from "@angular/core"
import { Observable } from "rxjs"
import { Store } from "../../../../state/angular-redux/store"

import { Metric } from "../../util/metric"
import { showAttributeTypeSelectorSelector } from "../../util/showAttributeTypeSelector.selector"

@Component({
	selector: "cc-attribute-side-bar-primary-metric",
	template: require("./attributeSideBarPrimaryMetric.component.html")
})
export class AttributeSideBarPrimaryMetricComponent {
	@Input() iconName: string
	@Input() metric: Metric
	showAttributeTypeSelector$: Observable<boolean>

	constructor(@Inject(Store) store: Store) {
		this.showAttributeTypeSelector$ = store.select(showAttributeTypeSelectorSelector)
	}
}
