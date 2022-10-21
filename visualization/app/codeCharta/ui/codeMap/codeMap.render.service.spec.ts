import { TestBed } from "@angular/core/testing"
import { CodeMapRenderService } from "./codeMap.render.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { CodeMapLabelService } from "./codeMap.label.service"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { Node, CodeMapNode, colorLabelOptions } from "../../codeCharta.model"
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
import { setState } from "../../state/store/state.actions"
import { setEdges } from "../../state/store/fileSettings/edges/edges.actions"
import { unfocusNode } from "../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { setShowMetricLabelNodeName } from "../../state/store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.actions"
import { setShowMetricLabelNameValue } from "../../state/store/appSettings/showMetricLabelNameValue/showMetricLabelNameValue.actions"
import { klona } from "klona"
import { ThreeStatsService } from "./threeViewer/threeStats.service"
import { setColorLabels } from "../../state/store/appSettings/colorLabels/colorLabels.actions"
import { nodeMetricDataSelector } from "../../state/selectors/accumulatedData/metricData/nodeMetricData.selector"
import { splitStateActions } from "../../state/store/state.splitter"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { Store } from "../../state/angular-redux/store"
import { State } from "../../state/angular-redux/state"

const mockedNodeMetricDataSelector = nodeMetricDataSelector as unknown as jest.Mock
jest.mock("../../state/selectors/accumulatedData/metricData/nodeMetricData.selector", () => ({
	nodeMetricDataSelector: jest.fn(),
	UNARY_METRIC: "unary"
}))

describe("codeMapRenderService", () => {
	let store: Store
	let state: State
	let codeMapRenderService: CodeMapRenderService
	let threeSceneService: ThreeSceneService
	let codeMapLabelService: CodeMapLabelService
	let codeMapArrowService: CodeMapArrowService
	let threeStatsService: ThreeStatsService
	let codeMapMouseEventService: CodeMapMouseEventService

	let map: CodeMapNode

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedThreeSceneService()
		withMockedCodeMapLabelService()
		withMockedCodeMapArrowService()
		withMockedStatsService()
		withMockedCodeMapMouseEventService()
	})

	function restartSystem() {
		store = TestBed.inject(Store)
		state = TestBed.inject(State)
		codeMapLabelService = TestBed.inject(CodeMapLabelService)
		codeMapMouseEventService = TestBed.inject(CodeMapMouseEventService)
		threeStatsService = TestBed.inject(ThreeStatsService)
		threeSceneService = TestBed.inject(ThreeSceneService)
		codeMapArrowService = TestBed.inject(CodeMapArrowService)
		codeMapMouseEventService["threeSceneService"] = threeSceneService

		map = klona(TEST_FILE_WITH_PATHS.map)
		NodeDecorator.decorateMap(map, { nodeMetricData: METRIC_DATA, edgeMetricData: [] }, [])
		NodeDecorator.decorateParentNodesWithAggregatedAttributes(map, false, DEFAULT_STATE.fileSettings.attributeTypes)
		for (const splittedAction of splitStateActions(setState(STATE))) {
			store.dispatch(splittedAction)
		}
		store.dispatch(unfocusNode())
		mockedNodeMetricDataSelector.mockImplementation(() => METRIC_DATA)
	}

	function rebuildService() {
		codeMapRenderService = new CodeMapRenderService(
			store,
			state,
			threeSceneService,
			codeMapLabelService,
			codeMapArrowService,
			threeStatsService,
			codeMapMouseEventService
		)
		codeMapRenderService["showCouplingArrows"] = jest.fn()
	}

	function withMockedCodeMapLabelService() {
		codeMapLabelService = codeMapRenderService["codeMapLabelService"] = jest.fn().mockReturnValue({
			scale: jest.fn(),
			clearLabels: jest.fn(),
			addLeafLabel: jest.fn()
		})()
	}

	function withMockedThreeSceneService() {
		threeSceneService = codeMapRenderService["threeSceneService"] = jest.fn().mockReturnValue({
			scaleHeight: jest.fn(),
			mapGeometry: jest.fn().mockReturnValue({
				scale: new Vector3(1, 2, 3)
			}),
			dispose: jest.fn(),
			resetLineHighlight: jest.fn(),
			resetLabel: jest.fn(),
			forceRerender: jest.fn(),
			setMapMesh: jest.fn()
		})()
	}

	function withMockedCodeMapMouseEventService() {
		codeMapMouseEventService = codeMapRenderService["codeMapMouseEventService"] = jest.fn().mockReturnValue({
			unhoverNode: jest.fn()
		})()
	}

	function withMockedCodeMapArrowService() {
		codeMapArrowService = codeMapRenderService["codeMapArrowService"] = jest.fn().mockReturnValue({
			scale: jest.fn(),
			clearArrows: jest.fn(),
			addEdgeArrows: jest.fn(),
			addEdgePreview: jest.fn(),
			arrows: [new Object3D()],
			threeSceneService
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
		it("should call all render specific methods", () => {
			codeMapRenderService["setNewMapMesh"] = jest.fn()
			codeMapRenderService["setLabels"] = jest.fn()
			codeMapRenderService["setArrows"] = jest.fn()
			codeMapRenderService["scaleMap"] = jest.fn()
			codeMapRenderService.render(map)

			const nodes = codeMapRenderService["getNodes"](map)

			expect(codeMapRenderService["setNewMapMesh"]).toHaveBeenCalledWith(nodes, expect.any(Array))
			expect(codeMapRenderService["setLabels"]).toHaveBeenCalled()
			expect(codeMapRenderService["setArrows"]).toHaveBeenCalled()
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
		it("should call codeMapMouseEventService.unhoverNode", () => {
			codeMapRenderService["scaleMap"]()

			expect(codeMapMouseEventService.unhoverNode).toHaveBeenCalledWith()
		})

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

		it("should call threeSceneService.clearLabels", () => {
			codeMapRenderService["scaleMap"]()

			expect(codeMapLabelService.clearLabels).toHaveBeenCalled()
		})
	})

	describe("setNewMapMesh", () => {
		it("should call threeSceneService.setMapMesh", () => {
			codeMapRenderService["setNewMapMesh"](TEST_NODES, TEST_NODES)

			expect(threeSceneService.setMapMesh).toHaveBeenCalled()
		})
	})

	describe("getNodes", () => {
		it("should get Nodes as array", () => {
			const sortedNodes: Node[] = codeMapRenderService["getNodes"](map)

			expect(sortedNodes).toMatchSnapshot()
		})
	})

	describe("setLabels", () => {
		let nodes: Node[]

		beforeEach(() => {
			nodes = TEST_NODES
		})

		it("should only call clearLabels for empty nodes", () => {
			codeMapRenderService["setLabels"]([])

			expect(codeMapLabelService.clearLabels).toHaveBeenCalled()
			expect(codeMapLabelService.addLeafLabel).not.toHaveBeenCalled()
		})

		it("should call codeMapLabelService.clearLabels", () => {
			codeMapRenderService["setLabels"](nodes)

			expect(codeMapLabelService.clearLabels).toHaveBeenCalled()
		})

		it("should call codeMapLabelService.addLeafLabel for each shown leaf label", () => {
			codeMapRenderService["setLabels"](nodes)

			expect(codeMapLabelService.addLeafLabel).toHaveBeenCalledTimes(2)
		})

		it("should not generate labels when showMetricLabelNodeName and showMetricLabelNameValue are both false", () => {
			store.dispatch(setShowMetricLabelNodeName(false))
			store.dispatch(setShowMetricLabelNameValue(false))

			codeMapRenderService["setLabels"](nodes)

			expect(codeMapLabelService.addLeafLabel).toHaveBeenCalledTimes(0)
		})

		it("should not generate labels for flattened nodes", () => {
			nodes[0].flat = true

			codeMapRenderService["getNodes"] = jest.fn().mockReturnValue(nodes)
			codeMapRenderService.render(null)

			expect(codeMapLabelService.addLeafLabel).toHaveBeenCalledTimes(2)
		})

		it("should generate labels for not-flattened nodes", () => {
			nodes[0].flat = false

			codeMapRenderService["getNodes"] = jest.fn().mockReturnValue(nodes)
			codeMapRenderService.render(null)

			expect(codeMapLabelService.addLeafLabel).toHaveBeenCalledTimes(4)
		})

		it("should generate labels for color if option is toggled on", () => {
			const colorLabelsNegative: colorLabelOptions = {
				positive: false,
				negative: true,
				neutral: false
			}

			store.dispatch(setColorLabels(colorLabelsNegative))
			codeMapRenderService["getNodesMatchingColorSelector"](COLOR_TEST_NODES)
			codeMapRenderService["setLabels"](COLOR_TEST_NODES)

			expect(codeMapLabelService.addLeafLabel).toHaveBeenCalledTimes(1)
		})

		it("should generate labels for multiple colors if corresponding options are toggled on", () => {
			const colorLabelsPosNeut: colorLabelOptions = {
				positive: true,
				negative: false,
				neutral: true
			}

			store.dispatch(setColorLabels(colorLabelsPosNeut))
			codeMapRenderService["getNodesMatchingColorSelector"](COLOR_TEST_NODES)
			codeMapRenderService["setLabels"](COLOR_TEST_NODES)

			expect(codeMapLabelService.addLeafLabel).toHaveBeenCalledTimes(2)
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
			store.dispatch(setEdges(VALID_EDGES))

			codeMapRenderService["setArrows"](sortedNodes)

			expect(codeMapArrowService["addEdgePreview"]).toHaveBeenCalledWith(sortedNodes)
		})
	})
})
