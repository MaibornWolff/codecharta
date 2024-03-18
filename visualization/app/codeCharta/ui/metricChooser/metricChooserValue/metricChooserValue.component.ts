import { Component, Input, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable, combineLatest, filter, map } from "rxjs"
import { CcState, CodeMapNode, Node, PrimaryMetrics } from "../../../codeCharta.model"
import { AccumulatedData, accumulatedDataSelector } from "../../../state/selectors/accumulatedData/accumulatedData.selector"
import { hoveredNodeSelector } from "../../../state/selectors/hoveredNode.selector"
import { primaryMetricNamesSelector } from "../../../state/selectors/primaryMetrics/primaryMetricNames.selector"
import { dynamicSettingsSelector } from "../../../state/store/dynamicSettings/dynamicSettings.selector"
import { CodeMapRenderService } from "../../codeMap/codeMap.render.service"

@Component({
	selector: "cc-metric-chooser-value",
	templateUrl: "./metricChooserValue.component.html",
	encapsulation: ViewEncapsulation.None
})
export class MetricChooserValueComponent {
	@Input() metricFor: keyof PrimaryMetrics

	node$: Observable<CodeMapNode | Node>
	primaryMetricNames$: Observable<PrimaryMetrics>

	constructor(private store: Store<CcState>, private codeMapRenderService: CodeMapRenderService) {
		const hoveredNode$ = this.store.select(hoveredNodeSelector)
		const topLevelNode$ = this.createTopLevelNodeObservable()

		this.node$ = this.combineHoveredAndTopLevelNodes(hoveredNode$, topLevelNode$)
		this.primaryMetricNames$ = this.store.select(primaryMetricNamesSelector)
	}

	private createTopLevelNodeObservable(): Observable<Node> {
		return combineLatest([this.store.select(accumulatedDataSelector), this.store.select(dynamicSettingsSelector)]).pipe(
			filter(([accumulatedData]) => Boolean(accumulatedData.unifiedMapNode)),
			map(([accumulatedData]) => this.findTopLevelNode(accumulatedData))
		)
	}

	private findTopLevelNode(accumulatedData: AccumulatedData): Node {
		const nodes = this.codeMapRenderService.getNodes(accumulatedData.unifiedMapNode)
		const visibleSortedNodes = this.codeMapRenderService.getVisibleNodes(nodes)
		return visibleSortedNodes.reduce((previous, current) => (previous.attributes.unary > current.attributes.unary ? previous : current))
	}

	private combineHoveredAndTopLevelNodes(
		hoveredNode$: Observable<CodeMapNode>,
		topLevelNode$: Observable<Node>
	): Observable<CodeMapNode | Node> {
		return combineLatest([hoveredNode$, topLevelNode$]).pipe(map(([hoveredNode, topLevelNode]) => hoveredNode ?? topLevelNode))
	}
}
