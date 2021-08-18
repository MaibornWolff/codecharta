import { Component } from "@angular/core"

import { connect } from "../../state/angular-redux/connect"
import { setSortingOrderAscending } from "../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.actions"
import { sortingOrderAscendingSelector } from "../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.selector"
import { CcState } from "../../state/store/store"

const ConnectedClass = connect((state: CcState) => ({ orderAscending: sortingOrderAscendingSelector(state) }), { setSortingOrderAscending })

@Component({
	selector: "cc-sorting-button",
	template: require("./sortingButton.component.html")
})
export class SortingButtonComponent extends ConnectedClass {
	onButtonClick() {
		this.setSortingOrderAscending(!this.orderAscending)
	}
}
