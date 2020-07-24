import "./codeMap.module"
import "../../codeCharta.module"
import { CodeMapRenderService } from "./codeMap.render.service"
import { BlacklistType, CodeMapNode, FileMeta } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { FILE_STATES, STATE, TEST_FILE_WITH_PATHS, withMockedEventMethods } from "../../util/dataMocks"
import { CodeMapPreRenderService } from "./codeMap.preRender.service"
import { NodeDecorator } from "../../util/nodeDecorator"
import _ from "lodash"
import { StoreService } from "../../state/store.service"
import { ScalingService } from "../../state/store/appSettings/scaling/scaling.service"
import { setDynamicSettings } from "../../state/store/dynamicSettings/dynamicSettings.actions"
import { ScalingActions } from "../../state/store/appSettings/scaling/scaling.actions"
import { Vector3 } from "three"
import { IsLoadingMapActions } from "../../state/store/appSettings/isLoadingMap/isLoadingMap.actions"
import { addFile, resetFiles, setSingleByName } from "../../state/store/files/files.actions"
import { addBlacklistItem, BlacklistActions, setBlacklist } from "../../state/store/fileSettings/blacklist/blacklist.actions"
import { hierarchy } from "d3"
import { NodeMetricDataService } from "../../state/store/metricData/nodeMetricData/nodeMetricData.service"
import { EdgeMetricDataService } from "../../state/store/metricData/edgeMetricData/edgeMetricData.service"
import { MetricDataService } from "../../state/store/metricData/metricData.service"

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
		withMockedEventMethods($rootScope)
		withMockedCodeMapRenderService()
		withMockedMetricService()
		rebuildService()
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

		fileMeta = _.cloneDeep(FILE_STATES[0].file.fileMeta)
		map = _.cloneDeep(TEST_FILE_WITH_PATHS.map)
		map.children[1].children = _.slice(map.children[1].children, 0, 2)
		const fileStates = _.cloneDeep(FILE_STATES)
		NodeDecorator.preDecorateFile(fileStates[0].file)

		storeService.dispatch(resetFiles())
		storeService.dispatch(addFile(fileStates[0].file))
		storeService.dispatch(setSingleByName(fileStates[0].file.fileMeta.fileName))
		storeService.dispatch(setBlacklist())
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
		hierarchy(codeMapPreRenderService.getRenderMap())
			.leaves()
			.forEach(node => {
				if (!node.data.isExcluded) {
					return false
				}
			})

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
			codeMapPreRenderService.onScalingChanged(new Vector3(1, 2, 3))

			expect(codeMapRenderService.scaleMap).toHaveBeenCalled()
		})

		it("should show and stop the loadingMapGif", () => {
			codeMapPreRenderService["showLoadingMapGif"] = jest.fn()

			codeMapPreRenderService.onScalingChanged(new Vector3(1, 2, 3))

			expect(codeMapPreRenderService["showLoadingMapGif"]).toHaveBeenCalled()
			expect(storeService.getState().appSettings.isLoadingMap).toBeFalsy()
		})
	})

	describe("onMetricDataComplete", () => {
		it("should decorate and set a new render map", () => {
			codeMapPreRenderService.onMetricDataComplete()

			expect(codeMapPreRenderService.getRenderMap()).toMatchSnapshot()
		})

		it("should update the isBlacklisted attribute on each node", () => {
			storeService.dispatch(addBlacklistItem({ path: map.path, type: BlacklistType.exclude }))

			codeMapPreRenderService.onMetricDataComplete()

			expect(allNodesToBeExcluded()).toBeTruthy()
		})
	})
})
