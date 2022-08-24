import "./edgeMetricToggle.component.scss"
import { Component, Inject, OnInit } from "@angular/core"
import { Store } from "../../../../state/angular-redux/store"
import { Observable } from "rxjs"
import { isEdgeMetricVisibleSelector } from "../../../../state/store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.selector"
import { toggleEdgeMetricVisible } from "../../../../state/store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.actions"

@Component({
	selector: "cc-edge-metric-toggle",
	template: require("./edgeMetricToggle.component.html")
})
export class EdgeMetricToggleComponent implements OnInit {
	isEdgeMetricVisible$: Observable<boolean>

	constructor(@Inject(Store) private store: Store) {}

	ngOnInit(): void {
		this.isEdgeMetricVisible$ = this.store.select(isEdgeMetricVisibleSelector)
	}

	toggleEdgeMetric() {
		this.store.dispatch(toggleEdgeMetricVisible())
	}
}
