import { Component, Inject, OnInit } from "@angular/core"
import { Observable } from "rxjs"

import { Store } from "../../../state/angular-redux/store"
import { toggleSortingOrderAscending } from "../../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.actions"
import { sortingOrderAscendingSelector } from "../../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.selector"

@Component({
	selector: "cc-sorting-button",
	template: require("./sortingButton.component.html")
})
export class SortingButtonComponent implements OnInit {
	sortingOrderAscending$: Observable<boolean>

	constructor(@Inject(Store) private store: Store) {}

	ngOnInit(): void {
		this.sortingOrderAscending$ = this.store.select(sortingOrderAscendingSelector)
	}

	onClick() {
		this.store.dispatch(toggleSortingOrderAscending())
	}
}
