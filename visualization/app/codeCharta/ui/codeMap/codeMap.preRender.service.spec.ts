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
import { addFile, setDelta, setFiles, setStandard, setStandardByNames } from "../../state/store/files/files.actions"
import { addBlacklistItem, BlacklistActions, setBlacklist } from "../../state/store/fileSettings/blacklist/blacklist.actions"
import { hierarchy } from "d3-hierarchy"
import { MetricDataService } from "../../state/store/metricData/metricData.service"
import { getCCFiles } from "../../model/files/files.helper"
import { clone } from "../../util/clone"
import { DeltaGenerator } from "../../util/deltaGenerator"
import { calculateNodeMetricData } from "../../state/selectors/accumulatedData/metricData/nodeMetricData.selector"
import { calculateEdgeMetricData } from "../../state/selectors/accumulatedData/metricData/edgeMetricData.selector"
import { wait } from "../../util/testUtils/wait"

describe("codeMapPreRenderService", () => {
	let codeMapPreRenderService: CodeMapPreRenderService
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let codeMapRenderService: CodeMapRenderService

	let fileMeta: FileMeta
	let map: CodeMapNode

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods($rootScope)
		withMockedCodeMapRenderService()
		withUnifiedMapAndFileMeta()
		storeService.dispatch(setDynamicSettings(STATE.dynamicSettings))
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.codeMap")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		codeMapRenderService = getService<CodeMapRenderService>("codeMapRenderService")

		fileMeta = clone(FILE_STATES[0].file.fileMeta)
		map = clone(TEST_FILE_WITH_PATHS.map)
		map.children[1].children = map.children[1].children.slice(0, 2)

		const ccFile: CCFile = clone(TEST_DELTA_MAP_B)

		const fileStates = clone(FILE_STATES)
		NodeDecorator.decorateMapWithPathAttribute(fileStates[0].file)
		NodeDecorator.decorateMapWithPathAttribute(ccFile)

		storeService.dispatch(setFiles([]))
		storeService.dispatch(addFile(fileStates[0].file))
		storeService.dispatch(addFile(ccFile))
		storeService.dispatch(setStandardByNames([fileStates[0].file.fileMeta.fileName]))
		storeService.dispatch(setBlacklist())
		calculateEdgeMetricData(storeService.getState().files, [])
		calculateNodeMetricData(storeService.getState().files, [])
	}

	function rebuildService() {
		codeMapPreRenderService = new CodeMapPreRenderService($rootScope, storeService, codeMapRenderService)
	}

	function withMockedCodeMapRenderService() {
		codeMapRenderService.render = jest.fn()
		codeMapRenderService.scaleMap = jest.fn()
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
		it("should call codeMapRenderService.render", async () => {
			codeMapPreRenderService.onStoreChanged("SOME_ACTION")

			await wait(CodeMapPreRenderService["DEBOUNCE_TIME"] + 1000)
			expect(codeMapRenderService.render).toHaveBeenCalled()
			expect(storeService.getState().appSettings.isLoadingFile).toBeFalsy()
			expect(storeService.getState().appSettings.isLoadingMap).toBeFalsy()
		})

		it("should not call codeMapRenderService.render for scaling actions", () => {
			codeMapPreRenderService.onStoreChanged(ScalingActions.SET_SCALING)

			expect(codeMapRenderService.render).not.toHaveBeenCalled()
		})

		it("should not call codeMapRenderService.render for scaling actions", () => {
			codeMapPreRenderService.onStoreChanged(IsLoadingMapActions.SET_IS_LOADING_MAP)

			expect(codeMapRenderService.render).not.toHaveBeenCalled()
		})

		it("should show and stop the loadingMapGif", async () => {
			codeMapPreRenderService["showLoadingMapGif"] = jest.fn()

			codeMapPreRenderService.onStoreChanged(BlacklistActions.SET_BLACKLIST)

			await wait(CodeMapPreRenderService["DEBOUNCE_TIME"])
			expect(storeService.getState().appSettings.isLoadingMap).toBeFalsy()
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
		it("should decorate and set a new render map", async () => {
			codeMapPreRenderService.onMetricDataChanged()

			await wait(CodeMapPreRenderService["DEBOUNCE_TIME"])
			expect(codeMapPreRenderService.getRenderMap()).toMatchSnapshot()
		})

		it("should update the isBlacklisted attribute on each node", async () => {
			storeService.dispatch(addBlacklistItem({ path: map.path, type: BlacklistType.exclude }))

			codeMapPreRenderService.onMetricDataChanged()

			await wait(CodeMapPreRenderService["DEBOUNCE_TIME"])
			expect(allNodesToBeExcluded()).toBeTruthy()
		})

		it("should change map to multiple mode and check that no id exists twice", async () => {
			storeService.dispatch(setStandard(getCCFiles(storeService.getState().files)))

			codeMapPreRenderService.onMetricDataChanged()

			await wait(CodeMapPreRenderService["DEBOUNCE_TIME"])
			expect(isIdUnique()).toBeTruthy()
		})

		it("should call DeltaGenerator with the right parameters", () => {
			DeltaGenerator.getDeltaFile = jest.fn().mockReturnThis()
			storeService.dispatch(setDelta(getCCFiles(storeService.getState().files)[0], getCCFiles(storeService.getState().files)[1]))
			const resultMapA = NodeDecorator.decorateMapWithPathAttribute(getCCFiles(storeService.getState().files)[0])
			const resultMapB = NodeDecorator.decorateMapWithPathAttribute(getCCFiles(storeService.getState().files)[1])

			codeMapPreRenderService.onMetricDataChanged()

			expect(DeltaGenerator.getDeltaFile).toBeCalledWith(resultMapA, resultMapB)
		})

		it("should call DeltaGenerator with right parameters when maps are switched", () => {
			DeltaGenerator.getDeltaFile = jest.fn().mockReturnThis()
			storeService.dispatch(setDelta(getCCFiles(storeService.getState().files)[1], getCCFiles(storeService.getState().files)[0]))
			const resultMapA = NodeDecorator.decorateMapWithPathAttribute(getCCFiles(storeService.getState().files)[0])
			const resultMapB = NodeDecorator.decorateMapWithPathAttribute(getCCFiles(storeService.getState().files)[1])

			codeMapPreRenderService.onMetricDataChanged()

			expect(DeltaGenerator.getDeltaFile).toBeCalledWith(resultMapB, resultMapA)
		})
	})
})
