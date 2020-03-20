import "./sortingButton.module"
import { SortingButtonController } from "./sortingButton.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { SortingOrderAscendingService } from "../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.service"

describe("SortingButtonController", () => {
	let sortingButtonController: SortingButtonController
	let $rootScope: IRootScopeService
	let storeService: StoreService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.sortingButton")
		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildController() {
		sortingButtonController = new SortingButtonController($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to SortingOrderAscendingService", () => {
			SortingOrderAscendingService.subscribe = jest.fn()
			rebuildController()
			expect(SortingOrderAscendingService.subscribe).toHaveBeenCalledWith($rootScope, sortingButtonController)
		})
	})

	describe("onSortingOrderAscendingChanged", () => {
		it("should change the sortingOrderAscending value", () => {
			let sortingOrderAscendingValue = false
			sortingButtonController.onSortingOrderAscendingChanged(sortingOrderAscendingValue)
			expect(sortingButtonController["_viewModel"].orderAscending).toEqual(false)
		})
	})

	describe("onButtonClick", () => {
		it("should change sortingOrderAscending in service", () => {
			sortingButtonController["_viewModel"].orderAscending = false
			sortingButtonController["onButtonClick"]()
			expect(storeService.getState().appSettings.sortingOrderAscending).toBe(!sortingButtonController["_viewModel"].orderAscending)
		})
	})
})
