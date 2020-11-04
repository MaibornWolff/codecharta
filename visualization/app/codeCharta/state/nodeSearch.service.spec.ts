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

		it("nodes should be retrieved based on a wildcard search", () => {
			const firstExpectedNode = "/root/Parent Leaf/small leaf"
			const secondExpectedNode = "/root/Parent Leaf/other small leaf"

			nodeSearchService.onSearchPatternChanged("*small*")

			expect(nodeSearchService["searchedNodes"].length).toBe(2)
			expect(nodeSearchService["searchedNodes"][0].path).toBe(firstExpectedNode)
			expect(nodeSearchService["searchedNodes"][1].path).toBe(secondExpectedNode)

			nodeSearchService.onSearchPatternChanged(" \tsmall")

			expect(nodeSearchService["searchedNodes"].length).toBe(2)
			expect(nodeSearchService["searchedNodes"][0].path).toBe(firstExpectedNode)
			expect(nodeSearchService["searchedNodes"][1].path).toBe(secondExpectedNode)
		})

		it("nodes should be retrieved based on a prefixed wildcard search", () => {
			// the leading root-folder-slash will be ignored
			// everything with /root as a prefix is expected to be found
			nodeSearchService.onSearchPatternChanged("root*")
			expect(nodeSearchService["searchedNodes"].length).toBe(6)

			// ensure that the prefix will exactly be matched
			nodeSearchService.onSearchPatternChanged("oot/*")
			expect(nodeSearchService["searchedNodes"].length).toBe(0)
		})

		it("node(s) should be retrieved using the explicit search mode", () => {
			const expectedBigLeafNode = "/root/big leaf"
			// exactly matching node path
			nodeSearchService.onSearchPatternChanged(`"${expectedBigLeafNode}"`)

			expect(nodeSearchService["searchedNodes"].length).toBe(1)
			expect(nodeSearchService["searchedNodes"][0].path).toBe(expectedBigLeafNode)

			// exactly matching node path with whitespace at the beginning will find nothing
			nodeSearchService.onSearchPatternChanged(`" ${expectedBigLeafNode}"`)
			expect(nodeSearchService["searchedNodes"].length).toBe(0)

			/// partially matching node path
			nodeSearchService.onSearchPatternChanged("\"/root/Parent Leaf\"")

			expect(nodeSearchService["searchedNodes"].length).toBe(4)
			expect(nodeSearchService["searchedNodes"][0].path).toBe("/root/Parent Leaf")
			expect(nodeSearchService["searchedNodes"][1].path).toBe("/root/Parent Leaf/small leaf")
			expect(nodeSearchService["searchedNodes"][2].path).toBe("/root/Parent Leaf/other small leaf")
			expect(nodeSearchService["searchedNodes"][3].path).toBe("/root/Parent Leaf/empty folder")
		})

		it("nodes should be retrieved searching by multiple search entries", () => {
			nodeSearchService.onSearchPatternChanged(" \tbig, \tempty")

			expect(nodeSearchService["searchedNodes"].length).toBe(2)
			expect(nodeSearchService["searchedNodes"][0].path).toBe("/root/big leaf")
			expect(nodeSearchService["searchedNodes"][1].path).toBe("/root/Parent Leaf/empty folder")
		})

		it("nodes should be retrieved by inverted search", () => {
			nodeSearchService.onSearchPatternChanged(" \tleaf")

			expect(nodeSearchService["searchedNodes"].length).toBe(5)
			expect(nodeSearchService["searchedNodes"][0].path).toBe("/root/big leaf")
			expect(nodeSearchService["searchedNodes"][1].path).toBe("/root/Parent Leaf")
			expect(nodeSearchService["searchedNodes"][2].path).toBe("/root/Parent Leaf/small leaf")
			expect(nodeSearchService["searchedNodes"][3].path).toBe("/root/Parent Leaf/other small leaf")
			expect(nodeSearchService["searchedNodes"][4].path).toBe("/root/Parent Leaf/empty folder")

			nodeSearchService.onSearchPatternChanged(" \t!leaf")

			expect(nodeSearchService["searchedNodes"].length).toBe(1)
			expect(nodeSearchService["searchedNodes"][0].path).toBe("/root")

			nodeSearchService.onSearchPatternChanged("!*")

			expect(nodeSearchService["searchedNodes"].length).toBe(0)
		})

		it("nodes should not be retrieved by multiple inverted search entries", () => {
			nodeSearchService.onSearchPatternChanged(" \tsmall, \tbig")

			expect(nodeSearchService["searchedNodes"].length).toBe(3)
			expect(nodeSearchService["searchedNodes"][0].path).toBe("/root/big leaf")
			expect(nodeSearchService["searchedNodes"][1].path).toBe("/root/Parent Leaf/small leaf")
			expect(nodeSearchService["searchedNodes"][2].path).toBe("/root/Parent Leaf/other small leaf")

			//invert both search strings
			nodeSearchService.onSearchPatternChanged("! \tsmall, \tbig")

			expect(nodeSearchService["searchedNodes"].length).toBe(3)
			expect(nodeSearchService["searchedNodes"][0].path).toBe("/root")
			expect(nodeSearchService["searchedNodes"][1].path).toBe("/root/Parent Leaf")
			expect(nodeSearchService["searchedNodes"][2].path).toBe("/root/Parent Leaf/empty folder")
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
