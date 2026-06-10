import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { isDeltaStateSelector } from "../../../state/selectors/isDeltaState.selector"

@Injectable({
    providedIn: "root"
})
export class IsDeltaStateStore {
    constructor(private readonly store: Store<CcState>) {}

    isDeltaState$ = this.store.select(isDeltaStateSelector)
}
