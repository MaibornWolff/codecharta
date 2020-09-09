import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { IdToNodeService } from "./idToNode.service"
import { TEST_FILE_WITH_PATHS, withMockedEventMethods } from "../../../../util/dataMocks"
import { NodeDecorator } from "../../../../util/nodeDecorator"
import { CodeMapPreRenderService } from "../../../../ui/codeMap/codeMap.preRender.service"

describe("IdToNodeService", () => {
	let idToNodeService: IdToNodeService
	let storeService: StoreService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods($rootScope)
		NodeDecorator.decorateMap(TEST_FILE_WITH_PATHS.map, [], [])
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildService() {
		idToNodeService = new IdToNodeService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to renderMapChange", () => {
			CodeMapPreRenderService.subscribe = jest.fn()

			rebuildService()

			expect(CodeMapPreRenderService.subscribe).toHaveBeenCalledWith($rootScope, idToNodeService)
		})
	})

	describe("onRenderMapChanged", () => {
		it("should update the map", () => {
			idToNodeService.onRenderMapChanged(TEST_FILE_WITH_PATHS.map)

			expect(storeService.getState().lookUp.idToNode.size).toBe(6)
		})
	})
})
