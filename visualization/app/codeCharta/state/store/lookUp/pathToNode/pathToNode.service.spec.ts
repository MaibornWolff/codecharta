import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { PathToNodeAction, PathToNodeActions } from "./pathToNode.actions"
import { PathToNodeService } from "./pathToNode.service"
import { TEST_FILE_WITH_PATHS, withMockedEventMethods } from "../../../../util/dataMocks"
import { CodeMapNode } from "../../../../codeCharta.model"
import { CodeMapPreRenderService } from "../../../../ui/codeMap/codeMap.preRender.service"

describe("PathToNodeService", () => {
	let pathToNodeService: PathToNodeService
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
		pathToNodeService = new PathToNodeService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, pathToNodeService)
		})

		it("should subscribe to renderMapChange", () => {
			CodeMapPreRenderService.subscribe = jest.fn()

			rebuildService()

			expect(CodeMapPreRenderService.subscribe).toHaveBeenCalledWith($rootScope, pathToNodeService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new pathToNode value", () => {
			const map = new Map<string, CodeMapNode>()
			map.set(TEST_FILE_WITH_PATHS.map.path, TEST_FILE_WITH_PATHS.map)
			const action: PathToNodeAction = {
				type: PathToNodeActions.SET_PATH_TO_NODE,
				payload: map
			}
			storeService["store"].dispatch(action)

			pathToNodeService.onStoreChanged(PathToNodeActions.SET_PATH_TO_NODE)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("path-to-node-changed", { pathToNode: map })
		})

		it("should not notify anything on non-path-to-node-events", () => {
			pathToNodeService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})

	describe("onRenderMapChanged", () => {
		it("should update the map", () => {
			pathToNodeService.onRenderMapChanged(TEST_FILE_WITH_PATHS.map)

			expect(storeService.getState().lookUp.pathToNode).toMatchSnapshot()
		})
	})
})
