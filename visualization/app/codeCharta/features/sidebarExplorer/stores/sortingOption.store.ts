import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, SortingOption } from "../../../codeCharta.model"
import { sortingOrderSelector } from "../../../preferences/preferences.read.facade"
import { setSortingOption } from "../../../preferences/preferences.write.facade"

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
