import "./state.module"
import { NodeSearchService } from "./nodeSearch.service"
import { instantiateModule, getService } from "../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { CodeMapPreRenderService } from "../ui/codeMap/codeMap.preRender.service"
import { SettingsService } from "./settingsService/settings.service"
import { TEST_FILE_WITH_PATHS } from "../util/dataMocks"
import { CodeMapHelper } from "../util/codeMapHelper"

describe("NodeSearchService", () => {
	let nodeSearchService: NodeSearchService
	let $rootScope: IRootScopeService
	let codeMapPreRenderService: CodeMapPreRenderService
	let settingsService: SettingsService

	beforeEach(() => {
		restartSystem()
		rebuildService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		settingsService = getService<SettingsService>("settingsService")
		codeMapPreRenderService = getService<CodeMapPreRenderService>("codeMapPreRenderService")
	}

	function rebuildService() {
		nodeSearchService = new NodeSearchService($rootScope, codeMapPreRenderService, settingsService)
	}

	describe("constructor", () => {
		beforeEach(() => {
			SettingsService.subscribe = jest.fn()
		})

		it("should subscribe to SettingsService", () => {
			rebuildService()

			expect(SettingsService.subscribe).toHaveBeenCalledWith($rootScope, nodeSearchService)
		})
	})

	describe("onSettingsChanged", () => {
		beforeEach(() => {
			nodeSearchService["codeMapPreRenderService"].getRenderMap = jest.fn(() => {
				return JSON.parse(JSON.stringify(TEST_FILE_WITH_PATHS.map))
			})

			// Workaround for Windows paths, since "ignore" does not work for unit tests
			CodeMapHelper.getNodesByGitignorePath = jest.fn((nodes, pattern) => {
				return nodes.filter(it => it.name === pattern)
			})

			settingsService.updateSettings, (nodeSearchService["settingsService"].updateSettings = jest.fn())
		})

		it("node should be retrieved based on query", () => {
			nodeSearchService.onSettingsChanged(null, { dynamicSettings: { searchPattern: "small leaf" } })

			expect(nodeSearchService["searchedNodes"].length).toEqual(1)
			expect(nodeSearchService["searchedNodes"][0].name).toEqual("small leaf")
		})

		it("no node should be found for empty query", () => {
			nodeSearchService.onSettingsChanged(null, { dynamicSettings: { searchPattern: "" } })

			expect(nodeSearchService["searchedNodes"]).toEqual([])
		})

		it("should update searched paths", () => {
			nodeSearchService.onSettingsChanged(null, { dynamicSettings: { searchPattern: "small leaf" } })

			expect(settingsService.updateSettings).toBeCalledWith({
				dynamicSettings: { searchedNodePaths: ["/root/Parent Leaf/small leaf"] }
			})
		})
	})

	describe("isSearchPatternUpdated", () => {
		it("should return true because searchPattern was updated in settings", () => {
			const result = nodeSearchService["isSearchPatternUpdated"]({ dynamicSettings: { searchPattern: "newPattern" } })
			expect(result).toEqual(true)
		})

		it("should return true because searchPattern was updated in settings with empty string", () => {
			const result = nodeSearchService["isSearchPatternUpdated"]({ dynamicSettings: { searchPattern: "" } })
			expect(result).toEqual(true)
		})

		it("should return false because searchPattern was not updated in settings", () => {
			const result = nodeSearchService["isSearchPatternUpdated"]({ dynamicSettings: { margin: 42 } })
			expect(result).toEqual(false)
		})
	})
})
