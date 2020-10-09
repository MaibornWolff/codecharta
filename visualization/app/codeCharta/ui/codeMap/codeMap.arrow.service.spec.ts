import "../../codeCharta.module"
import "./codeMap.module"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { Object3D, Vector3 } from "three"
import {
	CODE_MAP_BUILDING,
	OUTGOING_NODE,
	DIFFERENT_NODE,
	INCOMING_NODE,
	VALID_EDGES_DECORATED,
	CODE_MAP_BUILDING_WITH_INCOMING_EDGE_NODE,
	CODE_MAP_BUILDING_WITH_OUTGOING_EDGE_NODE
} from "../../util/dataMocks"
import { Edge, EdgeVisibility, Node } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { ColorConverter } from "../../util/color/colorConverter"
import { StoreService } from "../../state/store.service"
import { setScaling } from "../../state/store/appSettings/scaling/scaling.actions"
import { setEdges } from "../../state/store/fileSettings/edges/edges.actions"
import { setHeightMetric } from "../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { CodeMapMesh } from "./rendering/codeMapMesh"

describe("CodeMapArrowService", () => {
	let codeMapArrowService: CodeMapArrowService
	let threeSceneService: ThreeSceneService
	let $rootScope: IRootScopeService
	let storeService: StoreService

	beforeEach(() => {
		restartSystem()
		rebuildService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap")

		threeSceneService = getService<ThreeSceneService>("threeSceneService")
		storeService = getService<StoreService>("storeService")
		$rootScope = getService<IRootScopeService>("$rootScope")
	}

	function rebuildService() {
		codeMapArrowService = new CodeMapArrowService($rootScope, storeService, threeSceneService)
	}

	function withMockedThreeSceneService() {
		threeSceneService = codeMapArrowService["threeSceneService"] = jest.fn().mockReturnValue({
			edgeArrows: {
				children: [],
				add: jest.fn()
			},
			highlightedBuildings: [],
			getMapMesh: jest.fn().mockReturnValue({
				getMeshDescription: jest.fn().mockReturnValue({ getBuildingByPath: jest.fn() }),
				clearHighlight: jest.fn(),
				highlightBuilding: jest.fn(),
				clearSelection: jest.fn(),
				selectBuilding: jest.fn()
			}),
			highlightBuildings: jest.fn(),
			addBuildingToHighlightingList: jest.fn(),
			getSelectedBuilding: jest.fn().mockReturnValue({
				value: "value"
			})
		})()
	}

	function setupEdgeArrowsWithChildren() {
		const dummyObject3D = new Object3D()
		threeSceneService.edgeArrows.children = [dummyObject3D, dummyObject3D]
	}

	function setupArrows() {
		const dummyObject3D = new Object3D()
		codeMapArrowService["arrows"] = [dummyObject3D, dummyObject3D]
	}

	describe("constructor", () => {
		it("should assign arrows an empty array", () => {
			expect(codeMapArrowService["arrows"].length).toBe(0)
		})

		it("should subscribe to Building-Hovered-Events", () => {
			CodeMapMouseEventService.subscribeToBuildingHovered = jest.fn()

			rebuildService()

			expect(CodeMapMouseEventService.subscribeToBuildingHovered).toHaveBeenCalledWith($rootScope, codeMapArrowService)
		})
		it("should subscribe to Building-Unhovered-Events", () => {
			CodeMapMouseEventService.subscribeToBuildingUnhovered = jest.fn()

			rebuildService()

			expect(CodeMapMouseEventService.subscribeToBuildingUnhovered).toHaveBeenCalledWith($rootScope, codeMapArrowService)
		})
	})
	describe("Arrow Behaviour when selecting and hovering a building", () => {
		it("should only highlight small leaf when big leaf is selected", () => {
			storeService.dispatch(setEdges(VALID_EDGES_DECORATED))
			const nodes: Node[] = [
				CODE_MAP_BUILDING_WITH_OUTGOING_EDGE_NODE.node,
				CODE_MAP_BUILDING_WITH_INCOMING_EDGE_NODE.node,
				DIFFERENT_NODE
			]
			const edges = storeService.getState().fileSettings.edges.filter(x => x.visible !== EdgeVisibility.none)
			threeSceneService["mapMesh"] = new CodeMapMesh(nodes, storeService.getState(), false)
			codeMapArrowService.addEdgePreview(nodes, edges)
			storeService.dispatch(setHeightMetric("mcc"))

			threeSceneService.selectBuilding(CODE_MAP_BUILDING_WITH_OUTGOING_EDGE_NODE)
			codeMapArrowService.onBuildingHovered(CODE_MAP_BUILDING_WITH_OUTGOING_EDGE_NODE)

			expect(threeSceneService["highlighted"]).toMatchSnapshot()
			expect(threeSceneService["selected"]).toMatchSnapshot()
		})
	})

	describe("SelectionMethods", () => {
		beforeEach(() => {
			codeMapArrowService.clearArrows = jest.fn()
			codeMapArrowService["showEdgesOfBuildings"] = jest.fn()
			codeMapArrowService.addEdgePreview = jest.fn()
			threeSceneService.clearHighlight = jest.fn()
			codeMapArrowService["buildPairingEdges"] = jest.fn()
		})
		it("should call clearArrows and showEdgesOfBuildings through BuildingSelected", () => {
			codeMapArrowService.onBuildingSelected(CODE_MAP_BUILDING)

			expect(codeMapArrowService.clearArrows).toHaveBeenCalled()
			expect(codeMapArrowService["showEdgesOfBuildings"]).toHaveBeenCalled()
			expect(codeMapArrowService.addEdgePreview).toHaveBeenCalledTimes(0)
		})

		it("should call clearArrows and showEdgesOfBuildings through BuildingHovered", () => {
			codeMapArrowService.onBuildingHovered(CODE_MAP_BUILDING)

			expect(codeMapArrowService.clearArrows).toHaveBeenCalled()
			expect(codeMapArrowService["showEdgesOfBuildings"]).toHaveBeenCalled()
			expect(codeMapArrowService.addEdgePreview).toHaveBeenCalledTimes(0)
		})

		it("should call clearArrows and showEdgesOfBuildings through BuildingUnHovered", () => {
			codeMapArrowService.onBuildingUnhovered()

			expect(codeMapArrowService.clearArrows).toHaveBeenCalled()
			expect(codeMapArrowService["showEdgesOfBuildings"]).toHaveBeenCalled()
			expect(codeMapArrowService.addEdgePreview).toHaveBeenCalledTimes(0)
		})

		it("should call clearArrows and showEdgesOfBuildings through BuildingDeselcted", () => {
			codeMapArrowService.onBuildingDeselected()

			expect(codeMapArrowService.clearArrows).toHaveBeenCalled()
			expect(threeSceneService.clearHighlight).toHaveBeenCalled()
			expect(codeMapArrowService["showEdgesOfBuildings"]).toHaveBeenCalledTimes(0)
			expect(codeMapArrowService.addEdgePreview).toHaveBeenCalled()
		})
	})

	describe("clearArrows", () => {
		beforeEach(() => {
			withMockedThreeSceneService()
		})

		it("should remove all array entries of field arrows", () => {
			setupEdgeArrowsWithChildren()

			codeMapArrowService.clearArrows()

			expect(codeMapArrowService["arrows"].length).toBe(0)
		})

		it("should remove all array entries of threeSceneService.edgeArrows.children", () => {
			setupEdgeArrowsWithChildren()

			codeMapArrowService.clearArrows()

			expect(threeSceneService.edgeArrows.children.length).toBe(0)
		})
	})

	describe("addEdgePreview", () => {
		beforeEach(() => {
			codeMapArrowService["map"] = new Map<string, Node>()
			codeMapArrowService["map"].get = jest.fn(() => {
				return INCOMING_NODE
			})
			codeMapArrowService["previewMode"] = jest.fn()
		})
		it("should create and edge Preview of one", () => {
			const nodes: Node[] = [OUTGOING_NODE]
			const edges: Edge[] = storeService.getState().fileSettings.edges.filter(x => x.visible !== EdgeVisibility.none)

			codeMapArrowService.addEdgePreview(nodes, edges)

			expect(codeMapArrowService["map"].size).toEqual(1)
		})
		it("should create and no edge Preview at all", () => {
			const edges: Edge[] = storeService.getState().fileSettings.edges.filter(x => x.visible !== EdgeVisibility.none)

			codeMapArrowService.addEdgePreview(null, edges)

			expect(codeMapArrowService["map"].size).toEqual(0)
		})
	})

	describe("createCurve", () => {
		it("should create a curve out of the 2 Nodes", () => {
			const originNode: Node = OUTGOING_NODE
			const targetNode: Node = INCOMING_NODE
			const curveScale = 100 * storeService.getState().appSettings.edgeHeight

			const curve = codeMapArrowService["createCurve"](originNode, targetNode, curveScale)

			expect(curve).toBeDefined()
		})
	})

	describe("highlightBuilding", () => {
		it("should highlight certain buildings", () => {
			withMockedThreeSceneService()

			codeMapArrowService["highlightBuilding"](OUTGOING_NODE)

			expect(threeSceneService.getMapMesh().getMeshDescription().getBuildingByPath).toHaveBeenCalled()
			expect(threeSceneService.addBuildingToHighlightingList).toHaveBeenCalled()
		})
	})

	describe("setCurveColor", () => {
		beforeEach(() => {
			threeSceneService.edgeArrows["add"] = jest.fn()
			codeMapArrowService["arrows"].push = jest.fn()
		})
		it("should run through the function with mocked subfunctions", () => {
			const originNode: Node = OUTGOING_NODE
			const targetNode: Node = INCOMING_NODE
			const curveScale = 100 * storeService.getState().appSettings.edgeHeight
			const curve = codeMapArrowService["createCurve"](originNode, targetNode, curveScale)
			const color = ColorConverter.convertHexToNumber(storeService.getState().appSettings.mapColors.outgoingEdge)

			codeMapArrowService["setCurveColor"](curve, color)

			expect(threeSceneService.edgeArrows["add"]).toHaveBeenCalled()
			expect(codeMapArrowService["arrows"].push).toHaveBeenCalled()
		})
	})

	describe("scale", () => {
		it("should set the scale of all arrows to x, y and z", () => {
			setupArrows()
			storeService.dispatch(setScaling(new Vector3(1, 2, 3)))

			codeMapArrowService.scale()

			expect(codeMapArrowService["arrows"][0].scale.x).toBe(1)
			expect(codeMapArrowService["arrows"][0].scale.y).toBe(2)
			expect(codeMapArrowService["arrows"][0].scale.z).toBe(3)
		})
	})
})
