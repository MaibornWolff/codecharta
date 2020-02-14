import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { DynamicMarginAction, DynamicMarginActions } from "./dynamicMargin.actions"
import { DynamicMarginService } from "./dynamicMargin.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("DynamicMarginService", () => {
	let dynamicMarginService: DynamicMarginService
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
		dynamicMarginService = new DynamicMarginService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribeToFilesSelection to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, dynamicMarginService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new dynamicMargin value", () => {
			const action: DynamicMarginAction = {
				type: DynamicMarginActions.SET_DYNAMIC_MARGIN,
				payload: false
			}
			storeService["store"].dispatch(action)

			dynamicMarginService.onStoreChanged(DynamicMarginActions.SET_DYNAMIC_MARGIN)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("dynamic-margin-changed", { dynamicMargin: false })
		})

		it("should not notify anything on non-dynamic-margin-events", () => {
			dynamicMarginService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
