import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, SortingOption } from "../../../codeCharta.model"
import { sortingOrderSelector } from "../../../state/store/dynamicSettings/sortingOption/sortingOrder.selector"
import { setSortingOption } from "../../../state/store/dynamicSettings/sortingOption/sortingOption.actions"

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
