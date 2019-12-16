import "../../codeCharta.module"
import "./codeMap.module"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { Object3D, Vector3 } from "three"
import { Edge, EdgeVisibility, Node, Settings } from "../../codeCharta.model"
import { SETTINGS, CODE_MAP_BUILDING, DEFAULT_SETTINGS, OUTGOING_NODE, INCOMING_NODE } from "../../util/dataMocks"
import { IRootScopeService } from "angular"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { SettingsService } from "../../state/settingsService/settings.service"
import { ColorConverter } from "../../util/color/colorConverter"

describe("CodeMapArrowService", () => {
	let codeMapArrowService: CodeMapArrowService
	let threeSceneService: ThreeSceneService
	let $rootScope: IRootScopeService
	let settingsService: SettingsService
	let settings: Settings

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedThreeSceneService()
		withMockedSettingsService()
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap")

		threeSceneService = getService<ThreeSceneService>("threeSceneService")
		settingsService = getService<SettingsService>("settingsService")
		$rootScope = getService<IRootScopeService>("$rootScope")

		settings = JSON.parse(JSON.stringify(SETTINGS))
	}

	function rebuildService() {
		codeMapArrowService = new CodeMapArrowService($rootScope, threeSceneService, settingsService)
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
			addBuildingToHighlightingList: jest.fn(),
			getSelectedBuilding: jest.fn().mockReturnValue({
				value: "value"
			})
		})()
	}

	function withMockedSettingsService() {
		settingsService = codeMapArrowService["settingsService"] = jest.fn().mockReturnValue({
			getSettings: jest.fn().mockReturnValue(settings)
		})()
	}

	function withSettingsService() {
		settings = DEFAULT_SETTINGS
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

	describe("SelectionMethods", () => {
		beforeEach(() => {
			withMockedSettingsService()
			codeMapArrowService.clearArrows = jest.fn()
			codeMapArrowService["showEdgesOfBuildings"] = jest.fn()
			codeMapArrowService.addEdgePreview = jest.fn()
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
			expect(codeMapArrowService["showEdgesOfBuildings"]).toHaveBeenCalledTimes(0)
			expect(codeMapArrowService.addEdgePreview).toHaveBeenCalled()
		})
	})

	describe("clearArrows", () => {
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
			codeMapArrowService["map"] = new Map<String, Node>()
			codeMapArrowService["map"].get = jest.fn(() => {
				return INCOMING_NODE
			})
			codeMapArrowService["previewMode"] = jest.fn()
		})
		it("should", () => {
			const originNode: Node = OUTGOING_NODE
			const nodes: Node[] = [originNode]
			const edges: Edge[] = settingsService.getSettings().fileSettings.edges.filter(x => x.visible != EdgeVisibility.none)

			codeMapArrowService.addEdgePreview(nodes, edges)

			expect(codeMapArrowService["map"].size).toEqual(1)
		})
		it("should", () => {
			const edges: Edge[] = settingsService.getSettings().fileSettings.edges.filter(x => x.visible != EdgeVisibility.none)

			codeMapArrowService.addEdgePreview(null, edges)

			expect(codeMapArrowService["map"].size).toEqual(0)
		})
	})

	describe("addArrow", () => {
		beforeEach(() => {
			threeSceneService.edgeArrows["add"] = jest.fn()
			codeMapArrowService["arrows"].push = jest.fn()
		})
		beforeEach(() => {
			withSettingsService()
		})
		it("calls an outgoing Arrow, which should then call the last subfuncions in curveColoring", () => {
			const originNode: Node = OUTGOING_NODE
			const targetNode: Node = INCOMING_NODE

			codeMapArrowService.addArrow(originNode, targetNode, true)

			expect(threeSceneService.edgeArrows["add"]).toHaveBeenCalled()
			expect(codeMapArrowService["arrows"].push).toHaveBeenCalled()
		})
	})

	describe("createCurve", () => {
		it("should create a curve out of the 2 Nodes", () => {
			const originNode: Node = OUTGOING_NODE
			const targetNode: Node = INCOMING_NODE
			const curveScale = 100 * codeMapArrowService["settingsService"].getSettings().appSettings.edgeHeight

			const curve = codeMapArrowService["createCurve"](originNode, targetNode, curveScale)

			expect(curve).toBeDefined()
		})
	})

	describe("lightNodeBuilding", () => {
		it("should Highlight certain Buildings", () => {
			const originNode: Node = OUTGOING_NODE
			codeMapArrowService["lightNodeBuilding"](originNode)
			expect(threeSceneService.getMapMesh().getMeshDescription().getBuildingByPath).toHaveBeenCalled()
			expect(threeSceneService.addBuildingToHighlightingList).toHaveBeenCalled()
		})
	})

	describe("curveColoring", () => {
		beforeEach(() => {
			threeSceneService.edgeArrows["add"] = jest.fn()
			codeMapArrowService["arrows"].push = jest.fn()
		})
		it("should run through the funcion with mocked subfuncions", () => {
			const originNode: Node = OUTGOING_NODE
			const targetNode: Node = INCOMING_NODE
			const curveScale = 100 * codeMapArrowService["settingsService"].getSettings().appSettings.edgeHeight
			const curve = codeMapArrowService["createCurve"](originNode, targetNode, curveScale)
			const color = ColorConverter.convertHexToNumber(
				codeMapArrowService["settingsService"].getSettings().appSettings.mapColors.outgoingEdge
			)

			codeMapArrowService["curveColoring"](curve, color)

			expect(threeSceneService.edgeArrows["add"]).toHaveBeenCalled()
			expect(codeMapArrowService["arrows"].push).toHaveBeenCalled()
		})
	})

	describe("scale", () => {
		it("should set the scale of all arrows to x, y and z", () => {
			setupArrows()

			codeMapArrowService.scale(new Vector3(1, 2, 3))

			expect(codeMapArrowService["arrows"][0].scale.x).toBe(1)
			expect(codeMapArrowService["arrows"][0].scale.y).toBe(2)
			expect(codeMapArrowService["arrows"][0].scale.z).toBe(3)
		})
	})
})
