import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { InvertHeightAction, InvertHeightActions } from "./invertHeight.actions"
import { InvertHeightService } from "./invertHeight.service"

describe("InvertHeightService", () => {
	let invertHeightService: InvertHeightService
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
		invertHeightService = new InvertHeightService($rootScope, storeService)
	}

	function withMockedEventMethods() {
		$rootScope.$broadcast = jest.fn()
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, invertHeightService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new invertHeight value", () => {
			const action: InvertHeightAction = {
				type: InvertHeightActions.SET_INVERT_HEIGHT,
				payload: true
			}
			storeService["store"].dispatch(action)

			invertHeightService.onStoreChanged(InvertHeightActions.SET_INVERT_HEIGHT)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("invert-height-changed", { invertHeight: true })
		})

		it("should not notify anything on non-invert-height-events", () => {
			invertHeightService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
