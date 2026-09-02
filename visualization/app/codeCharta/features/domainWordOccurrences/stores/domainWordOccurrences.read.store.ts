import { Injectable, inject } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"
import { createWordOccurrencesSelector, WordOccurrenceNode } from "../../../lenses/domain/domainLens.facade"
import { CcState } from "../../../model/codeCharta.model"

@Injectable({ providedIn: "root" })
export class DomainWordOccurrencesReadStore {
    private readonly store: Store<CcState> = inject(Store)

    occurrencesOf(word: string, scopePath: string | null): Observable<WordOccurrenceNode | null> {
        return this.store.select(createWordOccurrencesSelector(scopePath, word))
    }
}
