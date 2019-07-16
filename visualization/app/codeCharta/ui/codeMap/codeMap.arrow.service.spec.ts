import "../../codeCharta.module"
import "./codeMap.module"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { Object3D, Vector3 } from "three"
import { Edge, Settings } from "../../codeCharta.model"
import { SETTINGS, TEST_NODE_LEAF, TEST_NODE_ROOT, VALID_EDGES } from "../../util/dataMocks"
import { Node } from "../../codeCharta.model"

describe("CodeMapArrowService", () => {
	let codeMapArrowService: CodeMapArrowService
	let threeSceneService: ThreeSceneService
	let testRoot: Node
	let testLeaf: Node
	let testNodes: Node[]
	let testEdges: Edge[]
	let testSettings: Settings

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

		threeSceneService = getService<ThreeSceneService>("threeSceneService")

		testRoot = JSON.parse(JSON.stringify(TEST_NODE_ROOT))
		testLeaf = JSON.parse(JSON.stringify(TEST_NODE_LEAF))
		testNodes = JSON.parse(JSON.stringify([TEST_NODE_ROOT, TEST_NODE_LEAF]))
		testEdges = JSON.parse(JSON.stringify(VALID_EDGES))
		testSettings = JSON.parse(JSON.stringify(SETTINGS))
	}

	function rebuildService() {
		codeMapArrowService = new CodeMapArrowService(threeSceneService)
	}

	function withMockedThreeSceneService() {
		threeSceneService = codeMapArrowService["threeSceneService"] = jest.fn(() => {
			return {
				edgeArrows: {
					children: [],
					add: jest.fn()
				}
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

	describe("addEdgeArrowsFromOrigin", () => {
		beforeEach(() => {
			codeMapArrowService.addEdgeArrows = jest.fn()
		})

		it("should call addEdgesArrows with empty resEdges array", () => {
			codeMapArrowService.addEdgeArrowsFromOrigin(testRoot, testNodes, testEdges, testSettings)

			expect(codeMapArrowService.addEdgeArrows).toHaveBeenCalledWith(testNodes, [], testSettings)
		})

		it("should call addEdgesArrows with testLeaf in array", () => {
			codeMapArrowService.addEdgeArrowsFromOrigin(testLeaf, testNodes, testEdges, testSettings)

			expect(codeMapArrowService.addEdgeArrows).toHaveBeenCalledWith(testNodes, [testEdges[0]], testSettings)
		})
	})

	describe("addEdgeArrows", () => {
		beforeEach(() => {
			codeMapArrowService.addArrow = jest.fn()
		})

		it("should call addArrow with origin and target node", () => {
			testEdges[0].toNodeName = "/root"

			codeMapArrowService.addEdgeArrows(testNodes, testEdges, testSettings)

			expect(codeMapArrowService.addArrow).toHaveBeenCalledWith(testNodes[0], testNodes[1], testSettings)
		})
	})

	describe("addArrow", () => {
		it("addArrow should add arrow if node has a height attribute mentioned in renderSettings", () => {
			testSettings.dynamicSettings.heightMetric = "a"

			codeMapArrowService.addArrow(testNodes[0], testNodes[0], testSettings)

			expect(codeMapArrowService["arrows"].length).toBe(1)
		})

		it("addArrow should not add arrow if node has not a height attribute mentioned in renderSettings", () => {
			testNodes[0].attributes = { notsome: 0 }
			testSettings.dynamicSettings.heightMetric = "some"

			codeMapArrowService.addArrow(testNodes[0], testNodes[0], testSettings)

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
