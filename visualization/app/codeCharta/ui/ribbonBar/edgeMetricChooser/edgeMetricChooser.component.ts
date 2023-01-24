import { Component, ViewEncapsulation } from "@angular/core"
import { Store } from "../../../state/angular-redux/store"
import { isEdgeMetricVisibleSelector } from "../../../state/store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.selector"
import { setEdgeMetric } from "../../../state/store/dynamicSettings/edgeMetric/edgeMetric.actions"
import { edgeMetricSelector } from "../../../state/store/dynamicSettings/edgeMetric/edgeMetric.selector"
import { hoveredEdgeValueSelector } from "./hoveredEdgeValue.selector"

@Component({
	selector: "cc-edge-metric-chooser",
	templateUrl: "./edgeMetricChooser.component.html",
	styleUrls: ["./edgeMetricChooser.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class EdgeMetricChooserComponent {
	edgeMetric$ = this.store.select(edgeMetricSelector)
	hoveredEdgeValue$ = this.store.select(hoveredEdgeValueSelector)
	isEdgeMetricVisible$ = this.store.select(isEdgeMetricVisibleSelector)

	constructor(private store: Store) {}

	handleEdgeMetricChanged(value: string) {
		this.store.dispatch(setEdgeMetric(value))
	}
}
