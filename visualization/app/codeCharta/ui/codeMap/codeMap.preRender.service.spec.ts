import "./codeMap.module"
import "../../codeCharta.module"
import { CodeMapRenderService } from "./codeMap.render.service"
import { BlacklistType, CCFile, CodeMapNode, FileMeta } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { FILE_STATES, STATE, TEST_DELTA_MAP_B, TEST_FILE_WITH_PATHS, withMockedEventMethods } from "../../util/dataMocks"
import { CodeMapPreRenderService } from "./codeMap.preRender.service"
import { NodeDecorator } from "../../util/nodeDecorator"
import { StoreService } from "../../state/store.service"
import { ScalingService } from "../../state/store/appSettings/scaling/scaling.service"
import { setDynamicSettings } from "../../state/store/dynamicSettings/dynamicSettings.actions"
import { ScalingActions } from "../../state/store/appSettings/scaling/scaling.actions"
import { IsLoadingMapActions } from "../../state/store/appSettings/isLoadingMap/isLoadingMap.actions"
import { addFile, resetFiles, setMultiple, setSingleByName } from "../../state/store/files/files.actions"
import { addBlacklistItem, BlacklistActions, setBlacklist } from "../../state/store/fileSettings/blacklist/blacklist.actions"
import { hierarchy } from "d3-hierarchy"
import { NodeMetricDataService } from "../../state/store/metricData/nodeMetricData/nodeMetricData.service"
import { EdgeMetricDataService } from "../../state/store/metricData/edgeMetricData/edgeMetricData.service"
import { MetricDataService } from "../../state/store/metricData/metricData.service"
import { calculateNewNodeMetricData } from "../../state/store/metricData/nodeMetricData/nodeMetricData.actions"
import { getCCFiles } from "../../model/files/files.helper"
import { calculateNewEdgeMetricData } from "../../state/store/metricData/edgeMetricData/edgeMetricData.actions"
import { clone } from "../../util/clone"

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

		fileMeta = clone(FILE_STATES[0].file.fileMeta)
		map = clone(TEST_FILE_WITH_PATHS.map)
		map.children[1].children = map.children[1].children.slice(0, 2)

		const ccFile: CCFile = clone(TEST_DELTA_MAP_B)

		const fileStates = clone(FILE_STATES)
		NodeDecorator.decorateMapWithPathAttribute(fileStates[0].file)
		NodeDecorator.decorateMapWithPathAttribute(ccFile)

		storeService.dispatch(resetFiles())
		storeService.dispatch(addFile(fileStates[0].file))
		storeService.dispatch(addFile(ccFile))
		storeService.dispatch(setSingleByName(fileStates[0].file.fileMeta.fileName))
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

	function allNodesToBeExcluded() {
		for (const node of hierarchy(codeMapPreRenderService.getRenderMap()).leaves()) {
			if (!node.data.isExcluded) {
				return false
			}
		}
		return true
	}

	function isIdUnique() {
		const idBuildingSet: Map<number, string> = new Map()

		for (const node of hierarchy(codeMapPreRenderService.getRenderMap())) {
			if (idBuildingSet.has(node.data.id)) {
				return false
			}
			idBuildingSet.set(node.data.id, node.data.path)
		}
		return true
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

		it("should show and stop the loadingMapGif", done => {
			codeMapPreRenderService["showLoadingMapGif"] = jest.fn()

			codeMapPreRenderService.onStoreChanged(BlacklistActions.SET_BLACKLIST)

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
	})
})
