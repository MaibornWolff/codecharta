import { Component, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { combineLatest, map } from "rxjs"
import { CcState, CodeMapNode, Node } from "../../../codeCharta.model"
import { isEdgeMetricVisibleSelector } from "../../../state/store/appSettings/isEdgeMetricVisible/isEdgeMetricVisible.selector"
import { setEdgeMetric } from "../../../state/store/dynamicSettings/edgeMetric/edgeMetric.actions"
import { edgeMetricSelector } from "../../../state/store/dynamicSettings/edgeMetric/edgeMetric.selector"
import { NodeSelectionService } from "../../metricChooser/nodeSelection.service"

@Component({
	selector: "cc-edge-metric-chooser",
	templateUrl: "./edgeMetricChooser.component.html",
	styleUrls: ["./edgeMetricChooser.component.scss"],
	encapsulation: ViewEncapsulation.None
})
export class EdgeMetricChooserComponent {
	edgeValue$ = this.createEdgeValue()
	edgeMetric$ = this.store.select(edgeMetricSelector)
	isEdgeMetricVisible$ = this.store.select(isEdgeMetricVisibleSelector)

	constructor(private store: Store<CcState>, private nodeSelectionService: NodeSelectionService) {}

	handleEdgeMetricChanged(value: string) {
		this.store.dispatch(setEdgeMetric({ value }))
	}

	private createEdgeValue() {
		return combineLatest([this.store.select(edgeMetricSelector), this.nodeSelectionService.createNodeObservable()]).pipe(
			map(([edgeMetric, node]) => {
				return this.formatHoveredEdgeValue(edgeMetric, node)
			})
		)
	}

	private formatHoveredEdgeValue = (edgeMetric: string, node: CodeMapNode | Node) => {
		if (!node) {
			return null
		}

		const edgeValues = node.edgeAttributes[edgeMetric]
		if (!edgeValues) {
			return null
		}

		return `${this.formatValue(edgeValues.incoming)} / ${this.formatValue(edgeValues.outgoing)}`
	}

	private formatValue = (x?: number) => (typeof x === "number" ? x.toLocaleString() : "-")
}
