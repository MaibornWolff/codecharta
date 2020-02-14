import "./colorSettingsPanel.module"

import { ColorSettingsPanelController } from "./colorSettingsPanel.component"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { DEFAULT_STATE, TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../../util/dataMocks"
import { StoreService } from "../../state/store.service"
import { InvertDeltaColorsService } from "../../state/store/appSettings/invertDeltaColors/invertDeltaColors.service"
import { WhiteColorBuildingsService } from "../../state/store/appSettings/whiteColorBuildings/whiteColorBuildings.service"
import { InvertColorRangeService } from "../../state/store/appSettings/invertColorRange/invertColorRange.service"
import { FilesService } from "../../state/store/files/files.service"
import { addFile, resetFiles, setDelta, setSingle } from "../../state/store/files/files.actions"

describe("ColorSettingsPanelController", () => {
	let colorSettingsPanelController: ColorSettingsPanelController
	let $rootScope: IRootScopeService
	let storeService: StoreService

	beforeEach(() => {
		restartSystem()
		rebuildController()
		initFiles()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.colorSettingsPanel")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildController() {
		colorSettingsPanelController = new ColorSettingsPanelController($rootScope, storeService)
	}

	function initFiles() {
		storeService.dispatch(resetFiles())
		storeService.dispatch(addFile(TEST_DELTA_MAP_A))
		storeService.dispatch(addFile(TEST_DELTA_MAP_B))
	}

	describe("constructor", () => {
		it("should subscribeToFilesSelection to FilesService", () => {
			FilesService.subscribeToFilesSelection = jest.fn()

			rebuildController()

			expect(FilesService.subscribeToFilesSelection).toHaveBeenCalledWith($rootScope, colorSettingsPanelController)
		})

		it("should subscribeToFilesSelection to InvertDeltaColorsService", () => {
			InvertDeltaColorsService.subscribe = jest.fn()

			rebuildController()

			expect(InvertDeltaColorsService.subscribe).toHaveBeenCalledWith($rootScope, colorSettingsPanelController)
		})

		it("should subscribeToFilesSelection to WhiteColorBuildingsService", () => {
			WhiteColorBuildingsService.subscribe = jest.fn()

			rebuildController()

			expect(WhiteColorBuildingsService.subscribe).toHaveBeenCalledWith($rootScope, colorSettingsPanelController)
		})

		it("should subscribeToFilesSelection to InvertColorRangeService", () => {
			InvertColorRangeService.subscribe = jest.fn()

			rebuildController()

			expect(InvertColorRangeService.subscribe).toHaveBeenCalledWith($rootScope, colorSettingsPanelController)
		})
	})

	describe("onInvertDeltaColorsChanged", () => {
		it("should set invertDeltaColors flag to true", () => {
			colorSettingsPanelController.onInvertDeltaColorsChanged(true)

			expect(colorSettingsPanelController["_viewModel"].invertDeltaColors).toBeTruthy()
		})

		it("should set invertDeltaColors flag to false", () => {
			colorSettingsPanelController.onInvertDeltaColorsChanged(false)

			expect(colorSettingsPanelController["_viewModel"].invertDeltaColors).toBeFalsy()
		})
	})

	describe("onInvertColorRangeChanged", () => {
		it("should set invertColorRange flag to true", () => {
			colorSettingsPanelController.onInvertColorRangeChanged(true)

			expect(colorSettingsPanelController["_viewModel"].invertColorRange).toBeTruthy()
		})

		it("should set invertColorRange flag to false", () => {
			colorSettingsPanelController.onInvertColorRangeChanged(false)

			expect(colorSettingsPanelController["_viewModel"].invertColorRange).toBeFalsy()
		})
	})

	describe("onWhiteColorBuildingsChanged", () => {
		it("should set whiteColorBuildings flag to true", () => {
			colorSettingsPanelController.onWhiteColorBuildingsChanged(true)

			expect(colorSettingsPanelController["_viewModel"].whiteColorBuildings).toBeTruthy()
		})

		it("should set whiteColorBuildings flag to false", () => {
			colorSettingsPanelController.onWhiteColorBuildingsChanged(false)

			expect(colorSettingsPanelController["_viewModel"].whiteColorBuildings).toBeFalsy()
		})
	})

	describe("onFilesChanged", () => {
		it("should detect delta mode selection", () => {
			storeService.dispatch(setDelta(TEST_DELTA_MAP_A, TEST_DELTA_MAP_B))

			colorSettingsPanelController.onFilesSelectionChanged(storeService.getState().files)

			expect(colorSettingsPanelController["_viewModel"].isDeltaState).toBeTruthy()
		})

		it("should detect not delta mode selection", () => {
			storeService.dispatch(setSingle(TEST_DELTA_MAP_A))

			colorSettingsPanelController.onFilesSelectionChanged(storeService.getState().files)

			expect(colorSettingsPanelController["_viewModel"].isDeltaState).toBeFalsy()
		})
	})

	describe("invertColorRange", () => {
		it("should call update settings correctly", () => {
			colorSettingsPanelController["_viewModel"].invertColorRange = false

			colorSettingsPanelController.invertColorRange()

			expect(storeService.getState().appSettings.invertColorRange).toBeFalsy()
		})
	})

	describe("invertDeltaColors", () => {
		it("should call update settings correctly", () => {
			colorSettingsPanelController["_viewModel"].invertDeltaColors = false

			colorSettingsPanelController.invertDeltaColors()

			expect(storeService.getState().appSettings.invertDeltaColors).toBeFalsy()
			expect(storeService.getState().appSettings.mapColors.positiveDelta).toEqual(DEFAULT_STATE.appSettings.mapColors.negativeDelta)
			expect(storeService.getState().appSettings.mapColors.negativeDelta).toEqual(DEFAULT_STATE.appSettings.mapColors.positiveDelta)
		})
	})

	describe("applyWhiteColorBuildings", () => {
		it("should call update settings correctly", () => {
			colorSettingsPanelController["_viewModel"].whiteColorBuildings = false

			colorSettingsPanelController.applyWhiteColorBuildings()

			expect(storeService.getState().appSettings.whiteColorBuildings).toBeFalsy()
		})
	})
})
