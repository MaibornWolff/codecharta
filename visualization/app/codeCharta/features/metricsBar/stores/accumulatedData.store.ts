import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { accumulatedDataSelector } from "../../../state/selectors/accumulatedData/accumulatedData.selector"

@Injectable({
    providedIn: "root"
})
export class AccumulatedDataStore {
    constructor(private readonly store: Store<CcState>) {}

    accumulatedData$ = this.store.select(accumulatedDataSelector)
}
