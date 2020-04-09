import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { TreeMapStartDepthAction, TreeMapStartDepthActions } from "./treeMapStartDepth.actions"
import { TreeMapStartDepthService } from "./treeMapStartDepth.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("TreeMapStartDepthService", () => {
	let treeMapStartDepthService: TreeMapStartDepthService
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
		treeMapStartDepthService = new TreeMapStartDepthService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, treeMapStartDepthService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new treeMapStartDepth value", () => {
			const action: TreeMapStartDepthAction = {
				type: TreeMapStartDepthActions.SET_TREE_MAP_START_DEPTH,
				payload: 1
			}
			storeService["store"].dispatch(action)

			treeMapStartDepthService.onStoreChanged(TreeMapStartDepthActions.SET_TREE_MAP_START_DEPTH)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("tree-map-start-depth-changed", { treeMapStartDepth: 1 })
		})

		it("should not notify anything on non-tree-map-start-depth-events", () => {
			treeMapStartDepthService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
