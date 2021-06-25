import "./codeMap.module"
import "../../codeCharta.module"
import { CodeMapRenderService } from "./codeMap.render.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { CodeMapLabelService } from "./codeMap.label.service"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { Node, CodeMapNode, State, colorLabelOptions } from "../../codeCharta.model"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import {
	COLOR_TEST_NODES,
	DEFAULT_STATE,
	INCOMING_NODE,
	METRIC_DATA,
	STATE,
	TEST_FILE_WITH_PATHS,
	TEST_NODE_LEAF,
	TEST_NODE_ROOT,
	TEST_NODES,
	VALID_EDGES
} from "../../util/dataMocks"
import { NodeDecorator } from "../../util/nodeDecorator"
import { Object3D, Vector3 } from "three"
import { StoreService } from "../../state/store.service"
import { setState } from "../../state/store/state.actions"
import { setEdges } from "../../state/store/fileSettings/edges/edges.actions"
import { unfocusNode } from "../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { setNodeMetricData } from "../../state/store/metricData/nodeMetricData/nodeMetricData.actions"
import { setShowMetricLabelNodeName } from "../../state/store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.actions"
import { setShowMetricLabelNameValue } from "../../state/store/appSettings/showMetricLabelNameValue/showMetricLabelNameValue.actions"
import { klona } from "klona"
import { IRootScopeService } from "angular"
import { ThreeStatsService } from "./threeViewer/threeStatsService"
import { ThreeUpdateCycleService } from "./threeViewer/threeUpdateCycleService"
import { setColorLabels } from "../../state/store/appSettings/colorLabels/colorLabels.actions"

describe("codeMapRenderService", () => {
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let codeMapRenderService: CodeMapRenderService
	let threeSceneService: ThreeSceneService
	let codeMapLabelService: CodeMapLabelService
	let codeMapArrowService: CodeMapArrowService
	let threeStatsService: ThreeStatsService
	let threeUpdateCycleService: ThreeUpdateCycleService

	let state: State
	let map: CodeMapNode

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedThreeSceneService()
		withMockedCodeMapLabelService()
		withMockedCodeMapArrowService()
		withMockedStatsService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		threeSceneService = getService<ThreeSceneService>("threeSceneService")
		codeMapLabelService = getService<CodeMapLabelService>("codeMapLabelService")
		codeMapArrowService = getService<CodeMapArrowService>("codeMapArrowService")
		threeStatsService = getService<ThreeStatsService>("threeStatsService")
		threeUpdateCycleService = getService<ThreeUpdateCycleService>("threeUpdateCycleService")

		state = klona(STATE)
		map = klona(TEST_FILE_WITH_PATHS.map)
		NodeDecorator.decorateMap(map, { nodeMetricData: METRIC_DATA, edgeMetricData: [] }, [])
		NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, false, DEFAULT_STATE.fileSettings.attributeTypes)
		storeService.dispatch(setState(state))
		storeService.dispatch(unfocusNode())
		storeService.dispatch(setNodeMetricData(METRIC_DATA))
	}

	function rebuildService() {
		codeMapRenderService = new CodeMapRenderService(
			$rootScope,
			storeService,
			threeSceneService,
			codeMapLabelService,
			codeMapArrowService,
			threeStatsService,
			threeUpdateCycleService
		)
		codeMapRenderService["showCouplingArrows"] = jest.fn()
	}

	function withMockedThreeSceneService() {
		threeSceneService = codeMapRenderService["threeSceneService"] = jest.fn().mockReturnValue({
			scaleHeight: jest.fn(),
			mapGeometry: jest.fn().mockReturnValue({
				scale: new Vector3(1, 2, 3)
			}),
			dispose: jest.fn(),
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
			addEdgePreview: jest.fn(),
			arrows: [new Object3D()]
		})()
	}

	function withMockedStatsService() {
		threeStatsService = codeMapRenderService["threeStatsService"] = jest.fn().mockReturnValue({
			resetPanels: jest.fn(),
			dispose: jest.fn()
		})()
	}

	describe("onIsLoadingFileChanged", () => {
		it("should call threeSceneService dispose", () => {
			codeMapRenderService["onIsLoadingFileChanged"](true)

			expect(threeSceneService.dispose).toHaveBeenCalledWith()
		})

		it("should call threeStatsService resetPanels", () => {
			codeMapRenderService["onIsLoadingFileChanged"](false)

			expect(threeStatsService.resetPanels).toHaveBeenCalledWith()
		})
	})

	describe("render", () => {
		let sortedNodes: Node[]
		beforeEach(() => {
			sortedNodes = codeMapRenderService["getSortedNodes"](map)
		})
		it("should call setNewMapMesh", () => {
			codeMapRenderService["setNewMapMesh"] = jest.fn().mockReturnValue(sortedNodes)
			codeMapRenderService.render(map)

			expect(codeMapRenderService["setNewMapMesh"]).toHaveBeenCalledWith(sortedNodes)
		})

		it("should call setLabels", () => {
			codeMapRenderService["setLabels"] = jest.fn().mockReturnValue(sortedNodes)
			codeMapRenderService.render(map)

			expect(codeMapRenderService["setLabels"]).toHaveBeenCalledWith(sortedNodes)
		})

		it("should call setArrows", () => {
			codeMapRenderService["setArrows"] = jest.fn().mockReturnValue(sortedNodes)
			codeMapRenderService.render(map)

			expect(codeMapRenderService["setArrows"]).toHaveBeenCalledWith(sortedNodes)
		})

		it("should call scaleMap", () => {
			codeMapRenderService["scaleMap"] = jest.fn()
			codeMapRenderService.render(map)

			expect(codeMapRenderService["scaleMap"]).toHaveBeenCalled()
		})

		it("should call getNodesMatchingColorSelector", () => {
			codeMapRenderService["getNodesMatchingColorSelector"](COLOR_TEST_NODES)

			expect(codeMapRenderService["nodesByColor"].positive).toEqual([TEST_NODE_ROOT])
			expect(codeMapRenderService["nodesByColor"].neutral).toEqual([TEST_NODE_LEAF])
			expect(codeMapRenderService["nodesByColor"].negative).toEqual([INCOMING_NODE])
		})
	})

	describe("scaleMap", () => {
		it("should call codeMapLabelService.scale", () => {
			codeMapRenderService["scaleMap"]()

			expect(codeMapLabelService.scale).toHaveBeenCalledWith()
		})

		it("should call codeMapArrowService.scale", () => {
			codeMapRenderService["scaleMap"]()

			expect(codeMapArrowService.scale).toHaveBeenCalledWith()
		})

		it("should call threeSceneService.scaleHeight", () => {
			codeMapRenderService["scaleMap"]()

			expect(threeSceneService.scaleHeight).toHaveBeenCalled()
		})
	})

	describe("setNewMapMesh", () => {
		it("should call threeSceneService.setMapMesh", () => {
			codeMapRenderService["setNewMapMesh"](TEST_NODES)

			expect(threeSceneService.setMapMesh).toHaveBeenCalled()
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

		it("should not generate labels when showMetricLabelNodeName and showMetricLabelNameValue are both false", () => {
			storeService.dispatch(setShowMetricLabelNodeName(false))
			storeService.dispatch(setShowMetricLabelNameValue(false))

			codeMapRenderService["setLabels"](sortedNodes)

			expect(codeMapLabelService.addLabel).toHaveBeenCalledTimes(0)
		})

		it("should not generate labels for flattened nodes", () => {
			sortedNodes[0].flat = true

			codeMapRenderService["getSortedNodes"] = jest.fn().mockReturnValue(sortedNodes)
			codeMapRenderService.render(null)

			expect(codeMapLabelService.addLabel).toHaveBeenCalledTimes(1)
		})

		it("should generate labels for color if option is toggled on", () => {
			const colorLabelsNegative: colorLabelOptions = {
				positive: false,
				negative: true,
				neutral: false
			}

			storeService.dispatch(setColorLabels(colorLabelsNegative))
			codeMapRenderService["getNodesMatchingColorSelector"](COLOR_TEST_NODES)
			codeMapRenderService["setLabels"](COLOR_TEST_NODES)

			expect(codeMapLabelService.addLabel).toHaveBeenCalledTimes(1)
		})

		it("should generate labels for multiple colors if corresponding options are toggled on", () => {
			const colorLabelsPosNeut: colorLabelOptions = {
				positive: true,
				negative: false,
				neutral: true
			}

			storeService.dispatch(setColorLabels(colorLabelsPosNeut))
			codeMapRenderService["getNodesMatchingColorSelector"](COLOR_TEST_NODES)
			codeMapRenderService["setLabels"](COLOR_TEST_NODES)

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

			expect(codeMapArrowService["addEdgePreview"]).toHaveBeenCalledWith(sortedNodes)
		})
	})
})
