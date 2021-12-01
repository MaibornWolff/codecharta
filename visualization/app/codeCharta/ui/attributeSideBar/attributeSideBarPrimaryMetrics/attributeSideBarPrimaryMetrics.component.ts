import { Component, Inject } from "@angular/core"
import { Observable } from "rxjs"

import { Store } from "../../../state/angular-redux/store"
import { PrimaryMetrics, primaryMetricsSelector } from "./primaryMetrics.selector"

@Component({
	selector: "cc-attribute-side-bar-primary-metrics",
	template: require("./attributeSideBarPrimaryMetrics.component.html")
})
export class AttributeSideBarPrimaryMetricsComponent {
	primaryMetrics$: Observable<PrimaryMetrics>

	constructor(@Inject(Store) store: Store) {
		this.primaryMetrics$ = store.select(primaryMetricsSelector)
	}
}
