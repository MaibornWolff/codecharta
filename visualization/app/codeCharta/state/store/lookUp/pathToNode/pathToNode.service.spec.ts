import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { PathToNodeService } from "./pathToNode.service"
import { TEST_FILE_WITH_PATHS, withMockedEventMethods } from "../../../../util/dataMocks"
import { CodeMapPreRenderService } from "../../../../ui/codeMap/codeMap.preRender.service"
import { NodeDecorator } from "../../../../util/nodeDecorator"

describe("PathToNodeService", () => {
	let pathToNodeService: PathToNodeService
	let storeService: StoreService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods($rootScope)
		NodeDecorator.preDecorateFile(TEST_FILE_WITH_PATHS)
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
		it("should subscribe to renderMapChange", () => {
			CodeMapPreRenderService.subscribe = jest.fn()

			rebuildService()

			expect(CodeMapPreRenderService.subscribe).toHaveBeenCalledWith($rootScope, pathToNodeService)
		})
	})

	describe("onRenderMapChanged", () => {
		it("should update the map", () => {
			pathToNodeService.onRenderMapChanged(TEST_FILE_WITH_PATHS.map)

			expect(storeService.getState().lookUp.pathToNode.size).toBe(6)
		})
	})
})
