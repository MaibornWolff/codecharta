import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, SortingOption } from "../../../codeCharta.model"
import { sortingOrderSelector } from "../../../preferences/preferences.facade"
import { setSortingOption } from "../../../preferences/preferences.facade"

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
