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

		it("should set the correct sorting options", () => {
			expect(sortingOptionDialogController["_viewModel"].sortingOptions).toEqual(["Name", "Number of Files"])
		})
	})

	describe("onSortingDialogOptionChanged", () => {
		it("should update the sortingOptionDialog to Number of Files", () => {
			sortingOptionDialogController.onSortingDialogOptionChanged(SortingOption.NUMBER_OF_FILES)

			expect(sortingOptionDialogController["_viewModel"].sortingOption).toEqual(SortingOption.NUMBER_OF_FILES)
		})
		it("should update the sortingOptionDialog to Name", () => {
			sortingOptionDialogController.onSortingDialogOptionChanged(SortingOption.NAME)

			expect(sortingOptionDialogController["_viewModel"].sortingOption).toEqual(SortingOption.NAME)
		})
	})

	describe("onChange", () => {
		it("should set sortingOption in settings", () => {
			sortingOptionDialogController["_viewModel"].sortingOption = SortingOption.NUMBER_OF_FILES

			sortingOptionDialogController.onChange()

			expect(storeService.getState().dynamicSettings.sortingDialogOption).toBe(
				sortingOptionDialogController["_viewModel"].sortingOption
			)
		})
	})
})
