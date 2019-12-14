import "./colorSettingsPanel.module"

import { ColorSettingsPanelController } from "./colorSettingsPanel.component"
import { IRootScopeService } from "angular"
import { FileStateService } from "../../state/fileState.service"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { DEFAULT_STATE } from "../../util/dataMocks"
import { FileSelectionState, FileState } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { InvertDeltaColorsService } from "../../state/store/appSettings/invertDeltaColors/invertDeltaColors.service"
import { WhiteColorBuildingsService } from "../../state/store/appSettings/whiteColorBuildings/whiteColorBuildings.service"
import { InvertColorRangeService } from "../../state/store/appSettings/invertColorRange/invertColorRange.service"

describe("ColorSettingsPanelController", () => {
	let colorSettingsPanelController: ColorSettingsPanelController
	let $rootScope: IRootScopeService
	let storeService: StoreService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.colorSettingsPanel")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildController() {
		colorSettingsPanelController = new ColorSettingsPanelController($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to FileStateService", () => {
			FileStateService.subscribe = jest.fn()

			rebuildController()

			expect(FileStateService.subscribe).toHaveBeenCalledWith($rootScope, colorSettingsPanelController)
		})

		it("should subscribe to InvertDeltaColorsService", () => {
			InvertDeltaColorsService.subscribe = jest.fn()

			rebuildController()

			expect(InvertDeltaColorsService.subscribe).toHaveBeenCalledWith($rootScope, colorSettingsPanelController)
		})

		it("should subscribe to WhiteColorBuildingsService", () => {
			WhiteColorBuildingsService.subscribe = jest.fn()

			rebuildController()

			expect(WhiteColorBuildingsService.subscribe).toHaveBeenCalledWith($rootScope, colorSettingsPanelController)
		})

		it("should subscribe to InvertColorRangeService", () => {
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

	describe("onFileSelectionStatesChanged", () => {
		it("should detect delta mode selection", () => {
			const fileStates = [
				{ file: {}, selectedAs: FileSelectionState.Comparison },
				{ file: {}, selectedAs: FileSelectionState.Reference }
			] as FileState[]

			colorSettingsPanelController.onFileSelectionStatesChanged(fileStates)

			expect(colorSettingsPanelController["_viewModel"].isDeltaState).toBeTruthy()
		})

		it("should detect not delta mode selection", () => {
			const fileStates = [
				{ file: {}, selectedAs: FileSelectionState.None },
				{ file: {}, selectedAs: FileSelectionState.Partial }
			] as FileState[]

			colorSettingsPanelController.onFileSelectionStatesChanged(fileStates)

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
