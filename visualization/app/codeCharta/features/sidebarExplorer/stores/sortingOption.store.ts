import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, SortingOption } from "../../../model/codeCharta.model"
import { sortingOrderSelector } from "../../../stores/preferences/preferences.read.facade"
import { setSortingOption } from "../../../stores/preferences/preferences.write.facade"

@Injectable({
    providedIn: "root"
})
export class SortingOptionStore {
    constructor(private readonly store: Store<CcState>) {}

    sortingOption$ = this.store.select(sortingOrderSelector)

    setSortingOption(value: SortingOption) {
        this.store.dispatch(setSortingOption({ value }))
    }
}
