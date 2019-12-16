import "./codeMap.module"
import "../../codeCharta.module"
import { CodeMapRenderService } from "./codeMap.render.service"
import { CCFile, Settings, CodeMapNode } from "../../codeCharta.model"
import { ThreeOrbitControlsService } from "./threeViewer/threeOrbitControlsService"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { FileStateService } from "../../state/fileState.service"
import { MetricService } from "../../state/metric.service"
import { SETTINGS, TEST_FILE_WITH_PATHS, METRIC_DATA, VALID_NODE, withMockedEventMethods } from "../../util/dataMocks"
import { CodeMapPreRenderService } from "./codeMap.preRender.service"
import { LoadingStatusService } from "../../state/loadingStatus.service"
import { EdgeMetricDataService } from "../../state/edgeMetricData.service"
import { NodeDecorator } from "../../util/nodeDecorator"
import _ from "lodash"
import { StoreService } from "../../state/store.service"

describe("codeMapPreRenderService", () => {
	let codeMapPreRenderService: CodeMapPreRenderService
	let $rootScope: IRootScopeService
	let threeOrbitControlsService: ThreeOrbitControlsService
	let codeMapRenderService: CodeMapRenderService
	let loadingStatusService: LoadingStatusService
	let edgeMetricDataService: EdgeMetricDataService
	let storeService: StoreService

	let settings: Settings
	let file: CCFile

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods($rootScope)
		withMockedThreeOrbitControlsService()
		withMockedLoadingStatusService()
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap")

		$rootScope = getService<IRootScopeService>("$rootScope")
		threeOrbitControlsService = getService<ThreeOrbitControlsService>("threeOrbitControlsService")
		codeMapRenderService = getService<CodeMapRenderService>("codeMapRenderService")
		edgeMetricDataService = getService<EdgeMetricDataService>("edgeMetricDataService")
		storeService = getService<StoreService>("storeService")

		settings = _.cloneDeep(SETTINGS)
		file = _.cloneDeep(TEST_FILE_WITH_PATHS)
	}

	function rebuildService() {
		codeMapPreRenderService = new CodeMapPreRenderService(
			$rootScope,
			threeOrbitControlsService,
			codeMapRenderService,
			loadingStatusService,
			edgeMetricDataService,
			storeService
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
			updateLoadingFileFlag: jest.fn()
		})()
	}

	function withLastRenderData() {
		codeMapPreRenderService["lastRender"].settings = { fileSettings: { blacklist: [] } } as Settings
		const fileMeta = { fileName: "foo", apiVersion: "1.0", projectName: "bar" }
		codeMapPreRenderService["lastRender"].fileMeta = fileMeta
		codeMapPreRenderService["lastRender"].map = VALID_NODE
		codeMapPreRenderService["lastRender"].fileStates = []
	}

	describe("constructor", () => {
		beforeEach(() => {
			FileStateService.subscribe = jest.fn()
			MetricService.subscribe = jest.fn()
		})

		it("should call subscribe for FileStateService", () => {
			rebuildService()

			expect(FileStateService.subscribe).toHaveBeenCalledWith($rootScope, codeMapPreRenderService)
		})

		it("should call subscribe for MetricService", () => {
			rebuildService()

			expect(MetricService.subscribe).toHaveBeenCalledWith($rootScope, codeMapPreRenderService)
		})
	})

	describe("getRenderMap", () => {
		it("should return lastRender.map", () => {
			codeMapPreRenderService["lastRender"].map = file.map

			const result = codeMapPreRenderService.getRenderMap()

			expect(result).toEqual(file.map)
		})
	})

	describe("onSettingsChanged", () => {
		it("should update lastRender.settings", () => {
			codeMapPreRenderService.onSettingsChanged(settings, undefined)

			expect(codeMapPreRenderService["lastRender"].settings).toEqual(settings)
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

		it("should not decorate map without blacklist", () => {
			NodeDecorator.decorateMap = jest.fn()

			codeMapPreRenderService.onMetricDataAdded(METRIC_DATA)

			expect(NodeDecorator.decorateMap).not.toHaveBeenCalled()
		})

		it("should call Node Decorator functions if all required data is available", () => {
			NodeDecorator.decorateMap = jest.fn()
			NodeDecorator.decorateParentNodesWithSumAttributes = jest.fn()
			const fileMeta = { fileName: "foo", apiVersion: "1.0", projectName: "bar" }
			withLastRenderData()
			withMockedCodeMapRenderService()

			codeMapPreRenderService.onMetricDataAdded(METRIC_DATA)

			expect(NodeDecorator.decorateMap).toHaveBeenCalledWith(VALID_NODE, fileMeta, METRIC_DATA)
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
			withMockedCodeMapRenderService()

			codeMapPreRenderService.onMetricDataAdded(METRIC_DATA)

			const rootChildren = codeMapPreRenderService["lastRender"].map.children
			expect(rootChildren.find(x => x.name == "big leaf").edgeAttributes).toEqual({ metric1: { incoming: 1, outgoing: 2 } })
		})
	})
})
