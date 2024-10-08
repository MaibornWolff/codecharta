import { Component } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"

import { CcState, SortingOption } from "../../../../codeCharta.model"
import { setSortingOption } from "../../../../state/store/dynamicSettings/sortingOption/sortingOption.actions"
import { sortingOrderSelector } from "../../../../state/store/dynamicSettings/sortingOption/sortingOrder.selector"

@Component({
    selector: "cc-sorting-option",
    templateUrl: "./sortingOption.component.html",
    styleUrls: ["./sortingOption.component.scss"]
})
export class SortingOptionComponent {
    sortingOptions = Object.values(SortingOption)
    selectedSortingOption$: Observable<SortingOption>

    constructor(private store: Store<CcState>) {
        this.selectedSortingOption$ = store.select(sortingOrderSelector)
    }

    handleSelectedSortingOptionChanged(event) {
        this.store.dispatch(setSortingOption(event.value))
    }
}
