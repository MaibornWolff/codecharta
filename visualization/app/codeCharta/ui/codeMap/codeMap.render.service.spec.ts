import { TestBed } from "@angular/core/testing"
import { CodeMapRenderService } from "./codeMap.render.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { CodeMapLabelService } from "./codeMap.label.service"
import { CodeMapArrowService } from "./arrow/codeMap.arrow.service"
import { Node, CodeMapNode, ColorLabelOptions, CcState } from "../../codeCharta.model"
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
import { setShowMetricLabelNodeName } from "../../state/store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.actions"
import { setShowMetricLabelNameValue } from "../../state/store/appSettings/showMetricLabelNameValue/showMetricLabelNameValue.actions"
import { klona } from "klona"
import { ThreeStatsService } from "./threeViewer/threeStats.service"
import { setColorLabels } from "../../state/store/appSettings/colorLabels/colorLabels.actions"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { metricDataSelector } from "../../state/selectors/accumulatedData/metricData/metricData.selector"
import { State, Store, StoreModule } from "@ngrx/store"
import { appReducers, setStateMiddleware } from "../../state/store/state.manager"

const mockedMetricDataSelector = metricDataSelector as unknown as jest.Mock
jest.mock("../../state/selectors/accumulatedData/metricData/metricData.selector", () => ({
	metricDataSelector: jest.fn()
}))

describe("codeMapRenderService", () => {
	let store: Store<CcState>
	let state: State<CcState>
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
		TestBed.configureTestingModule({
			imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
		})
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
		store.dispatch(setState({ value: STATE }))
		mockedMetricDataSelector.mockImplementation(() => ({
			nodeMetricData: METRIC_DATA,
			edgeMetricData: []
		}))
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
			addEdgeMapBasedOnNodes: jest.fn(),
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
		})

		it("should call getNodesMatchingColorSelector", () => {
			codeMapRenderService["getNodesMatchingColorSelector"](COLOR_TEST_NODES)

			expect(codeMapRenderService["nodesByColor"].positive).toEqual([TEST_NODE_ROOT])
			expect(codeMapRenderService["nodesByColor"].neutral).toEqual([TEST_NODE_LEAF])
			expect(codeMapRenderService["nodesByColor"].negative).toEqual([INCOMING_NODE])
		})

		it("should call getNodesMatchingColorSelector and set all nodes to positive color when metric is unary", () => {
			store.dispatch(setState({ value: { ...STATE, dynamicSettings: { ...STATE.dynamicSettings, colorMetric: "unary" } } }))
			codeMapRenderService["getNodesMatchingColorSelector"](COLOR_TEST_NODES)

			expect(codeMapRenderService["nodesByColor"].positive).toEqual([TEST_NODE_ROOT, TEST_NODE_LEAF, INCOMING_NODE])
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
			store.dispatch(setShowMetricLabelNodeName({ value: false }))
			store.dispatch(setShowMetricLabelNameValue({ value: false }))

			codeMapRenderService["setLabels"](nodes)

			expect(codeMapLabelService.addLeafLabel).toHaveBeenCalledTimes(0)
		})

		it("should not generate labels for flattened nodes", () => {
			codeMapRenderService["getNodes"] = () => [{ ...TEST_NODE_ROOT, flat: true }]
			codeMapRenderService.render(null)

			expect(codeMapLabelService.addLeafLabel).toHaveBeenCalledTimes(0)
		})

		it("should generate labels for not-flattened nodes", () => {
			codeMapRenderService["getNodes"] = jest.fn().mockReturnValue(nodes)
			codeMapRenderService.render(null)

			expect(codeMapLabelService.addLeafLabel).toHaveBeenCalledTimes(2)
		})

		it("should generate labels for color if option is toggled on", () => {
			const colorLabelsNegative: ColorLabelOptions = {
				positive: false,
				negative: true,
				neutral: false
			}

			store.dispatch(setColorLabels({ value: colorLabelsNegative }))
			codeMapRenderService["getNodesMatchingColorSelector"](COLOR_TEST_NODES)
			codeMapRenderService["setLabels"](COLOR_TEST_NODES)

			expect(codeMapLabelService.addLeafLabel).toHaveBeenCalledTimes(1)
		})

		it("should generate labels for multiple colors if corresponding options are toggled on", () => {
			const colorLabelsPosNeut: ColorLabelOptions = {
				positive: true,
				negative: false,
				neutral: true
			}

			store.dispatch(setColorLabels({ value: colorLabelsPosNeut }))
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
			store.dispatch(setEdges({ value: VALID_EDGES }))

			codeMapRenderService["setArrows"](sortedNodes)

			expect(codeMapArrowService["addEdgeMapBasedOnNodes"]).toHaveBeenCalledWith(sortedNodes)
			expect(codeMapArrowService["addEdgePreview"]).toHaveBeenCalled()
		})
	})
})
