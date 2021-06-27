import "./sortingButton.component.scss"

import ngRedux from "ng-redux"

import { setSortingOrderAscending } from "../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.actions"
import { CcState } from "../../state/store/store"

export class SortingButtonController {
	_viewModel: { orderAscending: boolean }
	private setSortingOrderAscending: typeof setSortingOrderAscending
	private unsubscribeFromNgRedux: () => void

	constructor($ngRedux: ngRedux.INgRedux) {
		"ngInject"
		this.unsubscribeFromNgRedux = $ngRedux.connect(this.mapStateToThis, { setSortingOrderAscending })(this)
	}

	$onDestroy() {
		this.unsubscribeFromNgRedux()
	}

	private mapStateToThis(state: CcState) {
		return {
			_viewModel: { orderAscending: state.appSettings.sortingOrderAscending }
		}
	}

	onButtonClick() {
		this.setSortingOrderAscending(!this._viewModel.orderAscending)
	}
}

export const sortingButtonComponent = {
	selector: "sortingButtonComponent",
	template: require("./sortingButton.component.html"),
	controller: SortingButtonController
}
