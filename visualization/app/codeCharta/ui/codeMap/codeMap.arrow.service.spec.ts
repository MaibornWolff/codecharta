import "../../codeCharta.module"
import "./codeMap.module"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { Object3D, Vector3 } from "three"
import { Edge, EdgeVisibility, Node, Settings } from "../../codeCharta.model"
import { SETTINGS, TEST_NODE_LEAF, TEST_NODE_ROOT, VALID_EDGES } from "../../util/dataMocks"
import { IRootScopeService } from "angular"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { SettingsService } from "../../state/settingsService/settings.service"

describe("CodeMapArrowService", () => {
	let codeMapArrowService: CodeMapArrowService
	let threeSceneService: ThreeSceneService
	let $rootScope: IRootScopeService
	let settingsService: SettingsService

	let nodes: Node[]
	let edges: Edge[]
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

		nodes = JSON.parse(JSON.stringify([TEST_NODE_ROOT, TEST_NODE_LEAF]))
		edges = JSON.parse(JSON.stringify(VALID_EDGES))
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
			}
		})()
	}

	function withMockedSettingsService() {
		settingsService = codeMapArrowService["settingsService"] = jest.fn().mockReturnValue({
			getSettings: jest.fn().mockReturnValue(settings)
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
			CodeMapMouseEventService.subscribeToBuildingHoveredEvents = jest.fn()

			rebuildService()

			expect(CodeMapMouseEventService.subscribeToBuildingHoveredEvents).toHaveBeenCalledWith($rootScope, codeMapArrowService)
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

	describe("addEdgeArrows", () => {
		beforeEach(() => {
			codeMapArrowService.addArrow = jest.fn()
		})

		it("should call addArrow with origin and target node", () => {
			edges[0].toNodeName = "/root"
			edges[0].visible = EdgeVisibility.both

			codeMapArrowService.addEdgeArrows(nodes, edges)

			expect(codeMapArrowService.addArrow).toHaveBeenCalledWith(nodes[0], nodes[1], EdgeVisibility.both)
		})
	})

	describe("addArrow", () => {
		beforeEach(() => {
			nodes[0].incomingEdgePoint = new Vector3()
			nodes[0].outgoingEdgePoint = new Vector3()
		})

		it("should add outgoing and incoming arrow if node has a height attribute mentioned in renderSettings", () => {
			settings.dynamicSettings.heightMetric = "a"

			settingsService.getSettings = jest.fn().mockReturnValue(settings)

			codeMapArrowService.addArrow(nodes[0], nodes[0], EdgeVisibility.both)

			expect(codeMapArrowService["arrows"].length).toBe(2)
		})

		it("should insert one arrow, if we set the EdgeVisibility to from", () => {
			settings.dynamicSettings.heightMetric = "a"

			settingsService.getSettings = jest.fn().mockReturnValue(settings)

			codeMapArrowService.addArrow(nodes[0], nodes[0], EdgeVisibility.from)

			expect(codeMapArrowService["arrows"].length).toBe(1)
		})

		it("should insert one arrow, if we set the EdgeVisibility to to", () => {
			settings.dynamicSettings.heightMetric = "a"

			settingsService.getSettings = jest.fn().mockReturnValue(settings)

			codeMapArrowService.addArrow(nodes[0], nodes[0], EdgeVisibility.to)

			expect(codeMapArrowService["arrows"].length).toBe(1)
		})

		it("should't insert arrow, if we set the EdgeVisibility to none", () => {
			settings.dynamicSettings.heightMetric = "a"

			settingsService.getSettings = jest.fn().mockReturnValue(settings)

			codeMapArrowService.addArrow(nodes[0], nodes[0], EdgeVisibility.none)

			expect(codeMapArrowService["arrows"].length).toBe(0)
		})

		it("should not add arrows if node has not a height attribute mentioned in renderSettings", () => {
			nodes[0].attributes = { notsome: 0 }
			settings.dynamicSettings.heightMetric = "some"

			settingsService.getSettings = jest.fn().mockReturnValue(settings)

			codeMapArrowService.addArrow(nodes[0], nodes[0])

			expect(codeMapArrowService["arrows"].length).toBe(0)
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
