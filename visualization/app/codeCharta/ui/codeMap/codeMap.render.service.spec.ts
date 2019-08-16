import "./codeMap.module"
import "../../codeCharta.module"
import { CodeMapRenderService } from "./codeMap.render.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { CodeMapLabelService } from "./codeMap.label.service"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { Settings, Node, MetricData, CodeMapNode, FileMeta, FileState } from "../../codeCharta.model"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { FILE_STATES, METRIC_DATA, SETTINGS, TEST_FILE_WITH_PATHS, TEST_NODES, VALID_EDGES } from "../../util/dataMocks"
import { RenderData } from "./codeMap.preRender.service"
import * as _ from "lodash"
import { NodeDecorator } from "../../util/nodeDecorator"
import { Vector3 } from "three"
import * as THREE from "three"

describe("codeMapRenderService", () => {
	let codeMapRenderService: CodeMapRenderService
	let threeSceneService: ThreeSceneService
	let codeMapLabelService: CodeMapLabelService
	let codeMapArrowService: CodeMapArrowService

	let settings: Settings
	let map: CodeMapNode
	let metricData: MetricData[]
	let fileMeta: FileMeta
	let fileStates: FileState[]

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedThreeSceneService()
		withMockedCodeMapLabelService()
		withMockedCodeMapArrowService()
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap")

		threeSceneService = getService<ThreeSceneService>("threeSceneService")
		codeMapLabelService = getService<CodeMapLabelService>("codeMapLabelService")
		codeMapArrowService = getService<CodeMapArrowService>("codeMapArrowService")

		fileMeta = _.cloneDeep(TEST_FILE_WITH_PATHS.fileMeta)
		settings = _.cloneDeep(SETTINGS)
		metricData = _.cloneDeep(METRIC_DATA)
		fileStates = FILE_STATES
		map = NodeDecorator.decorateMap(_.cloneDeep(TEST_FILE_WITH_PATHS.map), fileMeta, [], metricData)
	}

	function rebuildService() {
		codeMapRenderService = new CodeMapRenderService(threeSceneService, codeMapLabelService, codeMapArrowService)
		codeMapRenderService["showCouplingArrows"] = jest.fn()
	}

	function withMockedThreeSceneService() {
		threeSceneService = codeMapRenderService["threeSceneService"] = jest.fn().mockReturnValue({
			scale: jest.fn(),
			mapGeometry: jest.fn().mockReturnValue({
				scale: new Vector3(1, 2, 3)
			}),
			setMapMesh: jest.fn()
		})()
	}

	function withMockedCodeMapLabelService() {
		codeMapLabelService = codeMapRenderService["codeMapLabelService"] = jest.fn().mockReturnValue({
			scale: jest.fn(),
			clearLabels: jest.fn(),
			addLabel: jest.fn()
		})()
	}

	function withMockedCodeMapArrowService() {
		codeMapArrowService = codeMapRenderService["codeMapArrowService"] = jest.fn().mockReturnValue({
			scale: jest.fn(),
			clearArrows: jest.fn(),
			addEdgeArrows: jest.fn(),
			arrows: [new THREE.Object3D()]
		})()
	}

	describe("setNewMapMesh", () => {
		it("should call threeSceneService.scale", () => {
			const sortedNodes: Node[] = TEST_NODES
			const renderData: RenderData = {
				map: map,
				settings: settings,
				metricData: metricData,
				fileStates: fileStates,
				fileMeta: fileMeta
			}

			codeMapRenderService["setNewMapMesh"](sortedNodes, renderData.settings, renderData.fileStates)

			expect(threeSceneService.setMapMesh).toHaveBeenCalled()
		})
	})

	describe("scaleMap", () => {
		let scale: Vector3
		let mapSize: number

		beforeEach(() => {
			scale = new Vector3(1, 2, 3)
			mapSize = 500
		})

		it("should call threeSceneService.scale", () => {
			codeMapRenderService["scaleMap"](scale, mapSize)

			expect(threeSceneService.scale).toHaveBeenCalledWith(scale, mapSize)
		})

		it("should call codeMapLabelService.scale", () => {
			codeMapRenderService["scaleMap"](scale, mapSize)

			expect(codeMapLabelService.scale).toHaveBeenCalledWith(scale)
		})

		it("should call codeMapArrowService.scale", () => {
			codeMapRenderService["scaleMap"](scale, mapSize)

			expect(codeMapArrowService.scale).toHaveBeenCalledWith(scale)
		})
	})

	describe("getSortedNodes", () => {
		it("should get sorted Nodes as array", () => {
			const renderData: RenderData = {
				map: map,
				settings: settings,
				metricData: metricData,
				fileStates: null,
				fileMeta: null
			}

			const sortedNodes: Node[] = codeMapRenderService["getSortedNodes"](renderData)

			expect(sortedNodes).toMatchSnapshot()
		})
	})

	describe("setLabels", () => {
		let sortedNodes: Node[]

		beforeEach(() => {
			sortedNodes = TEST_NODES
		})

		it("should call codeMapLabelService.clearLabels", () => {
			codeMapRenderService["setLabels"](sortedNodes, settings)

			expect(codeMapLabelService.clearLabels).toHaveBeenCalled()
		})

		it("should call codeMapLabelService.addLabels for each shown leaf label", () => {
			codeMapRenderService["setLabels"](sortedNodes, settings)

			expect(codeMapLabelService.addLabel).toHaveBeenCalledTimes(2)
		})
	})

	describe("setArrows", () => {
		let sortedNodes: Node[]

		beforeEach(() => {
			sortedNodes = TEST_NODES
		})

		it("should call codeMapArrowService.clearArrows", () => {
			codeMapRenderService["setArrows"](sortedNodes, settings)

			expect(codeMapArrowService.clearArrows).toHaveBeenCalled()
		})

		it("should call codeMapArrowService.addEdgeArrows", () => {
			settings.fileSettings.edges = VALID_EDGES
			settings.fileSettings.edges.forEach(x => (x.visible = true))

			codeMapRenderService["setArrows"](sortedNodes, settings)

			expect(codeMapArrowService["addEdgeArrows"]).toHaveBeenCalledWith(sortedNodes, settings.fileSettings.edges)
		})
	})

	describe("showAllOrOnlyFocusedNode", () => {
		it("should show focused node only", () => {
			const bigLeaf = map.children[0]
			const smallLeaf = map.children[1].children[0]
			const otherSmallLeaf = map.children[1].children[1]

			settings.dynamicSettings.focusedNodePath = smallLeaf.path

			codeMapRenderService["showAllOrOnlyFocusedNode"](map, settings)

			expect(map.visible).toBeFalsy()
			expect(bigLeaf.visible).toBeFalsy()
			expect(smallLeaf.visible).toBeTruthy()
			expect(otherSmallLeaf.visible).toBeFalsy()
		})

		it("should show all nodes", () => {
			const bigLeaf = map.children[0]
			const smallLeaf = map.children[1].children[0]
			const otherSmallLeaf = map.children[1].children[1]

			settings.dynamicSettings.focusedNodePath = ""

			codeMapRenderService["showAllOrOnlyFocusedNode"](map, settings)

			expect(map.visible).toBeTruthy()
			expect(bigLeaf.visible).toBeTruthy()
			expect(smallLeaf.visible).toBeTruthy()
			expect(otherSmallLeaf.visible).toBeTruthy()
		})
	})
})
