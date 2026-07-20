import { Injectable } from "@angular/core"
import { State, Store } from "@ngrx/store"
import { CcState, DomainLensData, DomainLensSource } from "../../../model/codeCharta.model"
import { domainWordsSelector } from "./words/words.selector"

@Injectable({
    providedIn: "root"
})
export class DomainLensSourceReadWindow {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    readonly domainWords$ = this.store.select(domainWordsSelector)

    getDomainLensSource(): DomainLensSource {
        return this.state.getValue().domainLensSource
    }

    getDomainWords(): DomainLensData {
        return this.state.getValue().domainLensSource.words
    }
}
