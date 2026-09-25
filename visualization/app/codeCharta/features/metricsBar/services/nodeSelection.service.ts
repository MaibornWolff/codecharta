import { Injectable } from "@angular/core"
import { combineLatest, map, Observable, shareReplay } from "rxjs"
import { CodeMapNode } from "../../../model/codeCharta.model"
import { MetricsBarReadStore } from "../stores/metricsBar.read.store"

@Injectable({ providedIn: "root" })
export class NodeSelectionService {
    private readonly node$: Observable<CodeMapNode | undefined>

    constructor(private readonly metricsBarReadStore: MetricsBarReadStore) {
        this.node$ = combineLatest([
            this.metricsBarReadStore.hoveredNode$,
            this.metricsBarReadStore.selectedNode$,
            this.metricsBarReadStore.topLevelNode$
        ]).pipe(
            map(([hoveredNode, selectedNode, topLevelNode]) => hoveredNode ?? selectedNode ?? topLevelNode),
            shareReplay({ bufferSize: 1, refCount: true })
        )
    }

    createNodeObservable(): Observable<CodeMapNode | undefined> {
        return this.node$
    }
}
