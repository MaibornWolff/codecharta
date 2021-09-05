import { Component, Inject } from "@angular/core"
import { Observable } from "rxjs"

import { Store } from "../../state/angular-redux/store"
import { toggleSortingOrderAscending } from "../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.actions"
import { sortingOrderAscendingSelector } from "../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.selector"

@Component({
	selector: "cc-sorting-button",
	template: require("./sortingButton.component.html")
})
export class SortingButtonComponent {
	orderAscending$: Observable<boolean>

	constructor(@Inject(Store) private store: Store) {
		this.orderAscending$ = this.store.select(sortingOrderAscendingSelector)
	}

	onClick() {
		this.store.dispatch(toggleSortingOrderAscending())
	}
}
