import { Injectable, inject } from "@angular/core"
import { Store } from "@ngrx/store"
import { map, Observable, switchMap } from "rxjs"
import { createWordsForSelectedNodeSelector } from "../../../lenses/domain/domainLens.facade"
import { CcState, DomainWord } from "../../../model/codeCharta.model"
import { SharedViewReadWindow } from "../../../stores/sharedView/sharedView.read.facade"
import { fileRoot } from "../../../util/fileRoot"

/**
 * The read surface the word-cloud renderer composes from: the domain words of the currently selected
 * node. Selection lives in sharedView (a view-state home the lens must not read), so this composing
 * layer feeds `selectedBuildingId` into the lens's parameterized selector — the root fallback for a
 * null id lives in the lens.
 */
@Injectable({ providedIn: "root" })
export class WordCloudReadStore {
    private readonly store: Store<CcState> = inject(Store)
    private readonly sharedViewReadWindow = inject(SharedViewReadWindow)

    readonly wordsForSelectedNode$: Observable<DomainWord[]> = this.sharedViewReadWindow.selectedBuildingId$.pipe(
        switchMap(selectedBuildingId => this.store.select(createWordsForSelectedNodeSelector(selectedBuildingId)))
    )

    /** The selected node's display name, so the renderer can name the selection in its empty state. */
    readonly selectedNodeName$: Observable<string> = this.sharedViewReadWindow.selectedBuildingId$.pipe(
        map(selectedBuildingId => nodeNameOfPath(selectedBuildingId))
    )
}

function nodeNameOfPath(nodePath: string | null): string {
    if (nodePath === null) {
        return fileRoot.rootName
    }
    return nodePath.split("/").filter(Boolean).at(-1) ?? fileRoot.rootName
}
