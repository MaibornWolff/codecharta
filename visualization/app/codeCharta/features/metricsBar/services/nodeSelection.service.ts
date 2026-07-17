import { Injectable } from "@angular/core"
import { combineLatest, filter, map, Observable, shareReplay } from "rxjs"
import { CodeMapRenderService } from "../../../features/codeMap/facade"
import { CodeMapNode, Node } from "../../../model/codeCharta.model"
import { AccumulatedData } from "../../../renderer/renderModel/renderModel.facade"
import { MapStateReadWindow } from "../../../stores/mapState/mapState.read.facade"
import { MetricsBarReadStore } from "../stores/metricsBar.read.store"

@Injectable({ providedIn: "root" })
export class NodeSelectionService {
    private readonly node$: Observable<CodeMapNode | Node | undefined>

    constructor(
        private readonly metricsBarReadStore: MetricsBarReadStore,
        private readonly mapStateReadWindow: MapStateReadWindow,
        private readonly codeMapRenderService: CodeMapRenderService
    ) {
        const hoveredNode$ = this.metricsBarReadStore.hoveredNode$
        const selectedNode$ = this.metricsBarReadStore.selectedNode$
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
        // only the metrics that change the layout's visible node set matter here;
        // depending on the whole dynamicSettings slice would re-run the full layout
        // on every search keystroke or margin drag just for a fallback display value
        return combineLatest([
            this.metricsBarReadStore.accumulatedData$,
            this.mapStateReadWindow.areaMetric$,
            this.mapStateReadWindow.heightMetric$
        ]).pipe(
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
