import "./colorSettingsPanel.module"

import { ColorSettingsPanelController } from "./colorSettingsPanel.component"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settings.service"
import { FileStateService } from "../../state/fileState.service"
import { MetricService } from "../../state/metric.service"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { SETTINGS } from "../../util/dataMocks"
import { Settings, FileSelectionState, FileState } from "../../codeCharta.model"
import { color } from "d3-color"

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
		it("should set delta color flipped flag", () => {
			let settings = { appSettings: { deltaColorFlipped: true }, dynamicSettings: {} } as Settings

			colorSettingsPanelController.onSettingsChanged(settings, undefined, null)

			expect(colorSettingsPanelController["_viewModel"].deltaColorFlipped).toBe(true)
		})

		it("should set white color buildings", () => {
			let settings = { appSettings: { whiteColorBuildings: true }, dynamicSettings: {} } as Settings

			colorSettingsPanelController.onSettingsChanged(settings, undefined, null)

			expect(colorSettingsPanelController["_viewModel"].whiteColorBuildings).toBeTruthy()
		})

		it("should set neutralColorRangeFlipped", () => {
			let settings = {
				dynamicSettings: { neutralColorRange: { flipped: true }, colorMetric: "foo" },
				appSettings: {}
			} as Settings
			colorSettingsPanelController["lastColorMetric"] = "foo"

			colorSettingsPanelController.onSettingsChanged(settings, undefined, null)

			expect(colorSettingsPanelController["_viewModel"].neutralColorRangeFlipped).toBeTruthy()
		})

		it("should only adapt color range if color metric is not the same ", () => {
			let settings = { dynamicSettings: { colorMetric: "foo" }, appSettings: {} } as Settings

			colorSettingsPanelController.onSettingsChanged(settings, undefined, null)

			expect(settingsService.updateSettings).toHaveBeenCalledTimes(1)
		})

		it("should set correct metric max is retrieved for range calculation ", () => {
			let settings = { dynamicSettings: { colorMetric: "rloc" }, appSettings: {} } as Settings

			colorSettingsPanelController.onSettingsChanged(settings, undefined, null)

			expect(metricService.getMaxMetricByMetricName).toHaveBeenCalledWith("rloc")
		})

		it("should set adapted ColorRange in thirds for given metricValues", () => {
			colorSettingsPanelController.onSettingsChanged(settingsService.getSettings(), undefined, null)

			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				dynamicSettings: { neutralColorRange: { flipped: false, from: 33.33, to: 66.66 } }
			})
		})
	})

	describe("onFileSelectionStatesChanged", () => {
		it("should detect delta mode selection", () => {
			let fileStates = [
				{ file: {}, selectedAs: FileSelectionState.Comparison },
				{ file: {}, selectedAs: FileSelectionState.Reference }
			] as FileState[]

			colorSettingsPanelController.onFileSelectionStatesChanged(fileStates, null)

			expect(colorSettingsPanelController["_viewModel"].isDeltaState).toBeTruthy()
		})

		it("should detect not delta mode selection", () => {
			let fileStates = [
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
					neutralColorRange: {
						flipped: false,
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

	describe("applySettings", () => {
		it("should call update settings correctly", () => {
			colorSettingsPanelController["_viewModel"].neutralColorRangeFlipped = false
			colorSettingsPanelController["_viewModel"].deltaColorFlipped = true
			colorSettingsPanelController["_viewModel"].whiteColorBuildings = true

			colorSettingsPanelController.applySettings()

			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				dynamicSettings: {
					neutralColorRange: {
						flipped: false
					}
				},
				appSettings: {
					deltaColorFlipped: true,
					whiteColorBuildings: true
				}
			})
		})
	})
})
