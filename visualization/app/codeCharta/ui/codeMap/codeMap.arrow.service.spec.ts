import "../../codeCharta.module"
import "./codeMap.module"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { Object3D, Vector3 } from "three"
import { Edge, Settings } from "../../codeCharta.model"
import { SETTINGS, TEST_NODE_LEAF, TEST_NODE_ROOT, VALID_EDGES } from "../../util/dataMocks"
import { Node } from "../../codeCharta.model"
import { SettingsService } from "../../state/settings.service"
import { IRootScopeService } from "angular"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"

describe("CodeMapArrowService", () => {
	let codeMapArrowService: CodeMapArrowService
	let threeSceneService: ThreeSceneService
	let $rootScope: IRootScopeService
	let settingsService: SettingsService

	let root: Node
	let leaf: Node
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

		root = JSON.parse(JSON.stringify(TEST_NODE_ROOT))
		leaf = JSON.parse(JSON.stringify(TEST_NODE_LEAF))
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

			codeMapArrowService.addEdgeArrows(nodes, edges)

			expect(codeMapArrowService.addArrow).toHaveBeenCalledWith(nodes[0], nodes[1])
		})
	})

	describe("addArrow", () => {
		it("should add outgoing and incoming arrow if node has a height attribute mentioned in renderSettings", () => {
			settings.dynamicSettings.heightMetric = "a"

			settingsService.getSettings = jest.fn().mockReturnValue(settings)

			codeMapArrowService.addArrow(nodes[0], nodes[0])

			expect(codeMapArrowService["arrows"].length).toBe(2)
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
