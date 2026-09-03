import { Injectable, inject } from "@angular/core"
import { createSelector, Store } from "@ngrx/store"
import { Observable } from "rxjs"
import { createWordsForSelectedNodeSelector } from "../../../lenses/domain/domainLens.facade"
import { CcState, DomainWord } from "../../../model/codeCharta.model"
import { domainStateHiddenWordsSelector } from "../../../stores/domainState/domainState.read.facade"
import { fileRoot } from "../../../util/fileRoot"
import { withoutHiddenWords } from "../../../util/hiddenWords"
import { pathToNodeName } from "../../../util/nodePathHelper"

@Injectable({ providedIn: "root" })
export class WordCloudReadStore {
    private readonly store: Store<CcState> = inject(Store)

    wordsForSelectedNode(selectedNodePath: string | null): Observable<DomainWord[]> {
        return this.store.select(
            createSelector(createWordsForSelectedNodeSelector(selectedNodePath), domainStateHiddenWordsSelector, withoutHiddenWords)
        )
    }

    selectedNodeName(selectedNodePath: string | null): string {
        return pathToNodeName(selectedNodePath, fileRoot.rootName)
    }
}
