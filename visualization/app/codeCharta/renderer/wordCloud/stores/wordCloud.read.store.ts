import { Injectable, inject } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"
import { createWordsForSelectedNodeSelector } from "../../../lenses/domain/domainLens.facade"
import { CcState, DomainWord } from "../../../model/codeCharta.model"
import { fileRoot } from "../../../util/fileRoot"
import { pathToNodeName } from "../../../util/nodePathHelper"

@Injectable({ providedIn: "root" })
export class WordCloudReadStore {
    private readonly store: Store<CcState> = inject(Store)

    wordsForSelectedNode(selectedNodePath: string | null): Observable<DomainWord[]> {
        return this.store.select(createWordsForSelectedNodeSelector(selectedNodePath))
    }

    selectedNodeName(selectedNodePath: string | null): string {
        return pathToNodeName(selectedNodePath, fileRoot.rootName)
    }
}
