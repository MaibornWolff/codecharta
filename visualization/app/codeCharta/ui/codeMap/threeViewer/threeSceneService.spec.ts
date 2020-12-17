import "./threeViewer.module"
import { getService, instantiateModule } from "../../../../../mocks/ng.mockhelper"
import {
	CODE_MAP_BUILDING,
	CODE_MAP_BUILDING_TS_NODE,
	CONSTANT_HIGHLIGHT,
	TEST_NODES,
	VALID_FILE_NODE_WITH_ID,
	VALID_NODES_WITH_ID
} from "../../../util/dataMocks"
import { CodeMapPreRenderService } from "../codeMap.preRender.service"
import { CodeMapBuilding } from "../rendering/codeMapBuilding"
import { ThreeSceneService } from "./threeSceneService"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../state/store.service"
import { CodeMapMesh } from "../rendering/codeMapMesh"
import { klona } from "klona"
import { CodeMapNode } from "../../../codeCharta.model"
import { setIdToBuilding } from "../../../state/store/lookUp/idToBuilding/idToBuilding.actions"
import { setIdToNode } from "../../../state/store/lookUp/idToNode/idToNode.actions"
import { setScaling } from "../../../state/store/appSettings/scaling/scaling.actions"
import { Box3, Vector3 } from "three"

describe("ThreeSceneService", () => {
	let threeSceneService: ThreeSceneService
	let $rootScope: IRootScopeService
	let storeService: StoreService

	let codeMapBuilding: CodeMapBuilding

	beforeEach(() => {
		restartSystem()
		rebuildService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap.threeViewer")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		threeSceneService = getService<ThreeSceneService>("threeSceneService")

		codeMapBuilding = klona(CODE_MAP_BUILDING)
	}

	function rebuildService() {
		threeSceneService = new ThreeSceneService($rootScope, storeService)
	}

	beforeEach(() => {
		threeSceneService["mapMesh"] = new CodeMapMesh(TEST_NODES, storeService.getState(), false)
		threeSceneService["highlighted"] = [CODE_MAP_BUILDING]
		threeSceneService["constantHighlight"] = CONSTANT_HIGHLIGHT
	})

	describe("constructor", () => {
		it("should subscribe renderMap", () => {
			CodeMapPreRenderService.subscribe = jest.fn()

			rebuildService()

			expect(CodeMapPreRenderService.subscribe).toHaveBeenCalledWith($rootScope, threeSceneService)
		})
	})

	describe("onRenderMapChanged", () => {
		it("should call reselectBuilding", () => {
			threeSceneService["selected"] = codeMapBuilding
			threeSceneService["reselectBuilding"] = jest.fn()

			threeSceneService.onRenderMapChanged()

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
				storeService.getState(),
				threeSceneService["constantHighlight"]
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

	describe("addNodeAndChildrenToConstantHighlight", () => {
		beforeEach(() => {
			const idToBuilding = new Map<number, CodeMapBuilding>()
			idToBuilding.set(CODE_MAP_BUILDING.id, CODE_MAP_BUILDING)
			idToBuilding.set(CODE_MAP_BUILDING_TS_NODE.id, CODE_MAP_BUILDING_TS_NODE)
			storeService.dispatch(setIdToBuilding(idToBuilding))
			const idToNode = new Map<number, CodeMapNode>()
			idToNode.set(VALID_NODES_WITH_ID.id, VALID_NODES_WITH_ID)
			idToNode.set(VALID_FILE_NODE_WITH_ID.id, VALID_FILE_NODE_WITH_ID)
			storeService.dispatch(setIdToNode(idToNode))
			threeSceneService["constantHighlight"] = new Map()
		})

		it("should add a node into constant highlight ", () => {
			const result = new Map<number, CodeMapBuilding>()
			result.set(CODE_MAP_BUILDING_TS_NODE.id, CODE_MAP_BUILDING_TS_NODE)

			threeSceneService.addNodeAndChildrenToConstantHighlight(VALID_FILE_NODE_WITH_ID)

			expect(threeSceneService["constantHighlight"]).toEqual(result)
		})

		it("should add the folder and its children into constant highlight", () => {
			const result = new Map<number, CodeMapBuilding>()
			result.set(CODE_MAP_BUILDING.id, CODE_MAP_BUILDING)
			result.set(CODE_MAP_BUILDING_TS_NODE.id, CODE_MAP_BUILDING_TS_NODE)

			threeSceneService.addNodeAndChildrenToConstantHighlight(VALID_NODES_WITH_ID)

			expect(threeSceneService["constantHighlight"]).toEqual(result)
		})
	})

	describe("removeNodeAndChildrenFromConstantHighlight", () => {
		beforeEach(() => {
			const idToBuilding = new Map<number, CodeMapBuilding>()
			idToBuilding.set(CODE_MAP_BUILDING.id, CODE_MAP_BUILDING)
			idToBuilding.set(CODE_MAP_BUILDING_TS_NODE.id, CODE_MAP_BUILDING_TS_NODE)
			storeService.dispatch(setIdToBuilding(idToBuilding))
			const idToNode = new Map<number, CodeMapNode>()
			idToNode.set(VALID_NODES_WITH_ID.id, VALID_NODES_WITH_ID)
			idToNode.set(VALID_FILE_NODE_WITH_ID.id, VALID_FILE_NODE_WITH_ID)
			storeService.dispatch(setIdToNode(idToNode))
		})
		it("should remove the building from constant Highlight ", () => {
			const result = new Map<number, CodeMapBuilding>()
			result.set(CODE_MAP_BUILDING.id, CODE_MAP_BUILDING)

			threeSceneService.removeNodeAndChildrenFromConstantHighlight(VALID_FILE_NODE_WITH_ID)

			expect(threeSceneService["constantHighlight"]).toEqual(result)
		})

		it("should remove the folder and its children from constant Highlight ", () => {
			const result = new Map()

			threeSceneService.removeNodeAndChildrenFromConstantHighlight(VALID_NODES_WITH_ID)

			expect(threeSceneService["constantHighlight"]).toEqual(result)
		})
	})

	describe("getIntersectionDistance", () => {
		let bboxOverlap = null
		let bboxHovered = null
		let bboxMiss = null
		let normedVector = null
		let bboxContain = null
		const overlapDistance = 2

		beforeEach(() => {
			bboxOverlap = new Box3(new Vector3(2, 2, 2), new Vector3(4, 4, 4))
			bboxHovered = new Box3(new Vector3(1, 1, 1), new Vector3(2, 2, 2))
			bboxMiss = new Box3(new Vector3(5, 5, 5), new Vector3(6, 6, 6))
			bboxContain = new Box3(new Vector3(3, 3, 3), new Vector3(4, 4, 4))
			normedVector = new Vector3(1, 1, 1)
		})

		it("should calculate distance if labels partially overlap", () => {
			const distance = threeSceneService["getIntersectionDistance"](bboxHovered, bboxOverlap, normedVector, overlapDistance)
			expect(distance).toEqual(overlapDistance)
		})

		it("should calculate distance if labels fully overlap", () => {
			const distance = threeSceneService["getIntersectionDistance"](bboxHovered, bboxContain, normedVector, overlapDistance)
			expect(distance).toEqual(overlapDistance)
		})

		it("should return 0 if labels dont overlap", () => {
			const distance = threeSceneService["getIntersectionDistance"](bboxHovered, bboxMiss, normedVector, overlapDistance)
			expect(distance).toEqual(0)
		})
	})

	describe("clearConstantHighlight", () => {
		it("should clear all the constant highlighted buildings ", () => {
			threeSceneService["constantHighlight"].set(CODE_MAP_BUILDING.id, CODE_MAP_BUILDING)

			threeSceneService.clearConstantHighlight()

			expect(threeSceneService["constantHighlight"].size).toEqual(0)
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

	describe("scaleHeight", () => {
		it("should update mapGeometry scaling to new vector", () => {
			const scaling = new Vector3(1, 2, 3)
			storeService.dispatch(setScaling(scaling))
			threeSceneService.scaleHeight()

			const mapGeometry = threeSceneService.mapGeometry

			expect(mapGeometry.scale).toEqual(scaling)
		})

		it("should call mapMesh.scale and apply the correct scaling to the mesh", () => {
			const scaling = new Vector3(1, 2, 3)
			storeService.dispatch(setScaling(scaling))
			threeSceneService["mapMesh"].setScale = jest.fn()

			threeSceneService.scaleHeight()

			expect(threeSceneService["mapMesh"].setScale).toHaveBeenCalledWith(scaling)
		})
	})
})
