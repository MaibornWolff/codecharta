import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { SortingOrderAscendingAction, SortingOrderAscendingActions } from "./sortingOrderAscending.actions"
import { SortingOrderAscendingService } from "./sortingOrderAscending.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("SortingOrderAscendingService", () => {
	let sortingOrderAscendingService: SortingOrderAscendingService
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
		sortingOrderAscendingService = new SortingOrderAscendingService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, sortingOrderAscendingService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new sortingOrderAscending value", () => {
			const action: SortingOrderAscendingAction = {
				type: SortingOrderAscendingActions.SET_SORTING_ORDER_ASCENDING,
				payload: true
			}
			storeService["store"].dispatch(action)

			sortingOrderAscendingService.onStoreChanged(SortingOrderAscendingActions.SET_SORTING_ORDER_ASCENDING)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("sorting-order-ascending-changed", { sortingOrderAscending: true })
		})

		it("should not notify anything on non-sorting-order-ascending-events", () => {
			sortingOrderAscendingService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
