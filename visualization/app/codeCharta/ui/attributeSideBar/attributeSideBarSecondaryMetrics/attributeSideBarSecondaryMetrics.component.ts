import { Component, Inject } from "@angular/core"
import { Observable } from "rxjs"
import { Store } from "../../../state/angular-redux/store"
import { SecondaryMetric, secondaryMetricsSelector } from "./secondaryMetrics.selector"

@Component({
	selector: "cc-attribute-side-bar-secondary-metrics",
	template: require("./attributeSideBarSecondaryMetrics.component.html")
})
export class AttributeSideBarSecondaryMetricsComponent {
	secondaryMetrics$: Observable<SecondaryMetric[]>

	constructor(@Inject(Store) store: Store) {
		this.secondaryMetrics$ = store.select(secondaryMetricsSelector)
	}
}
