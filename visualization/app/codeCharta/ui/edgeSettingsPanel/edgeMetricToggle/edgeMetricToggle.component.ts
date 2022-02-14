import "./edgeMetricToggle.component.scss"
import { Component, Inject, OnInit } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { Observable } from "rxjs"
import { toggleEdgeMetricSelector } from "../../../state/store/appSettings/toggleEdgeMetric/toggleEdgeMetric.selector"
import { toggleEdgeMetric } from "../../../state/store/appSettings/toggleEdgeMetric/toggleEdgeMetric.actions"

@Component({
	selector: "cc-edge-metric-toggle",
	template: require("./edgeMetricToggle.component.html")
})
export class EdgeMetricToggleComponent implements OnInit {
	isEdgeMetric$: Observable<boolean>

	constructor(@Inject(Store) private store: Store) {}

	ngOnInit(): void {
		this.isEdgeMetric$ = this.store.select(toggleEdgeMetricSelector)
	}

	toggleEdgeMetric() {
		this.store.dispatch(toggleEdgeMetric())
	}
}
