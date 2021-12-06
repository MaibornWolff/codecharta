import { Component, Inject } from "@angular/core"
import { Observable } from "rxjs"

import { Store } from "../../../state/angular-redux/store"
import { Metric } from "../util/metric"
import { showAttributeTypeSelectorSelector } from "../util/showAttributeTypeSelector.selector"
import { showDeltaValueSelector } from "../util/showDeltaValueSelector"
import { secondaryMetricsSelector } from "./secondaryMetrics.selector"

@Component({
	selector: "cc-attribute-side-bar-secondary-metrics",
	template: require("./attributeSideBarSecondaryMetrics.component.html")
})
export class AttributeSideBarSecondaryMetricsComponent {
	secondaryMetrics$: Observable<Metric[]>
	showAttributeTypeSelector$: Observable<boolean>
	showDeltaValue$: Observable<boolean>

	constructor(@Inject(Store) store: Store) {
		this.secondaryMetrics$ = store.select(secondaryMetricsSelector)
		this.showAttributeTypeSelector$ = store.select(showAttributeTypeSelectorSelector)
		this.showDeltaValue$ = store.select(showDeltaValueSelector)
	}
}
