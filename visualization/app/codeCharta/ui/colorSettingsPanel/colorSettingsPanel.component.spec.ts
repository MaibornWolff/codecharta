import "./colorSettingsPanel.module"

import { ColorSettingsPanelController } from "./colorSettingsPanel.component"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../../util/dataMocks"
import { StoreService } from "../../state/store.service"
import { FilesService } from "../../state/store/files/files.service"
import { addFile, resetFiles, setDelta, setSingle } from "../../state/store/files/files.actions"
import { colorLabelOptions } from "../../codeCharta.model"
import { setColorLabels } from "../../state/store/appSettings/colorLabels/colorLabels.actions"
import { NodeMetricDataService } from "../../state/store/metricData/nodeMetricData/nodeMetricData.service"

describe("ColorSettingsPanelController", () => {
	let colorSettingsPanelController: ColorSettingsPanelController
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let nodeMetricDataService: NodeMetricDataService

	beforeEach(() => {
		restartSystem()
		rebuildController()
		initFiles()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.colorSettingsPanel")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		nodeMetricDataService = getService<NodeMetricDataService>("nodeMetricDataService")
	}

	function rebuildController() {
		colorSettingsPanelController = new ColorSettingsPanelController($rootScope, storeService, nodeMetricDataService)
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

	describe("onFilesSelectionChanged", () => {
		it("should detect delta mode selection", () => {
			storeService.dispatch(setDelta(TEST_DELTA_MAP_A, TEST_DELTA_MAP_B))

			colorSettingsPanelController.onFilesSelectionChanged(storeService.getState().files)

			expect(colorSettingsPanelController["_viewModel"].isDeltaState).toBeTruthy()
		})

		it("should detect not delta mode selection", () => {
			nodeMetricDataService.getMaxMetricByMetricName = jest.fn()

			storeService.dispatch(setSingle(TEST_DELTA_MAP_A))
			colorSettingsPanelController.onFilesSelectionChanged(storeService.getState().files)

			expect(colorSettingsPanelController["_viewModel"].isDeltaState).toBeFalsy()
		})

		it("should update _viewModel.maxMetricValue", () => {
			nodeMetricDataService.getMaxMetricByMetricName = jest.fn(() => 34)

			colorSettingsPanelController.onFilesSelectionChanged(storeService.getState().files)

			expect(colorSettingsPanelController["_viewModel"].maxMetricValue).toBe(34)
		})
	})

	describe("onBlackListChanged", () => {
		it("should update _viewModel.maxMetricValue", () => {
			nodeMetricDataService.getMaxMetricByMetricName = jest.fn(() => 34)

			colorSettingsPanelController.onBlacklistChanged()

			expect(colorSettingsPanelController["_viewModel"].maxMetricValue).toBe(34)
		})
	})

	describe("onColorMetricChanged", () => {
		it("should update _viewModel.maxMetricValue", () => {
			nodeMetricDataService.getMaxMetricByMetricName = jest.fn(() => 34)

			colorSettingsPanelController.onColorMetricChanged()

			expect(colorSettingsPanelController["_viewModel"].maxMetricValue).toBe(34)
		})
	})

	describe("invertColorRange", () => {
		it("should switch positive and negative map colors in store", () => {
			const { positive: previousPositiveColor, negative: previousNegativeColor } = storeService.getState().appSettings.mapColors

			colorSettingsPanelController.invertColorRange()

			const { positive: newPositiveColor, negative: newNegativeColor } = storeService.getState().appSettings.mapColors
			expect(newPositiveColor).toBe(previousNegativeColor)
			expect(newNegativeColor).toBe(previousPositiveColor)
		})
	})

	describe("invertDeltaColors", () => {
		it("should switch positive and negative map colors in store", () => {
			const {
				positiveDelta: previousPositiveDeltaColor,
				negativeDelta: previousNegativeDeltaColor
			} = storeService.getState().appSettings.mapColors

			colorSettingsPanelController.invertDeltaColors()

			const {
				positiveDelta: newPositiveDeltaColor,
				negativeDelta: newNegativeDeltaColor
			} = storeService.getState().appSettings.mapColors
			expect(newPositiveDeltaColor).toBe(previousNegativeDeltaColor)
			expect(newNegativeDeltaColor).toBe(previousPositiveDeltaColor)
		})
	})
})
