import { Component, Input, ViewEncapsulation } from "@angular/core"
import { Observable } from "rxjs"
import { CodeMapNode, PrimaryMetrics } from "../../../codeCharta.model"
import { Store } from "../../../state/angular-redux/store"
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

	constructor(store: Store) {
		this.primaryMetricNames$ = store.select(primaryMetricNamesSelector)
		this.hoveredNode$ = store.select(hoveredNodeSelector)
	}
}
