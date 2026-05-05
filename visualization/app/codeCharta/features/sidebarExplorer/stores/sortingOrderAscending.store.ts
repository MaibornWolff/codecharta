import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { sortingOrderAscendingSelector } from "../../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.selector"
import { toggleSortingOrderAscending } from "../../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.actions"

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
