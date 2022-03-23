import { Component, Inject } from "@angular/core"
import { Observable } from "rxjs"

import { SortingOption } from "../../../codeCharta.model"
import { setSortingOption } from "../../../state/store/dynamicSettings/sortingOption/sortingOption.actions"
import { Store } from "../../../state/angular-redux/store"
import { sortingOrderSelector } from "../../../state/store/dynamicSettings/sortingOption/sortingOrder.selector"

@Component({
	selector: "cc-sorting-option",
	template: require("./sortingOption.component.html")
})
export class SortingOptionComponent {
	sortingOptions = Object.values(SortingOption)
	selectedSortingOption$: Observable<SortingOption>

	constructor(@Inject(Store) private store: Store) {
		this.selectedSortingOption$ = store.select(sortingOrderSelector)
	}

	handleSelectedSortingOptionChanged(event) {
		this.store.dispatch(setSortingOption(event.value))
	}
}
