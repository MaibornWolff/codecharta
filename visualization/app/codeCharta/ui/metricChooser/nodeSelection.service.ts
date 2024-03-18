import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable, combineLatest, filter, map } from "rxjs"
import { CcState, CodeMapNode, Node } from "../../codeCharta.model"
import { AccumulatedData, accumulatedDataSelector } from "../../state/selectors/accumulatedData/accumulatedData.selector"
import { hoveredNodeSelector } from "../../state/selectors/hoveredNode.selector"
import { dynamicSettingsSelector } from "../../state/store/dynamicSettings/dynamicSettings.selector"
import { CodeMapRenderService } from "../codeMap/codeMap.render.service"

@Injectable()
export class NodeSelectionService {
	constructor(private store: Store<CcState>, private codeMapRenderService: CodeMapRenderService) {}

	createNodeObservable(): Observable<CodeMapNode | Node> {
		const hoveredNode$ = this.store.select(hoveredNodeSelector)
		const topLevelNode$ = this.createTopLevelNodeObservable()

		return combineLatest([hoveredNode$, topLevelNode$]).pipe(map(([hoveredNode, topLevelNode]) => hoveredNode ?? topLevelNode))
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
}
