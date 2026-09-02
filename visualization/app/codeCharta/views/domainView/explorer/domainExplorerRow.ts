import { Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { ExplorerRow } from "../../../features/sidebarExplorer/facade"
import { pathsWithDomainWordsSelector } from "../../../lenses/domain/domainLens.facade"
import { ExplorerRowProjection, projectExplorerRow } from "../../../lenses/explorerRow/explorerRowLens.facade"
import { CodeMapNode } from "../../../model/codeCharta.model"

@Injectable()
export class DomainExplorerRow implements ExplorerRow {
    private readonly store = inject(Store)

    private readonly pathsWithDomainWords = toSignal(this.store.select(pathsWithDomainWordsSelector), { requireSync: true })

    project(node: CodeMapNode): ExplorerRowProjection {
        return projectExplorerRow(node, { pathsWithDomainWords: this.pathsWithDomainWords() })
    }
}
