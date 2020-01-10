import "../../codeCharta.module"
import "./codeMap.module"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { Object3D, Vector3 } from "three"
import { Edge, EdgeVisibility, Node } from "../../codeCharta.model"
import { TEST_NODE_LEAF, TEST_NODE_ROOT, VALID_EDGES } from "../../util/dataMocks"
import { IRootScopeService } from "angular"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { StoreService } from "../../state/store.service"
import _ from "lodash"
import { setHeightMetric } from "../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { setScaling } from "../../state/store/appSettings/scaling/scaling.actions"

describe("CodeMapArrowService", () => {
	let codeMapArrowService: CodeMapArrowService
	let storeService: StoreService
	let threeSceneService: ThreeSceneService
	let $rootScope: IRootScopeService

	let nodes: Node[]
	let edges: Edge[]

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedThreeSceneService()
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		threeSceneService = getService<ThreeSceneService>("threeSceneService")

		nodes = _.cloneDeep([TEST_NODE_ROOT, TEST_NODE_LEAF])
		edges = _.cloneDeep(VALID_EDGES)
	}

	function rebuildService() {
		codeMapArrowService = new CodeMapArrowService($rootScope, storeService, threeSceneService)
	}

	function withMockedThreeSceneService() {
		threeSceneService = codeMapArrowService["threeSceneService"] = jest.fn().mockReturnValue({
			edgeArrows: {
				children: [],
				add: jest.fn()
			}
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
			storeService.dispatch(setHeightMetric("a"))

			codeMapArrowService.addArrow(nodes[0], nodes[0], EdgeVisibility.both)

			expect(codeMapArrowService["arrows"].length).toBe(2)
		})

		it("should insert one arrow, if we set the EdgeVisibility to from", () => {
			storeService.dispatch(setHeightMetric("a"))

			codeMapArrowService.addArrow(nodes[0], nodes[0], EdgeVisibility.from)

			expect(codeMapArrowService["arrows"].length).toBe(1)
		})

		it("should insert one arrow, if we set the EdgeVisibility to to", () => {
			storeService.dispatch(setHeightMetric("a"))

			codeMapArrowService.addArrow(nodes[0], nodes[0], EdgeVisibility.to)

			expect(codeMapArrowService["arrows"].length).toBe(1)
		})

		it("should't insert arrow, if we set the EdgeVisibility to none", () => {
			storeService.dispatch(setHeightMetric("a"))

			codeMapArrowService.addArrow(nodes[0], nodes[0], EdgeVisibility.none)

			expect(codeMapArrowService["arrows"].length).toBe(0)
		})

		it("should not add arrows if node has not a height attribute mentioned in renderSettings", () => {
			storeService.dispatch(setHeightMetric("some"))
			nodes[0].attributes = { notsome: 0 }

			codeMapArrowService.addArrow(nodes[0], nodes[0])

			expect(codeMapArrowService["arrows"].length).toBe(0)
		})
	})

	describe("scale", () => {
		it("should set the scale of all arrows to x, y and z", () => {
			storeService.dispatch(setScaling(new Vector3(1, 2, 3)))
			setupArrows()

			codeMapArrowService.scale()

			expect(codeMapArrowService["arrows"][0].scale.x).toBe(1)
			expect(codeMapArrowService["arrows"][0].scale.y).toBe(2)
			expect(codeMapArrowService["arrows"][0].scale.z).toBe(3)
		})
	})
})
