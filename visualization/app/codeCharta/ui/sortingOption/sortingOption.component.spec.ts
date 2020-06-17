import "./sortingOption.module"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { SortingOptionController } from "./sortingOption.component"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { SortingOption } from "../../codeCharta.model"
import { SortingOptionService } from "../../state/store/dynamicSettings/sortingOption/sortingOption.service"

describe("SortingOptionController", () => {
	let sortingOptionController: SortingOptionController
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
		sortingOptionController = new SortingOptionController($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to SortingOptionService", () => {
			SortingOptionService.subscribe = jest.fn()

			rebuildController()

			expect(SortingOptionService.subscribe).toHaveBeenCalledWith($rootScope, sortingOptionController)
		})

		it("should set the correct sorting options", () => {
			expect(sortingOptionController["_viewModel"].sortingOptions).toEqual(["Name", "Number of Files"])
		})
	})

	describe("onSortingOptionChanged", () => {
		it("should update the sortingOption to Number of Files", () => {
			sortingOptionController.onSortingOptionChanged(SortingOption.NUMBER_OF_FILES)

			expect(sortingOptionController["_viewModel"].sortingOption).toEqual(SortingOption.NUMBER_OF_FILES)
		})

		it("should update the sortingOption to Name", () => {
			sortingOptionController.onSortingOptionChanged(SortingOption.NAME)

			expect(sortingOptionController["_viewModel"].sortingOption).toEqual(SortingOption.NAME)
		})
	})

	describe("onChange", () => {
		it("should set sortingOption in settings", () => {
			sortingOptionController["_viewModel"].sortingOption = SortingOption.NUMBER_OF_FILES

			sortingOptionController.onChange()

			expect(storeService.getState().dynamicSettings.sortingOption).toBe(sortingOptionController["_viewModel"].sortingOption)
		})
	})
})
