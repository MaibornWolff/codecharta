import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { EdgeHeightAction, EdgeHeightActions } from "./edgeHeight.actions"
import { EdgeHeightService } from "./edgeHeight.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("EdgeHeightService", () => {
	let edgeHeightService: EdgeHeightService
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
		edgeHeightService = new EdgeHeightService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, edgeHeightService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new edgeHeight value", () => {
			const action: EdgeHeightAction = {
				type: EdgeHeightActions.SET_EDGE_HEIGHT,
				payload: 1
			}
			storeService["store"].dispatch(action)

			edgeHeightService.onStoreChanged(EdgeHeightActions.SET_EDGE_HEIGHT)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("edge-height-changed", { edgeHeight: 1 })
		})

		it("should not notify anything on non-edge-height-events", () => {
			edgeHeightService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
