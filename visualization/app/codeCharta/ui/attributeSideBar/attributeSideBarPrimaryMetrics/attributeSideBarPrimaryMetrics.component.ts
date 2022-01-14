import { Component, Inject } from "@angular/core"
import { Observable } from "rxjs"

import { Store } from "../../../state/angular-redux/store"
import { showAttributeTypeSelectorSelector } from "../util/showAttributeTypeSelector.selector"
import { PrimaryMetrics, primaryMetricsSelector } from "./primaryMetrics.selector"

@Component({
	selector: "cc-attribute-side-bar-primary-metrics",
	template: require("./attributeSideBarPrimaryMetrics.component.html")
})
export class AttributeSideBarPrimaryMetricsComponent {
	primaryMetrics$: Observable<PrimaryMetrics>
	showAttributeTypeSelector$: Observable<boolean>

	constructor(@Inject(Store) store: Store) {
		this.primaryMetrics$ = store.select(primaryMetricsSelector)
		this.showAttributeTypeSelector$ = store.select(showAttributeTypeSelectorSelector)
	}
}
