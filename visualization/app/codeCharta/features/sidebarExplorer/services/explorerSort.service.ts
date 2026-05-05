import { Injectable } from "@angular/core"
import { combineLatest } from "rxjs"
import { SortingOption } from "../../../codeCharta.model"
import { SortingOptionStore } from "../stores/sortingOption.store"
import { SortingOrderAscendingStore } from "../stores/sortingOrderAscending.store"

@Injectable({
    providedIn: "root"
})
export class ExplorerSortService {
    constructor(
        private readonly sortingOptionStore: SortingOptionStore,
        private readonly sortingOrderAscendingStore: SortingOrderAscendingStore
    ) {}

    sortState$ = combineLatest([this.sortingOptionStore.sortingOption$, this.sortingOrderAscendingStore.sortingOrderAscending$])

    setSortingOption(value: SortingOption) {
        this.sortingOptionStore.setSortingOption(value)
    }

    toggleSortingOrderAscending() {
        this.sortingOrderAscendingStore.toggle()
    }
}
