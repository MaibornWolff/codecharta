import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { isDeltaStateSelector } from "../../../fileStore/store/isDeltaState.selector"

@Injectable({
    providedIn: "root"
})
export class LegendIsDeltaStateStore {
    constructor(private readonly store: Store<CcState>) {}

    isDeltaState$ = this.store.select(isDeltaStateSelector)
}
