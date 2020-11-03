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

		it("nodes should be retrieved based on a wildcard search by specifying wildcard star", () => {
			nodeSearchService.onSearchPatternChanged("*small*")

			expect(nodeSearchService["searchedNodes"].length).toEqual(2)
			expect(nodeSearchService["searchedNodes"][0].name).toEqual("small leaf")
			expect(nodeSearchService["searchedNodes"][1].name).toEqual("other small leaf")
		})

		it("nodes should be retrieved based on a wildcard search without specifying any wildcard star", () => {
			nodeSearchService.onSearchPatternChanged("small")

			expect(nodeSearchService["searchedNodes"].length).toEqual(2)
			expect(nodeSearchService["searchedNodes"][0].name).toEqual("small leaf")
			expect(nodeSearchService["searchedNodes"][1].name).toEqual("other small leaf")
		})

		it("nodes should be retrieved based on a prefixed wildcard search by ignoring the leading root-folder-slash", () => {
			nodeSearchService.onSearchPatternChanged("root*")

			expect(nodeSearchService["searchedNodes"].length).toEqual(6)
		})

		it("no nodes should be found based on a prefixed wildcard search", () => {
			nodeSearchService.onSearchPatternChanged("oot/*")

			expect(nodeSearchService["searchedNodes"].length).toEqual(0)
		})

		it("one node should be retrieved using the explicit search mode", () => {
			nodeSearchService.onSearchPatternChanged("\"/root/big leaf\"")

			expect(nodeSearchService["searchedNodes"].length).toEqual(1)
			expect(nodeSearchService["searchedNodes"][0].name).toEqual("big leaf")
		})

		it("multiple nodes should be retrieved using the explicit search mode", () => {
			nodeSearchService.onSearchPatternChanged("\"/root/Parent Leaf\"")

			expect(nodeSearchService["searchedNodes"].length).toEqual(4)
			expect(nodeSearchService["searchedNodes"][0].name).toEqual("Parent Leaf")
			expect(nodeSearchService["searchedNodes"][1].name).toEqual("small leaf")
			expect(nodeSearchService["searchedNodes"][2].name).toEqual("other small leaf")
			expect(nodeSearchService["searchedNodes"][3].name).toEqual("empty folder")
		})

		it("nodes should be retrieved searching by multiple search entries", () => {
			nodeSearchService.onSearchPatternChanged("big, empty")

			expect(nodeSearchService["searchedNodes"].length).toEqual(2)
			expect(nodeSearchService["searchedNodes"][0].name).toEqual("big leaf")
			expect(nodeSearchService["searchedNodes"][1].name).toEqual("empty folder")
		})

		it("nodes should be retrieved by inverted search", () => {
			nodeSearchService.onSearchPatternChanged("!leaf")

			expect(nodeSearchService["searchedNodes"].length).toEqual(1)
			expect(nodeSearchService["searchedNodes"][0].name).toEqual("root")
		})

		it("no nodes should be found by inverted 'search all'", () => {
			nodeSearchService.onSearchPatternChanged("!*")

			expect(nodeSearchService["searchedNodes"].length).toEqual(0)
		})

		it("nodes should not be retrieved by multiple inverted search entries", () => {
			nodeSearchService.onSearchPatternChanged("!small,big")

			expect(nodeSearchService["searchedNodes"].length).toEqual(3)
			expect(nodeSearchService["searchedNodes"][0].name).toEqual("root")
			expect(nodeSearchService["searchedNodes"][1].name).toEqual("Parent Leaf")
			expect(nodeSearchService["searchedNodes"][2].name).toEqual("empty folder")
		})

		it("nodes should be retrieved by ignoring leading whitespace", () => {
			nodeSearchService.onSearchPatternChanged(" small")

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
