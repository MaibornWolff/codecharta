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
				type: FocusedNodePathActions.FOCUS_NODE,
				payload: "some/path/*.ts"
			}
			storeService["store"].dispatch(action)

			focusedNodePathService.onStoreChanged(FocusedNodePathActions.FOCUS_NODE)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("focus-node", { focusedNodePath: "some/path/*.ts" })
		})

		it("should notify all subscribers with the new focusedNodePath value", () => {
			const action: FocusedNodePathAction = {
				type: FocusedNodePathActions.UNFOCUS_NODE,
				payload: ""
			}
			storeService["store"].dispatch(action)

			focusedNodePathService.onStoreChanged(FocusedNodePathActions.UNFOCUS_NODE)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("unfocus-node")
		})

		it("should not notify anything on non-focused-node-path-events", () => {
			focusedNodePathService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
