import "./threeViewer.module"
import { getService, instantiateModule } from "../../../../../mocks/ng.mockhelper"
import { VALID_NODE, CODE_MAP_BUILDING, TEST_NODES } from "../../../util/dataMocks"
import { CodeMapNode } from "../../../model/codeCharta.model"
import { CodeMapPreRenderService } from "../codeMap.preRender.service"
import { CodeMapBuilding } from "../rendering/codeMapBuilding"
import { ThreeSceneService } from "./threeSceneService"
import { IRootScopeService } from "angular"
import _ from "lodash"
import { StoreService } from "../../../state/store.service"
import { CodeMapMesh } from "../rendering/codeMapMesh"

describe("ThreeSceneService", () => {
	let threeSceneService: ThreeSceneService
	let $rootScope: IRootScopeService
	let storeService: StoreService

	let map: CodeMapNode
	let codeMapBuilding: CodeMapBuilding

	beforeEach(() => {
		restartSystem()
		rebuildService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap.threeViewer")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")

		map = _.cloneDeep(VALID_NODE)
		codeMapBuilding = _.cloneDeep(CODE_MAP_BUILDING)
	}

	function rebuildService() {
		threeSceneService = new ThreeSceneService($rootScope, storeService)
	}

	beforeEach(() => {
		threeSceneService["mapMesh"] = new CodeMapMesh(TEST_NODES, storeService.getState(), false)
		threeSceneService["highlighted"] = [CODE_MAP_BUILDING]
	})

	describe("constructor", () => {
		it("should subscribeToFilesSelection renderMap", () => {
			CodeMapPreRenderService.subscribe = jest.fn()

			rebuildService()

			expect(CodeMapPreRenderService.subscribe).toHaveBeenCalledWith($rootScope, threeSceneService)
		})
	})

	describe("onRenderMapChanged", () => {
		it("should call reselectBuilding", () => {
			threeSceneService["selected"] = codeMapBuilding
			threeSceneService["reselectBuilding"] = jest.fn()

			threeSceneService.onRenderMapChanged(map)

			expect(threeSceneService["reselectBuilding"]).toHaveBeenCalled()
		})
	})

	describe("highlightBuildings", () => {
		it("should call highlightBuilding", () => {
			threeSceneService["mapMesh"].highlightBuilding = jest.fn()

			threeSceneService.highlightBuildings()

			expect(threeSceneService["mapMesh"].highlightBuilding).toHaveBeenCalledWith(
				threeSceneService["highlighted"],
				null,
				storeService.getState()
			)
		})
	})

	describe("addBuildingToHighlightingList", () => {
		it("should add the given building to the HighlightingList ", () => {
			threeSceneService["highlighted"] = []

			threeSceneService.addBuildingToHighlightingList(CODE_MAP_BUILDING)

			expect(threeSceneService["highlighted"]).toEqual([CODE_MAP_BUILDING])
		})
	})

	describe("highlightSingleBuilding", () => {
		it("should add a building to the highlighting list and call the highlight function", () => {
			threeSceneService.addBuildingToHighlightingList = jest.fn()
			threeSceneService.highlightBuildings = jest.fn()
			threeSceneService["highlighted"] = []

			threeSceneService.highlightSingleBuilding(CODE_MAP_BUILDING)

			expect(threeSceneService.addBuildingToHighlightingList).toHaveBeenCalled()
			expect(threeSceneService.highlightBuildings).toHaveBeenCalled()
		})
	})

	describe("clearHighlight", () => {
		it("should clear the highlighting list", () => {
			threeSceneService.clearHighlight()

			expect(threeSceneService["highlighted"]).toHaveLength(0)
		})
	})
})
