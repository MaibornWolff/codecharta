import { Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { domainStateHiddenWordsSelector } from "../../../stores/domainState/domainState.read.facade"

@Injectable({ providedIn: "root" })
export class HiddenWordsReadStore {
    private readonly store: Store<CcState> = inject(Store)

    readonly hiddenWords = toSignal(this.store.select(domainStateHiddenWordsSelector), { initialValue: [] as string[] })
}
