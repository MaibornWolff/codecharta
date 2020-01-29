import "./codeMap.module"
import "../../codeCharta.module"
import { CodeMapRenderService } from "./codeMap.render.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { CodeMapLabelService } from "./codeMap.label.service"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { Node, MetricData, CodeMapNode, FileMeta, FileState, State } from "../../codeCharta.model"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { FILE_STATES, METRIC_DATA, STATE, TEST_FILE_WITH_PATHS, TEST_NODES, VALID_EDGES } from "../../util/dataMocks"
import * as _ from "lodash"
import { NodeDecorator } from "../../util/nodeDecorator"
import { Vector3 } from "three"
import * as THREE from "three"
import { StoreService } from "../../state/store.service"
import { setScaling } from "../../state/store/appSettings/scaling/scaling.actions"
import { setState } from "../../state/store/state.actions"
import { setEdges } from "../../state/store/fileSettings/edges/edges.actions"
import { focusNode, unfocusNode } from "../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { FileStateService } from "../../state/fileState.service"
import { MetricService } from "../../state/metric.service"

describe("codeMapRenderService", () => {
	let storeService: StoreService
	let fileStateService: FileStateService
	let metricService: MetricService
	let codeMapRenderService: CodeMapRenderService
	let threeSceneService: ThreeSceneService
	let codeMapLabelService: CodeMapLabelService
	let codeMapArrowService: CodeMapArrowService

	let state: State
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
		withMockedFileStateService()
		withMockedMetricService()
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap")

		storeService = getService<StoreService>("storeService")
		fileStateService = getService<FileStateService>("fileStateService")
		metricService = getService<MetricService>("metricService")
		threeSceneService = getService<ThreeSceneService>("threeSceneService")
		codeMapLabelService = getService<CodeMapLabelService>("codeMapLabelService")
		codeMapArrowService = getService<CodeMapArrowService>("codeMapArrowService")

		fileMeta = _.cloneDeep(TEST_FILE_WITH_PATHS.fileMeta)
		state = _.cloneDeep(STATE)
		metricData = _.cloneDeep(METRIC_DATA)
		fileStates = _.cloneDeep(FILE_STATES)
		map = _.cloneDeep(TEST_FILE_WITH_PATHS.map)
		NodeDecorator.decorateMap(map, fileMeta, metricData)
		storeService.dispatch(setState(state))
	}

	function rebuildService() {
		codeMapRenderService = new CodeMapRenderService(
			storeService,
			fileStateService,
			metricService,
			threeSceneService,
			codeMapLabelService,
			codeMapArrowService
		)
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

	function withMockedFileStateService() {
		fileStateService = codeMapRenderService["fileStateService"] = jest.fn().mockReturnValue({
			getFileStates: jest.fn().mockReturnValue(fileStates),
			isDeltaState: jest.fn().mockReturnValue(false)
		})()
	}

	function withMockedMetricService() {
		metricService = codeMapRenderService["metricService"] = jest.fn().mockReturnValue({
			getMetricData: jest.fn().mockReturnValue(metricData)
		})()
	}

	describe("setNewMapMesh", () => {
		it("should call threeSceneService.scale", () => {
			const sortedNodes: Node[] = TEST_NODES

			codeMapRenderService["setNewMapMesh"](sortedNodes)

			expect(threeSceneService.setMapMesh).toHaveBeenCalled()
		})
	})

	describe("scaleMap", () => {
		let scaling: Vector3
		let mapSize: number

		beforeEach(() => {
			scaling = new Vector3(1, 2, 3)
			mapSize = 250
		})

		it("should call threeSceneService.scale", () => {
			storeService.dispatch(setScaling(scaling))

			codeMapRenderService["scaleMap"]()

			expect(threeSceneService.scale).toHaveBeenCalledWith(scaling, mapSize)
		})

		it("should call codeMapLabelService.scale", () => {
			storeService.dispatch(setScaling(scaling))

			codeMapRenderService["scaleMap"]()

			expect(codeMapLabelService.scale).toHaveBeenCalledWith()
		})

		it("should call codeMapArrowService.scale", () => {
			storeService.dispatch(setScaling(scaling))

			codeMapRenderService["scaleMap"]()

			expect(codeMapArrowService.scale).toHaveBeenCalledWith()
		})
	})

	describe("getSortedNodes", () => {
		it("should get sorted Nodes as array", () => {
			const sortedNodes: Node[] = codeMapRenderService["getSortedNodes"](map)

			expect(sortedNodes).toMatchSnapshot()
		})
	})

	describe("setLabels", () => {
		let sortedNodes: Node[]

		beforeEach(() => {
			sortedNodes = TEST_NODES
		})

		it("should call codeMapLabelService.clearLabels", () => {
			codeMapRenderService["setLabels"](sortedNodes)

			expect(codeMapLabelService.clearLabels).toHaveBeenCalled()
		})

		it("should call codeMapLabelService.addLabels for each shown leaf label", () => {
			codeMapRenderService["setLabels"](sortedNodes)

			expect(codeMapLabelService.addLabel).toHaveBeenCalledTimes(2)
		})
	})

	describe("setArrows", () => {
		let sortedNodes: Node[]

		beforeEach(() => {
			sortedNodes = TEST_NODES
			codeMapArrowService.clearArrows = jest.fn()
			codeMapArrowService["addEdgePreview"] = jest.fn()
		})

		it("should call codeMapArrowService.clearArrows", () => {
			codeMapRenderService["setArrows"](sortedNodes)

			expect(codeMapArrowService.clearArrows).toHaveBeenCalled()
		})

		it("should call codeMapArrowService.addEdgeArrows", () => {
			storeService.dispatch(setEdges(VALID_EDGES))

			codeMapRenderService["setArrows"](sortedNodes)

			expect(codeMapArrowService["addEdgePreview"]).toHaveBeenCalledWith(sortedNodes, storeService.getState().fileSettings.edges)
		})
	})

	describe("showAllOrOnlyFocusedNode", () => {
		it("should show focused node only", () => {
			const bigLeaf = map.children[0]
			const smallLeaf = map.children[1].children[0]
			const otherSmallLeaf = map.children[1].children[1]
			storeService.dispatch(focusNode(smallLeaf.path))

			codeMapRenderService["showAllOrOnlyFocusedNode"](map)

			expect(map.visible).toBeFalsy()
			expect(bigLeaf.visible).toBeFalsy()
			expect(smallLeaf.visible).toBeTruthy()
			expect(otherSmallLeaf.visible).toBeFalsy()
		})

		it("should show all nodes", () => {
			const bigLeaf = map.children[0]
			const smallLeaf = map.children[1].children[0]
			const otherSmallLeaf = map.children[1].children[1]
			storeService.dispatch(unfocusNode())

			codeMapRenderService["showAllOrOnlyFocusedNode"](map)

			expect(map.visible).toBeTruthy()
			expect(bigLeaf.visible).toBeTruthy()
			expect(smallLeaf.visible).toBeTruthy()
			expect(otherSmallLeaf.visible).toBeTruthy()
		})
	})
})
