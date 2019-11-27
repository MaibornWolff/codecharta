import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { FocusedNodePathAction, FocusedNodePathActions } from "./focusedNodePath.actions"
import { FocusedNodePathService } from "./focusedNodePath.service"

describe("FocusedNodePathService", () => {
	let focusedNodePathService: FocusedNodePathService
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
		focusedNodePathService = new FocusedNodePathService($rootScope, storeService)
	}

	function withMockedEventMethods() {
		$rootScope.$broadcast = jest.fn()
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, focusedNodePathService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new focusedNodePath value", () => {
			const action: FocusedNodePathAction = {
				type: FocusedNodePathActions.SET_FOCUSED_NODE_PATH,
				payload: "some/path/*.ts"
			}
			storeService["store"].dispatch(action)

			focusedNodePathService.onStoreChanged(FocusedNodePathActions.SET_FOCUSED_NODE_PATH)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("focused-node-path-changed", { focusedNodePath: "some/path/*.ts" })
		})

		it("should not notify anything on non-focused-node-path-events", () => {
			focusedNodePathService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
