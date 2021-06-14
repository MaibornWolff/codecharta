import "./colorSettingsPanel.module"

import { ColorSettingsPanelController } from "./colorSettingsPanel.component"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { DEFAULT_STATE, TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../../util/dataMocks"
import { StoreService } from "../../state/store.service"
import { InvertDeltaColorsService } from "../../state/store/appSettings/invertDeltaColors/invertDeltaColors.service"
import { InvertColorRangeService } from "../../state/store/appSettings/invertColorRange/invertColorRange.service"
import { FilesService } from "../../state/store/files/files.service"
import { addFile, resetFiles, setDelta, setSingle } from "../../state/store/files/files.actions"
import { colorLabelOptions } from "../../codeCharta.model"
import { setColorLabels } from "../../state/store/appSettings/colorLabels/colorLabels.actions"
import { ColorLabelsService } from "../../state/store/appSettings/colorLabels/colorLabels.service"

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
		it("should subscribe to FilesService", () => {
			FilesService.subscribe = jest.fn()

			rebuildController()

			expect(FilesService.subscribe).toHaveBeenCalledWith($rootScope, colorSettingsPanelController)
		})

		it("should subscribe to InvertDeltaColorsService", () => {
			InvertDeltaColorsService.subscribe = jest.fn()

			rebuildController()

			expect(InvertDeltaColorsService.subscribe).toHaveBeenCalledWith($rootScope, colorSettingsPanelController)
		})

		it("should subscribe to InvertColorRangeService", () => {
			InvertColorRangeService.subscribe = jest.fn()

			rebuildController()

			expect(InvertColorRangeService.subscribe).toHaveBeenCalledWith($rootScope, colorSettingsPanelController)
		})

		it("should subscribe to ColorLabelService", () => {
			ColorLabelsService.subscribe = jest.fn()

			rebuildController()

			expect(ColorLabelsService.subscribe).toHaveBeenCalledWith($rootScope, colorSettingsPanelController)
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

	describe("onColorLabelsChanged", () => {
		it("should set onColorLabelsChanged to given option", () => {
			const colorLabelsPosNeut: colorLabelOptions = {
				positive: true,
				negative: false,
				neutral: true
			}
			colorSettingsPanelController.onColorLabelsChanged(colorLabelsPosNeut)

			expect(colorSettingsPanelController["_viewModel"].colorLabels).toBe(colorLabelsPosNeut)
		})
	})

	describe("swapColorLabelsPositive", () => {
		let colorLabels: colorLabelOptions = null

		beforeEach(() => {
			colorLabels = {
				positive: false,
				negative: false,
				neutral: false
			}
		})

		it("should swap positive value of colorLabels", () => {
			storeService.dispatch(setColorLabels(colorLabels))
			colorSettingsPanelController.swapColorLabelsPositive()

			expect(storeService.getState().appSettings.colorLabels.positive).toBe(true)
		})

		it("should swap negative value of colorLabels", () => {
			colorLabels.negative = true

			storeService.dispatch(setColorLabels(colorLabels))
			colorSettingsPanelController.swapColorLabelsNegative()

			expect(storeService.getState().appSettings.colorLabels.negative).toBe(false)
		})

		it("should swap neutral value of colorLabels", () => {
			storeService.dispatch(setColorLabels(colorLabels))
			colorSettingsPanelController.swapColorLabelsNeutral()

			expect(storeService.getState().appSettings.colorLabels.neutral).toBe(true)
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

	describe("onFilesSelectionChanged", () => {
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
})
