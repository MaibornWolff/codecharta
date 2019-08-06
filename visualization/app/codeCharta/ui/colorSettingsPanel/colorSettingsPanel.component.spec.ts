import "./colorSettingsPanel.module"

import { ColorSettingsPanelController } from "./colorSettingsPanel.component"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settings.service"
import { FileStateService } from "../../state/fileState.service"
import { MetricService } from "../../state/metric.service"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { SETTINGS } from "../../util/dataMocks"
import { Settings, FileSelectionState, FileState } from "../../codeCharta.model"

describe("ColorSettingsPanelController", () => {
	let colorSettingsPanelController: ColorSettingsPanelController
	let $rootScope: IRootScopeService
	let settingsService: SettingsService
	let fileStateService: FileStateService
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
		fileStateService = getService<FileStateService>("fileStateService")
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
		colorSettingsPanelController = new ColorSettingsPanelController($rootScope, settingsService, metricService)
	}

	describe("constructor", () => {
		beforeEach(() => {
			SettingsService.subscribe = jest.fn()
			FileStateService.subscribe = jest.fn()
			MetricService.subscribe = jest.fn()
		})

		it("should subscribe to SettingsService", () => {
			rebuildController()

			expect(SettingsService.subscribe).toHaveBeenCalledWith($rootScope, colorSettingsPanelController)
		})

		it("should subscribe to FileStateService", () => {
			rebuildController()

			expect(FileStateService.subscribe).toHaveBeenCalledWith($rootScope, colorSettingsPanelController)
		})

		it("should subscribe to MetricService", () => {
			rebuildController()

			expect(MetricService.subscribe).toHaveBeenCalledWith($rootScope, colorSettingsPanelController)
		})
	})

	describe("onSettingsChanged", () => {
		it("should set invertDeltaColors flag", () => {
			const settings = { appSettings: { invertDeltaColors: true }, dynamicSettings: {} } as Settings

			colorSettingsPanelController.onSettingsChanged(settings, undefined, null)

			expect(colorSettingsPanelController["_viewModel"].invertDeltaColors).toBe(true)
		})

		it("should set white color buildings", () => {
			const settings = { appSettings: { whiteColorBuildings: true }, dynamicSettings: {} } as Settings

			colorSettingsPanelController.onSettingsChanged(settings, undefined, null)

			expect(colorSettingsPanelController["_viewModel"].whiteColorBuildings).toBeTruthy()
		})

		it("should set invertColorRange", () => {
			const settings = {
				dynamicSettings: { colorMetric: "foo" },
				appSettings: {
					invertColorRange: true
				}
			} as Settings
			colorSettingsPanelController["lastColorMetric"] = "foo"

			colorSettingsPanelController.onSettingsChanged(settings, undefined, null)

			expect(colorSettingsPanelController["_viewModel"].invertColorRange).toBeTruthy()
		})

		it("should only adapt color range if color metric is not the same ", () => {
			const settings = { dynamicSettings: { colorMetric: "foo" }, appSettings: {} } as Settings

			colorSettingsPanelController.onSettingsChanged(settings, undefined, null)

			expect(settingsService.updateSettings).toHaveBeenCalledTimes(1)
		})

		it("should set correct metric max is retrieved for range calculation ", () => {
			const settings = { dynamicSettings: { colorMetric: "rloc" }, appSettings: {} } as Settings

			colorSettingsPanelController.onSettingsChanged(settings, undefined, null)

			expect(metricService.getMaxMetricByMetricName).toHaveBeenCalledWith("rloc")
		})

		it("should set adapted ColorRange in thirds for given metricValues", () => {
			colorSettingsPanelController.onSettingsChanged(settingsService.getSettings(), undefined, null)

			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				dynamicSettings: { colorRange: { from: 33.33, to: 66.66 } }
			})
		})
	})

	describe("onFileSelectionStatesChanged", () => {
		it("should detect delta mode selection", () => {
			const fileStates = [
				{ file: {}, selectedAs: FileSelectionState.Comparison },
				{ file: {}, selectedAs: FileSelectionState.Reference }
			] as FileState[]

			colorSettingsPanelController.onFileSelectionStatesChanged(fileStates, null)

			expect(colorSettingsPanelController["_viewModel"].isDeltaState).toBeTruthy()
		})

		it("should detect not delta mode selection", () => {
			const fileStates = [
				{ file: {}, selectedAs: FileSelectionState.None },
				{ file: {}, selectedAs: FileSelectionState.Partial }
			] as FileState[]

			colorSettingsPanelController.onFileSelectionStatesChanged(fileStates, null)

			expect(colorSettingsPanelController["_viewModel"].isDeltaState).toBeFalsy()
		})
	})

	describe("onMetricDataAdded", () => {
		it("should set lastMaxColorMetricValue if newMaxColorMetricValue is different", () => {
			colorSettingsPanelController.onMetricDataAdded([], undefined)

			expect(colorSettingsPanelController["lastMaxColorMetricValue"]).toBe(100)
		})

		it("should adaptColorRange if newMaxColorMetricValue is different", () => {
			colorSettingsPanelController.onMetricDataAdded([], undefined)

			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				dynamicSettings: {
					colorRange: {
						from: 33.33,
						to: 66.66
					}
				}
			})
		})

		it("should not set lastMaxColorMetricValue if newMaxColorMetricValue is the same", () => {
			colorSettingsPanelController["lastMaxColorMetricValue"] = 100

			colorSettingsPanelController.onMetricDataAdded([], undefined)

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
		})
	})
})
