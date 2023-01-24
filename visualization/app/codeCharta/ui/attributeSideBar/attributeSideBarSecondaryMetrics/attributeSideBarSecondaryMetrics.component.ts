import { Component, ViewEncapsulation } from "@angular/core"
import { Observable } from "rxjs"

import { Store } from "../../../state/angular-redux/store"
import { Metric } from "../util/metric"
import { showAttributeTypeSelectorSelector } from "../util/showAttributeTypeSelector.selector"
import { showDeltaValueSelector } from "../util/showDeltaValueSelector"
import { secondaryMetricsSelector } from "./secondaryMetrics.selector"

@Component({
	selector: "cc-attribute-side-bar-secondary-metrics",
	templateUrl: "./attributeSideBarSecondaryMetrics.component.html",
	encapsulation: ViewEncapsulation.None
})
export class AttributeSideBarSecondaryMetricsComponent {
	secondaryMetrics$: Observable<Metric[]>
	showAttributeTypeSelector$: Observable<boolean>
	showDeltaValue$: Observable<boolean>

	constructor(store: Store) {
		this.secondaryMetrics$ = store.select(secondaryMetricsSelector)
		this.showAttributeTypeSelector$ = store.select(showAttributeTypeSelectorSelector)
		this.showDeltaValue$ = store.select(showDeltaValueSelector)
	}
}
