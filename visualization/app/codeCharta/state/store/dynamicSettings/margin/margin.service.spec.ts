import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { MarginAction, MarginActions } from "./margin.actions"
import { MarginService } from "./margin.service"

describe("MarginService", () => {
	let marginService: MarginService
	let storeService: StoreService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildService() {
		marginService = new MarginService($rootScope, storeService)
	}

	function withMockedEventMethods() {
		$rootScope.$broadcast = jest.fn()
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, marginService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new margin value", () => {
			const action: MarginAction = {
				type: MarginActions.SET_MARGIN,
				payload: 42
			}
			storeService["store"].dispatch(action)

			marginService.onStoreChanged(MarginActions.SET_MARGIN)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("margin-changed", { margin: 42 })
		})

		it("should not notify anything on non-margin-events", () => {
			marginService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
