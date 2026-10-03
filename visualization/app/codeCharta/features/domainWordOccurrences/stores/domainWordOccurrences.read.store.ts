import { Injectable, inject } from "@angular/core"
import { createSelector, Store } from "@ngrx/store"
import { Observable, switchMap } from "rxjs"
import { createWordOccurrencesSelector, domainWordIndexSelector, WordOccurrenceNode } from "../../../lenses/domain/domainLens.facade"
import { CcState, DomainWord } from "../../../model/codeCharta.model"
import { domainStateHiddenWordsSelector } from "../../../stores/domainState/domainState.read.facade"
import { currentFocusedNodePathSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { fileRoot } from "../../../util/fileRoot"
import { withoutHiddenWords } from "../../../util/hiddenWords"

const wordsInFocusSelector = createSelector(domainWordIndexSelector, currentFocusedNodePathSelector, (index, focusedNodePath) =>
    index.wordsOf(focusedNodePath ?? fileRoot.rootPath)
)

const isFolderFocusedSelector = createSelector(currentFocusedNodePathSelector, focusedNodePath => focusedNodePath !== undefined)

const visibleWordsInFocusSelector = createSelector(wordsInFocusSelector, domainStateHiddenWordsSelector, withoutHiddenWords)

@Injectable({ providedIn: "root" })
export class DomainWordOccurrencesReadStore {
    private readonly store: Store<CcState> = inject(Store)

    /** The words of the focused folder, or of the whole project while nothing is focused. */
    readonly wordsInFocus$: Observable<DomainWord[]> = this.store.select(visibleWordsInFocusSelector)

    readonly isFolderFocused$: Observable<boolean> = this.store.select(isFolderFocusedSelector)

    occurrencesInFocusOf(word: string): Observable<WordOccurrenceNode | null> {
        return this.store
            .select(currentFocusedNodePathSelector)
            .pipe(switchMap(focusedNodePath => this.store.select(createWordOccurrencesSelector(focusedNodePath ?? null, word))))
    }
}
