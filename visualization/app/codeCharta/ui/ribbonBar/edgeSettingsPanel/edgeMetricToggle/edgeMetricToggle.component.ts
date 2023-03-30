import { Component, OnInit, ViewEncapsulation } from "@angular/core"
import { Observable } from "rxjs"
import { isEdgeMetricVisibleSelector } from "../../../../state/store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.selector"
import { toggleEdgeMetricVisible } from "../../../../state/store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.actions"
import { Store } from "@ngrx/store"
import { State } from "../../../../codeCharta.model"

@Component({
	selector: "cc-edge-metric-toggle",
	templateUrl: "./edgeMetricToggle.component.html",
	encapsulation: ViewEncapsulation.None
})
export class EdgeMetricToggleComponent implements OnInit {
	isEdgeMetricVisible$: Observable<boolean>

	constructor(private store: Store<State>) {}

	ngOnInit(): void {
		this.isEdgeMetricVisible$ = this.store.select(isEdgeMetricVisibleSelector)
	}

	toggleEdgeMetric() {
		this.store.dispatch(toggleEdgeMetricVisible())
	}
}
