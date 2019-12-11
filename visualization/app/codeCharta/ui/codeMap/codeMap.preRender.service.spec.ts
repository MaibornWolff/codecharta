import "./codeMap.module"
import "../../codeCharta.module"
import { CodeMapRenderService } from "./codeMap.render.service"
import { CCFile, CodeMapNode } from "../../codeCharta.model"
import { ThreeOrbitControlsService } from "./threeViewer/threeOrbitControlsService"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { FileStateService } from "../../state/fileState.service"
import { MetricService } from "../../state/metric.service"
import { TEST_FILE_WITH_PATHS, METRIC_DATA, VALID_NODE, withMockedEventMethods } from "../../util/dataMocks"
import { CodeMapPreRenderService } from "./codeMap.preRender.service"
import { LoadingStatusService } from "../../state/loadingStatus.service"
import { EdgeMetricDataService } from "../../state/edgeMetricData.service"
import { NodeDecorator } from "../../util/nodeDecorator"
import _ from "lodash"
import { StoreService } from "../../state/store.service"
import { ScalingService } from "../../state/store/appSettings/scaling/scaling.service"

describe("codeMapPreRenderService", () => {
	let codeMapPreRenderService: CodeMapPreRenderService
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let fileStateService: FileStateService
	let threeOrbitControlsService: ThreeOrbitControlsService
	let codeMapRenderService: CodeMapRenderService
	let loadingStatusService: LoadingStatusService
	let edgeMetricDataService: EdgeMetricDataService

	let file: CCFile

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods($rootScope)
		withMockedThreeOrbitControlsService()
		withMockedLoadingStatusService()
		withMockedCodeMapRenderService()
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		fileStateService = getService<FileStateService>("fileStateService")
		threeOrbitControlsService = getService<ThreeOrbitControlsService>("threeOrbitControlsService")
		codeMapRenderService = getService<CodeMapRenderService>("codeMapRenderService")
		edgeMetricDataService = getService<EdgeMetricDataService>("edgeMetricDataService")

		file = _.cloneDeep(TEST_FILE_WITH_PATHS)
	}

	function rebuildService() {
		codeMapPreRenderService = new CodeMapPreRenderService(
			$rootScope,
			storeService,
			fileStateService,
			threeOrbitControlsService,
			codeMapRenderService,
			loadingStatusService,
			edgeMetricDataService
		)
	}

	function withMockedThreeOrbitControlsService() {
		threeOrbitControlsService = codeMapPreRenderService["threeOrbitControlsService"] = jest.fn().mockReturnValue({
			autoFitTo: jest.fn()
		})()
	}

	function withMockedCodeMapRenderService() {
		codeMapRenderService = codeMapPreRenderService["codeMapRenderService"] = jest.fn().mockReturnValue({
			render: jest.fn()
		})()
	}

	function withMockedLoadingStatusService() {
		loadingStatusService = codeMapPreRenderService["loadingStatusService"] = jest.fn().mockReturnValue({
			updateLoadingMapFlag: jest.fn(),
			updateLoadingFileFlag: jest.fn(),
			isLoadingNewFile: jest.fn()
		})()
	}

	function withLastRenderData() {
		codeMapPreRenderService["lastRender"].fileMeta = { fileName: "foo", apiVersion: "1.0", projectName: "bar" }
		codeMapPreRenderService["lastRender"].map = VALID_NODE
		codeMapPreRenderService["lastRender"].fileStates = []
		codeMapPreRenderService["lastRender"].metricData = METRIC_DATA
	}

	describe("constructor", () => {
		beforeEach(() => {
			MetricService.subscribe = jest.fn()
			StoreService.subscribe = jest.fn()
			ScalingService.subscribe = jest.fn()
		})

		it("should call subscribe for MetricService", () => {
			rebuildService()

			expect(MetricService.subscribe).toHaveBeenCalledWith($rootScope, codeMapPreRenderService)
		})

		it("should call subscribe for StoreService", () => {
			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, codeMapPreRenderService)
		})

		it("should call subscribe for ScalingService", () => {
			rebuildService()

			expect(ScalingService.subscribe).toHaveBeenCalledWith($rootScope, codeMapPreRenderService)
		})
	})

	describe("getRenderMap", () => {
		it("should return lastRender.map", () => {
			codeMapPreRenderService["lastRender"].map = file.map

			const result = codeMapPreRenderService.getRenderMap()

			expect(result).toEqual(file.map)
		})
	})

	describe("onStoreChanged", () => {
		it("should call codeMapRenderService.render", () => {
			withLastRenderData()

			codeMapPreRenderService.onStoreChanged("SOME_ACTION")

			expect(codeMapRenderService.render).toHaveBeenCalled()
		})
	})

	describe("subscribe", () => {
		it("should call $on", () => {
			CodeMapPreRenderService.subscribe($rootScope, undefined)

			expect($rootScope.$on).toHaveBeenCalled()
		})
	})

	describe("on metric data added", () => {
		const originalDecorateMap = NodeDecorator.decorateMap

		it("should set metric data of last render", () => {
			codeMapPreRenderService.onMetricDataAdded(METRIC_DATA)

			expect(codeMapPreRenderService["lastRender"].metricData).toEqual(METRIC_DATA)
		})

		it("should call Node Decorator functions if all required data is available", () => {
			NodeDecorator.decorateMap = jest.fn()
			NodeDecorator.decorateParentNodesWithSumAttributes = jest.fn()
			withLastRenderData()

			codeMapPreRenderService.onMetricDataAdded(METRIC_DATA)

			expect(NodeDecorator.decorateMap).toHaveBeenCalledWith(VALID_NODE, codeMapPreRenderService["lastRender"].fileMeta, METRIC_DATA)
			expect(NodeDecorator.decorateParentNodesWithSumAttributes).toHaveBeenCalled()
		})

		it("should retrieve correct edge metrics for leaves", () => {
			NodeDecorator.decorateMap = originalDecorateMap
			edgeMetricDataService.getMetricValuesForNode = jest.fn((node: d3.HierarchyNode<CodeMapNode>) => {
				if (node.data.name === "big leaf") {
					return new Map().set("metric1", { incoming: 1, outgoing: 2 })
				} else {
					return new Map()
				}
			})
			withLastRenderData()

			codeMapPreRenderService.onMetricDataAdded(METRIC_DATA)

			const rootChildren = codeMapPreRenderService["lastRender"].map.children
			expect(rootChildren.find(x => x.name == "big leaf").edgeAttributes).toEqual({ metric1: { incoming: 1, outgoing: 2 } })
		})
	})
})
