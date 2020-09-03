import "./codeMap.module"
import "../../codeCharta.module"
import { CodeMapRenderService } from "./codeMap.render.service"
import { BlacklistType, CodeMapNode, FileMeta } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { STATE, TEST_DELTA_MAP_A, TEST_DELTA_MAP_B, withMockedEventMethods } from "../../util/dataMocks"
import { CodeMapPreRenderService } from "./codeMap.preRender.service"
import { NodeDecorator } from "../../util/nodeDecorator"
import _ from "lodash"
import { StoreService } from "../../state/store.service"
import { ScalingService } from "../../state/store/appSettings/scaling/scaling.service"
import { setDynamicSettings } from "../../state/store/dynamicSettings/dynamicSettings.actions"
import { ScalingActions } from "../../state/store/appSettings/scaling/scaling.actions"
import { IsLoadingMapActions } from "../../state/store/appSettings/isLoadingMap/isLoadingMap.actions"
import { addFile, resetFiles, setMultiple, setSingle } from "../../state/store/files/files.actions"
import { addBlacklistItem, BlacklistActions, setBlacklist } from "../../state/store/fileSettings/blacklist/blacklist.actions"
import { hierarchy } from "d3"
import { NodeMetricDataService } from "../../state/store/metricData/nodeMetricData/nodeMetricData.service"
import { EdgeMetricDataService } from "../../state/store/metricData/edgeMetricData/edgeMetricData.service"
import { MetricDataService } from "../../state/store/metricData/metricData.service"
import { calculateNewNodeMetricData } from "../../state/store/metricData/nodeMetricData/nodeMetricData.actions"
import { getCCFiles } from "../../model/files/files.helper"
import { calculateNewEdgeMetricData } from "../../state/store/metricData/edgeMetricData/edgeMetricData.actions"
import { AreaMetricActions } from "../../state/store/dynamicSettings/areaMetric/areaMetric.actions"

describe("codeMapPreRenderService", () => {
	let codeMapPreRenderService: CodeMapPreRenderService
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let nodeMetricDataService: NodeMetricDataService
	let codeMapRenderService: CodeMapRenderService
	let edgeMetricDataService: EdgeMetricDataService

	let fileMeta: FileMeta
	let map: CodeMapNode

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods($rootScope)
		withMockedCodeMapRenderService()
		withMockedMetricService()
		withUnifiedMapAndFileMeta()
		storeService.dispatch(setDynamicSettings(STATE.dynamicSettings))
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		nodeMetricDataService = getService<NodeMetricDataService>("nodeMetricDataService")
		codeMapRenderService = getService<CodeMapRenderService>("codeMapRenderService")
		edgeMetricDataService = getService<EdgeMetricDataService>("edgeMetricDataService")

		const deltaA = _.cloneDeep(TEST_DELTA_MAP_A)
		const deltaB = _.cloneDeep(TEST_DELTA_MAP_B)

		NodeDecorator.decorateMapWithPathAttribute(deltaA)
		NodeDecorator.decorateMapWithPathAttribute(deltaB)

		map = deltaA.map
		fileMeta = deltaA.fileMeta

		storeService.dispatch(resetFiles())
		storeService.dispatch(addFile(deltaA))
		storeService.dispatch(addFile(deltaB))
		storeService.dispatch(setSingle(deltaA))
		storeService.dispatch(setBlacklist())
		storeService.dispatch(calculateNewNodeMetricData(storeService.getState().files, []))
		storeService.dispatch(calculateNewEdgeMetricData(storeService.getState().files, []))
	}

	function rebuildService() {
		codeMapPreRenderService = new CodeMapPreRenderService(
			$rootScope,
			storeService,
			nodeMetricDataService,
			codeMapRenderService,
			edgeMetricDataService
		)
	}

	function withMockedCodeMapRenderService() {
		codeMapRenderService.render = jest.fn()
		codeMapRenderService.scaleMap = jest.fn()
	}

	function withMockedMetricService() {
		nodeMetricDataService.isMetricAvailable = jest.fn().mockReturnValue(true)
	}

	function withUnifiedMapAndFileMeta() {
		codeMapPreRenderService["unifiedMap"] = map
		codeMapPreRenderService["unifiedFileMeta"] = fileMeta
	}

	function allNodesToBeExcluded(): boolean {
		for (const node of hierarchy(codeMapPreRenderService.getRenderMap()).leaves()) {
			if (!node.data.isExcluded) {
				return false
			}
		}
		return true
	}

	function isIdUnique(): boolean {
		let isIdUnique = true
		const idBuildingSet: Map<number, string> = new Map()

		hierarchy(codeMapPreRenderService.getRenderMap())
			.descendants()
			.forEach(node => {
				if (idBuildingSet.has(node.data.id)) {
					isIdUnique = false
				} else {
					idBuildingSet.set(node.data.id, node.data.path)
				}
			})
		return isIdUnique
	}

	describe("constructor", () => {
		beforeEach(() => {
			MetricDataService.subscribe = jest.fn()
			StoreService.subscribe = jest.fn()
			ScalingService.subscribe = jest.fn()
		})

		it("should subscribe to MetricDataService", () => {
			rebuildService()

			expect(MetricDataService.subscribe).toHaveBeenCalledWith($rootScope, codeMapPreRenderService)
		})

		it("should subscribe to StoreService", () => {
			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, codeMapPreRenderService)
		})

		it("should subscribe to ScalingService", () => {
			rebuildService()

			expect(ScalingService.subscribe).toHaveBeenCalledWith($rootScope, codeMapPreRenderService)
		})
	})

	describe("getRenderMap", () => {
		it("should return unifiedMap", () => {
			const result = codeMapPreRenderService.getRenderMap()

			expect(result).toEqual(map)
		})
	})

	describe("onStoreChanged", () => {
		it("should call codeMapRenderService.render", done => {
			codeMapPreRenderService.onStoreChanged("SOME_ACTION")

			setTimeout(() => {
				expect(codeMapRenderService.render).toHaveBeenCalled()
				expect(storeService.getState().appSettings.isLoadingFile).toBeFalsy()
				expect(storeService.getState().appSettings.isLoadingMap).toBeFalsy()
				done()
			}, CodeMapPreRenderService["DEBOUNCE_TIME"] + 1000)
		})

		it("should not call codeMapRenderService.render for scaling actions", () => {
			codeMapPreRenderService.onStoreChanged(ScalingActions.SET_SCALING)

			expect(codeMapRenderService.render).not.toHaveBeenCalled()
		})

		it("should not call codeMapRenderService.render for scaling actions", () => {
			codeMapPreRenderService.onStoreChanged(IsLoadingMapActions.SET_IS_LOADING_MAP)

			expect(codeMapRenderService.render).not.toHaveBeenCalled()
		})

		it("should not call codeMapRenderService.render for blacklist actions", () => {
			codeMapPreRenderService.onStoreChanged(BlacklistActions.SET_BLACKLIST)

			expect(codeMapRenderService.render).not.toHaveBeenCalled()
		})

		it("should show and stop the loadingMapGif", done => {
			codeMapPreRenderService["showLoadingMapGif"] = jest.fn()

			codeMapPreRenderService.onStoreChanged(AreaMetricActions.SET_AREA_METRIC)

			setTimeout(() => {
				expect(storeService.getState().appSettings.isLoadingMap).toBeFalsy()
				done()
			}, CodeMapPreRenderService["DEBOUNCE_TIME"])
		})
	})

	describe("onScalingChanged", () => {
		it("should call codeMapRenderService.render", () => {
			codeMapPreRenderService.onScalingChanged()

			expect(codeMapRenderService.scaleMap).toHaveBeenCalled()
		})

		it("should show and stop the loadingMapGif", () => {
			codeMapPreRenderService["showLoadingMapGif"] = jest.fn()

			codeMapPreRenderService.onScalingChanged()

			expect(codeMapPreRenderService["showLoadingMapGif"]).toHaveBeenCalled()
			expect(storeService.getState().appSettings.isLoadingMap).toBeFalsy()
		})
	})

	describe("onMetricDataChanged", () => {
		it("should decorate and set a new render map", () => {
			codeMapPreRenderService.onMetricDataChanged()

			expect(codeMapPreRenderService.getRenderMap()).toMatchSnapshot()
		})

		it("should update the isBlacklisted attribute on each node", () => {
			storeService.dispatch(addBlacklistItem({ path: map.path, type: BlacklistType.exclude }))

			codeMapPreRenderService.onMetricDataChanged()

			expect(allNodesToBeExcluded()).toBeTruthy()
		})

		it("should change map to multiple mode and check that no id exists twice", () => {
			storeService.dispatch(setMultiple(getCCFiles(storeService.getState().files)))

			codeMapPreRenderService.onMetricDataChanged()

			expect(isIdUnique()).toBeTruthy()
		})

		it("should set isMapDecorated to true, to avoid entering this function again unless a new map needs to be decorated", () => {
			expect(codeMapPreRenderService["isMapDecorated"]).toBeFalsy()

			codeMapPreRenderService.onMetricDataChanged()

			expect(codeMapPreRenderService["isMapDecorated"]).toBeTruthy()
		})
	})

	describe("onBlacklistChanged", () => {
		it("should decorate an existing map and trigger rendering", done => {
			NodeDecorator.decorateMapWithBlacklist = jest.fn()
			NodeDecorator.decorateParentNodesWithAggregatedAttributes = jest.fn()

			NodeDecorator.decorateMap(map, storeService.getState().metricData.nodeMetricData)

			codeMapPreRenderService.onBlacklistChanged()

			expect(NodeDecorator.decorateParentNodesWithAggregatedAttributes).toHaveBeenCalled()
			expect(NodeDecorator.decorateMapWithBlacklist).toHaveBeenCalled()
			setTimeout(() => {
				expect(codeMapRenderService.render).toHaveBeenCalled()
				done()
			}, CodeMapPreRenderService["DEBOUNCE_TIME"] + 10)
		})
	})

	describe("onFilesSelectionChanged", () => {
		it("should set isMapDecorated to false, because we need to decorate a new map again", () => {
			codeMapPreRenderService["isMapDecorated"] = false

			codeMapPreRenderService.onFilesSelectionChanged()

			expect(codeMapPreRenderService["isMapDecorated"]).toBeFalsy()
		})
	})
})
