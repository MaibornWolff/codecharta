import "./state.module"
import { NodeSearchService } from "./nodeSearch.service"
import { instantiateModule, getService } from "../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { CodeMapPreRenderService } from "../ui/codeMap/codeMap.preRender.service"
import { TEST_FILE_WITH_PATHS } from "../util/dataMocks"
import { StoreService } from "./store.service"
import { SearchPatternService } from "./store/dynamicSettings/searchPattern/searchPattern.service"

describe("NodeSearchService", () => {
	let nodeSearchService: NodeSearchService
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let codeMapPreRenderService: CodeMapPreRenderService

	beforeEach(() => {
		restartSystem()
		rebuildService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		codeMapPreRenderService = getService<CodeMapPreRenderService>("codeMapPreRenderService")
	}

	function rebuildService() {
		nodeSearchService = new NodeSearchService($rootScope, storeService, codeMapPreRenderService)
	}

	describe("constructor", () => {
		it("should subscribe to SearchPatternService", () => {
			SearchPatternService.subscribe = jest.fn()

			rebuildService()

			expect(SearchPatternService.subscribe).toHaveBeenCalledWith($rootScope, nodeSearchService)
		})
	})

	describe("onSearchPatternChanged", () => {
		beforeEach(() => {
			nodeSearchService["codeMapPreRenderService"].getRenderMap = jest.fn(() => {
				return JSON.parse(JSON.stringify(TEST_FILE_WITH_PATHS.map))
			})
		})

		it("node should be retrieved based on query", () => {
			nodeSearchService.onSearchPatternChanged("small leaf")

			expect(nodeSearchService["searchedNodes"].length).toEqual(2)
			expect(nodeSearchService["searchedNodes"][0].name).toEqual("small leaf")
			expect(nodeSearchService["searchedNodes"][1].name).toEqual("other small leaf")
		})

		it("no node should be found for empty query", () => {
			nodeSearchService.onSearchPatternChanged("")

			expect(nodeSearchService["searchedNodes"]).toEqual([])
		})

		it("should update searched paths", () => {
			nodeSearchService.onSearchPatternChanged("small leaf")

			expect([...storeService.getState().dynamicSettings.searchedNodePaths]).toEqual([
				"/root/Parent Leaf/small leaf",
				"/root/Parent Leaf/other small leaf"
			])
		})
	})
})
