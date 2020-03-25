import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { SortingOptionAction, SortingOptionActions } from "./sortingOption.actions"
import { SortingOptionService } from "./sortingOption.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"
import { SortingOption } from "../../../../codeCharta.model"

describe("SortingOptionService", () => {
	let sortingOptionService: SortingOptionService
	let storeService: StoreService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods($rootScope)
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildService() {
		sortingOptionService = new SortingOptionService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, sortingOptionService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new sortingOption value", () => {
			const action: SortingOptionAction = {
				type: SortingOptionActions.SET_SORTING_OPTION,
				payload: SortingOption.NUMBER_OF_FILES
			}
			storeService["store"].dispatch(action)

			sortingOptionService.onStoreChanged(SortingOptionActions.SET_SORTING_OPTION)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("sorting-option-changed", { sortingOption: SortingOption.NUMBER_OF_FILES })
		})

		it("should not notify anything on non-sorting-option-events", () => {
			sortingOptionService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
