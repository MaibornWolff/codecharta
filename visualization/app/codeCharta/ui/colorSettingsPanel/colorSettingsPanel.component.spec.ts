import "./colorSettingsPanel.module"

import { ColorSettingsPanelController } from "./colorSettingsPanel.component"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settingsService/settings.service"
import { FileStateService } from "../../state/fileState.service"
import { MetricService } from "../../state/metric.service"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { DEFAULT_STATE, SETTINGS } from "../../util/dataMocks"
import { FileSelectionState, FileState } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { InvertDeltaColorsService } from "../../state/store/appSettings/invertDeltaColors/invertDeltaColors.service"
import { WhiteColorBuildingsService } from "../../state/store/appSettings/whiteColorBuildings/whiteColorBuildings.service"
import { InvertColorRangeService } from "../../state/store/appSettings/invertColorRange/invertColorRange.service"
import { ColorMetricService } from "../../state/store/dynamicSettings/colorMetric/colorMetric.service"

describe("ColorSettingsPanelController", () => {
	let colorSettingsPanelController: ColorSettingsPanelController
	let $rootScope: IRootScopeService
	let settingsService: SettingsService
	let storeService: StoreService
	let metricService: MetricService

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedMetricService()
		withMockedSettingsService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.colorSettingsPanel")

		$rootScope = getService<IRootScopeService>("$rootScope")
		settingsService = getService<SettingsService>("settingsService")
		storeService = getService<StoreService>("storeService")
		metricService = getService<MetricService>("metricService")
	}

	function withMockedSettingsService() {
		settingsService = colorSettingsPanelController["settingsService"] = jest.fn(() => {
			return {
				updateSettings: jest.fn(),
				getSettings: jest.fn().mockReturnValue(SETTINGS)
			}
		})()
	}

	function withMockedMetricService() {
		metricService = colorSettingsPanelController["metricService"] = jest.fn(() => {
			return {
				getMetricData: jest.fn().mockReturnValue([]),
				getMaxMetricByMetricName: jest.fn().mockReturnValue(100)
			}
		})()
	}

	function rebuildController() {
		colorSettingsPanelController = new ColorSettingsPanelController($rootScope, settingsService, storeService, metricService)
	}

	describe("constructor", () => {
		beforeEach(() => {
			FileStateService.subscribe = jest.fn()
			MetricService.subscribe = jest.fn()
			InvertDeltaColorsService.subscribe = jest.fn()
			WhiteColorBuildingsService.subscribe = jest.fn()
			InvertColorRangeService.subscribe = jest.fn()
			ColorMetricService.subscribe = jest.fn()
		})

		it("should subscribe to FileStateService", () => {
			rebuildController()

			expect(FileStateService.subscribe).toHaveBeenCalledWith($rootScope, colorSettingsPanelController)
		})

		it("should subscribe to MetricService", () => {
			rebuildController()

			expect(MetricService.subscribe).toHaveBeenCalledWith($rootScope, colorSettingsPanelController)
		})

		it("should subscribe to InvertDeltaColorsService", () => {
			rebuildController()

			expect(InvertDeltaColorsService.subscribe).toHaveBeenCalledWith($rootScope, colorSettingsPanelController)
		})

		it("should subscribe to WhiteColorBuildingsService", () => {
			rebuildController()

			expect(WhiteColorBuildingsService.subscribe).toHaveBeenCalledWith($rootScope, colorSettingsPanelController)
		})

		it("should subscribe to InvertColorRangeService", () => {
			rebuildController()

			expect(InvertColorRangeService.subscribe).toHaveBeenCalledWith($rootScope, colorSettingsPanelController)
		})

		it("should subscribe to ColorMetricService", () => {
			rebuildController()

			expect(ColorMetricService.subscribe).toHaveBeenCalledWith($rootScope, colorSettingsPanelController)
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

	describe("onColorMetricChanged", () => {
		it("should only adapt color range if color metric is not the same", () => {
			storeService.dispatch = jest.fn()
			colorSettingsPanelController["lastColorMetric"] = "lastColorMetric"

			colorSettingsPanelController.onColorMetricChanged("newColorMetric")

			expect(storeService.dispatch).toHaveBeenCalled()
		})

		it("should call getMaxMetricByMetricName with colorMetric", () => {
			colorSettingsPanelController.onColorMetricChanged("newColorMetric")

			expect(metricService.getMaxMetricByMetricName).toHaveBeenCalledWith("newColorMetric")
		})

		it("should set adapted ColorRange in thirds for given metricValues", () => {
			colorSettingsPanelController.onColorMetricChanged("rloc")

			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				dynamicSettings: { colorRange: { from: 33.33, to: 66.66 } }
			})
			expect(storeService.getState().dynamicSettings.colorRange).toEqual({ from: 33.33, to: 66.66 })
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

	describe("onMetricDataAdded", () => {
		it("should set lastMaxColorMetricValue if newMaxColorMetricValue is different", () => {
			colorSettingsPanelController.onMetricDataAdded([])

			expect(colorSettingsPanelController["lastMaxColorMetricValue"]).toBe(100)
		})

		it("should adaptColorRange if newMaxColorMetricValue is different", () => {
			colorSettingsPanelController.onMetricDataAdded([])

			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				dynamicSettings: {
					colorRange: {
						from: 33.33,
						to: 66.66
					}
				}
			})
			expect(storeService.getState().dynamicSettings.colorRange).toEqual({ from: 33.33, to: 66.66 })
		})

		it("should not set lastMaxColorMetricValue if newMaxColorMetricValue is the same", () => {
			colorSettingsPanelController["lastMaxColorMetricValue"] = 100

			colorSettingsPanelController.onMetricDataAdded([])

			expect(colorSettingsPanelController["lastMaxColorMetricValue"]).toBe(100)
		})
	})

	describe("invertColorRange", () => {
		it("should call update settings correctly", () => {
			colorSettingsPanelController["_viewModel"].invertColorRange = false

			colorSettingsPanelController.invertColorRange()

			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				appSettings: {
					invertColorRange: false
				}
			})
			expect(storeService.getState().appSettings.invertColorRange).toBeFalsy()
		})
	})

	describe("invertDeltaColors", () => {
		it("should call update settings correctly", () => {
			colorSettingsPanelController["_viewModel"].invertDeltaColors = false

			colorSettingsPanelController.invertDeltaColors()

			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				appSettings: {
					invertDeltaColors: false,
					mapColors: {
						positiveDelta: settingsService.getSettings().appSettings.mapColors.negativeDelta,
						negativeDelta: settingsService.getSettings().appSettings.mapColors.positiveDelta
					}
				}
			})
			expect(storeService.getState().appSettings.invertDeltaColors).toBeFalsy()
			expect(storeService.getState().appSettings.mapColors.positiveDelta).toEqual(DEFAULT_STATE.appSettings.mapColors.negativeDelta)
			expect(storeService.getState().appSettings.mapColors.negativeDelta).toEqual(DEFAULT_STATE.appSettings.mapColors.positiveDelta)
		})
	})

	describe("applyWhiteColorBuildings", () => {
		it("should call update settings correctly", () => {
			colorSettingsPanelController["_viewModel"].whiteColorBuildings = false

			colorSettingsPanelController.applyWhiteColorBuildings()

			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				appSettings: {
					whiteColorBuildings: false
				}
			})
			expect(storeService.getState().appSettings.whiteColorBuildings).toBeFalsy()
		})
	})
})
