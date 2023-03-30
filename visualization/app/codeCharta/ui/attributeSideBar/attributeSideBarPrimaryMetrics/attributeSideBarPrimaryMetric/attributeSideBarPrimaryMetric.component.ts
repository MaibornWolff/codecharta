import { Component, Input, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"
import { State } from "../../../../codeCharta.model"

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

	constructor(store: Store<State>) {
		this.showAttributeTypeSelector$ = store.select(showAttributeTypeSelectorSelector)
	}
}
