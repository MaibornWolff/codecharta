import { Injectable, inject } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"
import { createWordOccurrencesSelector, projectWordsSelector, WordOccurrenceNode } from "../../../lenses/domain/domainLens.facade"
import { CcState, DomainWord } from "../../../model/codeCharta.model"

@Injectable({ providedIn: "root" })
export class DomainWordOccurrencesReadStore {
    private readonly store: Store<CcState> = inject(Store)

    readonly projectWords$: Observable<DomainWord[]> = this.store.select(projectWordsSelector)

    occurrencesOf(word: string, scopePath: string | null): Observable<WordOccurrenceNode | null> {
        return this.store.select(createWordOccurrencesSelector(scopePath, word))
    }
}
