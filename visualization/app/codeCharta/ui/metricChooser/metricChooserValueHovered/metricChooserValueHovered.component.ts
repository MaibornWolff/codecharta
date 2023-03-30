import { Component, Input, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"
import { CodeMapNode, PrimaryMetrics, State } from "../../../codeCharta.model"
import { hoveredNodeSelector } from "../../../state/selectors/hoveredNode.selector"
import { primaryMetricNamesSelector } from "../../../state/selectors/primaryMetrics/primaryMetricNames.selector"

@Component({
	selector: "cc-metric-chooser-value-hovered",
	templateUrl: "./metricChooserValueHovered.component.html",
	encapsulation: ViewEncapsulation.None
})
export class MetricChooserValueHoveredComponent {
	@Input() metricFor: keyof PrimaryMetrics

	hoveredNode$: Observable<CodeMapNode | undefined>
	primaryMetricNames$: Observable<PrimaryMetrics>

	constructor(store: Store<State>) {
		this.primaryMetricNames$ = store.select(primaryMetricNamesSelector)
		this.hoveredNode$ = store.select(hoveredNodeSelector)
	}
}
