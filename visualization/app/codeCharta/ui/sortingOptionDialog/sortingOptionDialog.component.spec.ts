import "./sortingOptionDialog.module"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { SortingOptionDialogController } from "./sortingOptionDialog.component"
import { IRootScopeService } from "angular"
import { SortingDialogOptionService } from "../../state/store/dynamicSettings/sortingDialogOption/sortingDialogOption.service"
import { StoreService } from "../../state/store.service"
import { SortingOption } from "../../codeCharta.model"

describe("SortingOptionDialogController", () => {
	let sortingOptionDialogController: SortingOptionDialogController
	let $rootScope: IRootScopeService
	let storeService = getService<StoreService>("storeService")

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.sortingOptionDialog")
		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildController() {
		sortingOptionDialogController = new SortingOptionDialogController($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to SortingDialogOptionService", () => {
			SortingDialogOptionService.subscribe = jest.fn()

			rebuildController()

			expect(SortingDialogOptionService.subscribe).toHaveBeenCalledWith($rootScope, sortingOptionDialogController)
		})
	})

	describe("onSortingDialogOptionChanged", () => {
		it("should change the state of sortingOptionDialog to Childnodes", () => {
			let sortingDialogOption = SortingOption.Childnodes
			sortingOptionDialogController.onSortingDialogOptionChanged(sortingDialogOption)
			expect(sortingOptionDialogController["_viewModel"].sortingOption).toEqual(SortingOption.Childnodes)
		})
		it("should update the sortingOptionDialog state to Name", () => {
			let sortingDialogOption = SortingOption.Name
			sortingOptionDialogController.onSortingDialogOptionChanged(sortingDialogOption)
			expect(sortingOptionDialogController["_viewModel"].sortingOption).toEqual(SortingOption.Name)
		})
	})

	describe("enumToString", () => {
		it("should return an array of keys in the same order", () => {
			let keys = sortingOptionDialogController.enumToString()
			expect(keys).toEqual(Object.keys(SortingOption))
		})
	})

	describe("onChange", () => {
		it("should set sortingOption in settings", () => {
			sortingOptionDialogController["_viewModel"].sortingOption = SortingOption.Childnodes
			sortingOptionDialogController["onChange"]()
			expect(storeService.getState().dynamicSettings.sortingDialogOption).toBe(
				sortingOptionDialogController["_viewModel"].sortingOption
			)
		})
	})
})
