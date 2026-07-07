import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { isDeltaStateSelector } from "../../../stores/fileStore/store/isDeltaState.selector"

@Injectable({
    providedIn: "root"
})
export class IsDeltaStateStore {
    constructor(private readonly store: Store<CcState>) {}

    isDeltaState$ = this.store.select(isDeltaStateSelector)
}
