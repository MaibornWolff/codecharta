import { Injectable } from "@angular/core"
import { Observable, combineLatest, filter, map, shareReplay } from "rxjs"
import { CodeMapNode, Node } from "../../../codeCharta.model"
import { AccumulatedData } from "../../../state/selectors/accumulatedData/accumulatedData.selector"
import { CodeMapRenderService } from "../../../ui/codeMap/codeMap.render.service"
import { NodeSelectionStore } from "../stores/nodeSelection.store"

@Injectable({ providedIn: "root" })
export class NodeSelectionService {
    private readonly node$: Observable<CodeMapNode | Node | undefined>

    constructor(
        private nodeSelectionStore: NodeSelectionStore,
        private codeMapRenderService: CodeMapRenderService
    ) {
        const hoveredNode$ = this.nodeSelectionStore.hoveredNode$
        const selectedNode$ = this.nodeSelectionStore.selectedNode$
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
        return combineLatest([this.nodeSelectionStore.accumulatedData$, this.nodeSelectionStore.dynamicSettings$]).pipe(
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
