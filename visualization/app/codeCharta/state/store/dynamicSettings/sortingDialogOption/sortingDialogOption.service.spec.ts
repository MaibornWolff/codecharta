import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { SortingDialogOptionAction, SortingDialogOptionActions } from "./sortingDialogOption.actions"
import { SortingDialogOptionService } from "./sortingDialogOption.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"
import { SortingOption } from "../../../../codeCharta.model"

describe("SortingDialogOptionService", () => {
	let sortingDialogOptionService: SortingDialogOptionService
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
		sortingDialogOptionService = new SortingDialogOptionService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, sortingDialogOptionService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new sortingDialogOption value", () => {
			const action: SortingDialogOptionAction = {
				type: SortingDialogOptionActions.SET_SORTING_DIALOG_OPTION,
				payload: SortingOption.NUMBER_OF_FILES
			}
			storeService["store"].dispatch(action)

			sortingDialogOptionService.onStoreChanged(SortingDialogOptionActions.SET_SORTING_DIALOG_OPTION)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("sorting-dialog-option-changed", {
				sortingDialogOption: SortingOption.NUMBER_OF_FILES
			})
		})

		it("should not notify anything on non-sorting-dialog-option-events", () => {
			sortingDialogOptionService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
