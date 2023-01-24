import { Component, ViewEncapsulation } from "@angular/core"
import { Observable } from "rxjs"

import { SortingOption } from "../../../codeCharta.model"
import { setSortingOption } from "../../../state/store/dynamicSettings/sortingOption/sortingOption.actions"
import { Store } from "../../../state/angular-redux/store"
import { sortingOrderSelector } from "../../../state/store/dynamicSettings/sortingOption/sortingOrder.selector"

@Component({
	selector: "cc-sorting-option",
	templateUrl: "./sortingOption.component.html",
	encapsulation: ViewEncapsulation.None
})
export class SortingOptionComponent {
	sortingOptions = Object.values(SortingOption)
	selectedSortingOption$: Observable<SortingOption>

	constructor(private store: Store) {
		this.selectedSortingOption$ = store.select(sortingOrderSelector)
	}

	handleSelectedSortingOptionChanged(event) {
		this.store.dispatch(setSortingOption(event.value))
	}
}
