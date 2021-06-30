import { NgRedux } from "@angular-redux/store"
import { Component, Inject, OnDestroy } from "@angular/core"

import { setSortingOrderAscending } from "../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.actions"
import { sortingOrderAscendingSelector } from "../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.selector"
import { CcReduxStore } from "../../state/store/store"

// Todo: Write mixin for connecting to redux with less boiler code:
// - automatic unsubscribe
// - create strong typed properties
// - map dispatch
@Component({
	selector: "cc-sorting-button",
	template: require("./sortingButton.component.html")
})
export class SortingButtonComponent implements OnDestroy {
	private orderAscending: boolean
	private unsubscribe: () => void

	constructor(@Inject(NgRedux) private ngRedux: CcReduxStore) {
		const subscription = this.ngRedux.select(sortingOrderAscendingSelector).subscribe(value => {
			this.orderAscending = value
		})
		this.unsubscribe = subscription.unsubscribe
	}

	ngOnDestroy() {
		this.unsubscribe()
	}

	onButtonClick() {
		this.ngRedux.dispatch(setSortingOrderAscending(!this.orderAscending))
	}
}
