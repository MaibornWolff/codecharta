import { Component, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"
import { State } from "../../../codeCharta.model"

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

	constructor(store: Store<State>) {
		this.secondaryMetrics$ = store.select(secondaryMetricsSelector)
		this.showAttributeTypeSelector$ = store.select(showAttributeTypeSelectorSelector)
		this.showDeltaValue$ = store.select(showDeltaValueSelector)
	}
}
