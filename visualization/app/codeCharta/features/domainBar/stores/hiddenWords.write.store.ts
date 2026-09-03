import { Injectable, inject } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { hideDomainWord, restoreAllDomainWords, restoreDomainWord } from "../../../stores/domainState/domainState.write.facade"

@Injectable({ providedIn: "root" })
export class HiddenWordsWriteStore {
    private readonly store: Store<CcState> = inject(Store)

    hide(word: string) {
        this.store.dispatch(hideDomainWord({ word }))
    }

    restore(word: string) {
        this.store.dispatch(restoreDomainWord({ word }))
    }

    restoreAll() {
        this.store.dispatch(restoreAllDomainWords())
    }
}
