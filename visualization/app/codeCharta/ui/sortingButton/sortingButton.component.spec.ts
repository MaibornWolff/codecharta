import ngRedux from "ng-redux"

import "./sortingButton.module"
import { SortingButtonController } from "./sortingButton.component"
import { instantiateModuleWithNgRedux } from "../../../../mocks/ng.mockhelper"
import { CcState } from "../../state/store/store"

describe("SortingButtonController", () => {
	let sortingButtonController: SortingButtonController
	let $ngRedux: ngRedux.INgRedux

	beforeEach(() => {
		$ngRedux = instantiateModuleWithNgRedux("app.codeCharta.ui.sortingButton")
		sortingButtonController = new SortingButtonController($ngRedux)
	})

	describe("onButtonClick", () => {
		it("should toggle sortingOrderAscending", () => {
			expect($ngRedux.getState<CcState>().appSettings.sortingOrderAscending).toBe(false)
			expect(sortingButtonController["_viewModel"].orderAscending).toBe(false)

			sortingButtonController.onButtonClick()

			expect($ngRedux.getState<CcState>().appSettings.sortingOrderAscending).toBe(true)
			expect(sortingButtonController["_viewModel"].orderAscending).toBe(true)
		})
	})
})
