import { Component, Inject, OnInit, ViewEncapsulation } from "@angular/core"
import { Observable } from "rxjs"

import { Store } from "../../../state/angular-redux/store"
import { toggleSortingOrderAscending } from "../../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.actions"
import { sortingOrderAscendingSelector } from "../../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.selector"

@Component({
	selector: "cc-sorting-button",
	templateUrl: "./sortingButton.component.html",
	encapsulation: ViewEncapsulation.None
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
