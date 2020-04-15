import "./codeMap.module"
import "../../codeCharta.module"
import { CodeMapRenderService } from "./codeMap.render.service"
import { BlacklistType, CodeMapNode, FileMeta, MetricData } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { MetricService } from "../../state/metric.service"
import { FILE_STATES, METRIC_DATA, STATE, TEST_FILE_WITH_PATHS, withMockedEventMethods } from "../../util/dataMocks"
import { CodeMapPreRenderService } from "./codeMap.preRender.service"
import { EdgeMetricDataService } from "../../state/edgeMetricData.service"
import { NodeDecorator } from "../../util/nodeDecorator"
import _ from "lodash"
import { StoreService } from "../../state/store.service"
import { ScalingService } from "../../state/store/appSettings/scaling/scaling.service"
import { setDynamicSettings } from "../../state/store/dynamicSettings/dynamicSettings.actions"
import { ScalingActions } from "../../state/store/appSettings/scaling/scaling.actions"
import { Vector3 } from "three"
import { IsLoadingMapActions } from "../../state/store/appSettings/isLoadingMap/isLoadingMap.actions"
import { addFile, resetFiles, setSingleByName } from "../../state/store/files/files.actions"
import { addBlacklistItem, BlacklistActions } from "../../state/store/fileSettings/blacklist/blacklist.actions"
import { focusNode, unfocusNode } from "../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { hierarchy } from "d3"

describe("codeMapPreRenderService", () => {
	let codeMapPreRenderService: CodeMapPreRenderService
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let metricService: MetricService
	let codeMapRenderService: CodeMapRenderService
	let edgeMetricDataService: EdgeMetricDataService

	let fileMeta: FileMeta
	let map: CodeMapNode
	let metricData: MetricData[]

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods($rootScope)
		withMockedCodeMapRenderService()
		withMockedMetricService()
		withUnifiedMapAndFileMeta()
		storeService.dispatch(setDynamicSettings(STATE.dynamicSettings))
		storeService.dispatch(unfocusNode())
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		metricService = getService<MetricService>("metricService")
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
		metricData = _.cloneDeep(METRIC_DATA)
	}

	function rebuildService() {
		codeMapPreRenderService = new CodeMapPreRenderService(
			$rootScope,
			storeService,
			metricService,
			codeMapRenderService,
			edgeMetricDataService
		)
	}

	function withMockedCodeMapRenderService() {
		codeMapRenderService = codeMapPreRenderService["codeMapRenderService"] = jest.fn().mockReturnValue({
			render: jest.fn(),
			scaleMap: jest.fn()
		})()
	}

	function withMockedMetricService() {
		metricService = codeMapPreRenderService["metricService"] = jest.fn().mockReturnValue({
			getMetricData: jest.fn().mockReturnValue(metricData),
			isMetricAvailable: jest.fn().mockReturnValue(true)
		})()
	}

	function withUnifiedMapAndFileMeta() {
		codeMapPreRenderService["unifiedMap"] = map
		codeMapPreRenderService["unifiedFileMeta"] = fileMeta
	}

	function allNodesToBeExcluded(): boolean {
		hierarchy(codeMapPreRenderService.getRenderMap())
			.leaves()
			.forEach(node => {
				if (!node.data.isBlacklisted) {
					return false
				}
			})

		return true
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

		it("should call update the isBlacklisted attribute on each node", done => {
			storeService.dispatch(addBlacklistItem({ path: map.path, type: BlacklistType.exclude }))

			codeMapPreRenderService.onStoreChanged("SOME_ACTION")

			setTimeout(() => {
				expect(allNodesToBeExcluded()).toBeTruthy()
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

		it("should show focused node only", done => {
			const bigLeaf = map.children[0]
			const smallLeaf = map.children[1].children[0]
			const otherSmallLeaf = map.children[1].children[1]
			storeService.dispatch(focusNode(smallLeaf.path))

			codeMapPreRenderService.onStoreChanged("SOME_ACTION")

			setTimeout(() => {
				expect(map.isBlacklisted).toEqual(BlacklistType.exclude)
				expect(bigLeaf.isBlacklisted).toEqual(BlacklistType.exclude)
				expect(smallLeaf.isBlacklisted).toBeUndefined()
				expect(otherSmallLeaf.isBlacklisted).toEqual(BlacklistType.exclude)
				done()
			}, CodeMapPreRenderService["DEBOUNCE_TIME"])
		})

		it("should show all nodes", done => {
			const bigLeaf = map.children[0]
			const smallLeaf = map.children[1].children[0]
			const otherSmallLeaf = map.children[1].children[1]
			storeService.dispatch(unfocusNode())

			codeMapPreRenderService.onStoreChanged("SOME_ACTION")

			setTimeout(() => {
				expect(map.isBlacklisted).toBeUndefined()
				expect(bigLeaf.isBlacklisted).toBeUndefined()
				expect(smallLeaf.isBlacklisted).toBeUndefined()
				expect(otherSmallLeaf.isBlacklisted).toBeUndefined()
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

	describe("onMetricDataAdded", () => {
		it("should decorate and set a new render map", () => {
			codeMapPreRenderService.onMetricDataAdded(metricData)

			expect(codeMapPreRenderService.getRenderMap()).toMatchSnapshot()
		})
	})
})
