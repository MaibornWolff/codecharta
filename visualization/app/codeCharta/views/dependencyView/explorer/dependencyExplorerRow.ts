import { Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { DependencyMapViewStore } from "../../../features/dependencyMap/facade"
import { ExplorerRow } from "../../../features/sidebarExplorer/facade"
import { pathsWithDependencyLevelsSelector } from "../../../lenses/dependency/dependencyLens.facade"
import { ExplorerRowProjection, projectExplorerRow } from "../../../lenses/explorerRow/explorerRowLens.facade"
import { CodeMapNode } from "../../../model/codeCharta.model"

@Injectable()
export class DependencyExplorerRow implements ExplorerRow {
    private readonly store = inject(Store)
    private readonly viewStore = inject(DependencyMapViewStore)

    private readonly pathsWithDependencyLevels = toSignal(this.store.select(pathsWithDependencyLevelsSelector), { requireSync: true })

    project(node: CodeMapNode): ExplorerRowProjection {
        return projectExplorerRow(node, {
            pathsWithDependencyLevels: this.pathsWithDependencyLevels(),
            isHiddenFromDependencyGraph: path => this.viewStore.isHidden(path),
            hidesExcludedNodes: true
        })
    }
}
