import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { sortingOrderAscendingSelector } from "../../../preferences/preferences.facade"
import { toggleSortingOrderAscending } from "../../../preferences/preferences.facade"

@Injectable({
    providedIn: "root"
})
export class SortingOrderAscendingStore {
    constructor(private readonly store: Store<CcState>) {}

    sortingOrderAscending$ = this.store.select(sortingOrderAscendingSelector)

    toggle() {
        this.store.dispatch(toggleSortingOrderAscending())
    }
}
