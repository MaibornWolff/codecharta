import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable, combineLatest, filter, map, shareReplay } from "rxjs"
import { CcState, CodeMapNode, Node } from "../../../codeCharta.model"
import { AccumulatedData, accumulatedDataSelector } from "../../../state/selectors/accumulatedData/accumulatedData.selector"
import { hoveredNodeSelector } from "../../../state/selectors/hoveredNode.selector"
import { dynamicSettingsSelector } from "../../../state/store/dynamicSettings/dynamicSettings.selector"
import { CodeMapRenderService } from "../../../ui/codeMap/codeMap.render.service"
import { selectedNodeSelector } from "../../../state/selectors/selectedNode.selector"

@Injectable({ providedIn: "root" })
export class NodeSelectionService {
    private readonly node$: Observable<CodeMapNode | Node | undefined>

    constructor(
        private store: Store<CcState>,
        private codeMapRenderService: CodeMapRenderService
    ) {
        const hoveredNode$ = this.store.select(hoveredNodeSelector)
        const selectedNode$ = this.store.select(selectedNodeSelector)
        const topLevelNode$ = this.createTopLevelNodeObservable()

        this.node$ = combineLatest([hoveredNode$, selectedNode$, topLevelNode$]).pipe(
            map(([hoveredNode, selectedNode, topLevelNode]) => hoveredNode ?? selectedNode ?? topLevelNode),
            shareReplay({ bufferSize: 1, refCount: true })
        )
    }

    createNodeObservable(): Observable<CodeMapNode | Node | undefined> {
        return this.node$
    }

    private createTopLevelNodeObservable(): Observable<Node | undefined> {
        return combineLatest([this.store.select(accumulatedDataSelector), this.store.select(dynamicSettingsSelector)]).pipe(
            filter(([accumulatedData]) => Boolean(accumulatedData.unifiedMapNode)),
            map(([accumulatedData]) => this.findTopLevelNode(accumulatedData))
        )
    }

    private findTopLevelNode(accumulatedData: AccumulatedData): Node | undefined {
        const nodes = this.codeMapRenderService.getNodes(accumulatedData.unifiedMapNode)
        const visibleSortedNodes = this.codeMapRenderService.sortVisibleNodesByHeightDescending(nodes)
        if (visibleSortedNodes.length === 0) {
            return undefined
        }
        return visibleSortedNodes.reduce(
            (previous, current) => (previous.attributes.unary > current.attributes.unary ? previous : current),
            visibleSortedNodes[0]
        )
    }
}
