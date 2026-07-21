import { Injectable, inject } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"
import { createWordsForSelectedNodeSelector } from "../../../lenses/domain/domainLens.facade"
import { CcState, DomainWord } from "../../../model/codeCharta.model"
import { fileRoot } from "../../../util/fileRoot"
import { pathToNodeName } from "../../../util/nodePathHelper"

/**
 * The read surface the word-cloud renderer composes from: the domain words of a selected node, keyed by
 * path. The path is a PARAMETER, supplied by the composing domain view (which owns the selection in its own
 * ephemeral store) — the renderer never reads view state, keeping the `renderer → views` layering downward
 * only. The root fallback for a null path lives in the lens.
 */
@Injectable({ providedIn: "root" })
export class WordCloudReadStore {
    private readonly store: Store<CcState> = inject(Store)

    wordsForSelectedNode(selectedNodePath: string | null): Observable<DomainWord[]> {
        return this.store.select(createWordsForSelectedNodeSelector(selectedNodePath))
    }

    /** The selected node's display name, so the renderer can name the selection in its empty state. */
    selectedNodeName(selectedNodePath: string | null): string {
        return pathToNodeName(selectedNodePath, fileRoot.rootName)
    }
}
