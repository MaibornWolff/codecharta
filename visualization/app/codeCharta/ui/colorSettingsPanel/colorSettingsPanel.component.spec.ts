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

	function rebuildController() {
		colorSettingsPanelController = new ColorSettingsPanelController($rootScope, settingsService, metricService)
	}

	it("set delta color flipped flag", () => {
		let settings = { appSettings: { deltaColorFlipped: true }, dynamicSettings: {} } as Settings

		colorSettingsPanelController.onSettingsChanged(settings, undefined,null)

		expect(colorSettingsPanelController["_viewModel"].deltaColorFlipped).toBe(true)
	})

	it("set white color buildings", () => {
		let settings = { appSettings: { whiteColorBuildings: true }, dynamicSettings: {} } as Settings

		colorSettingsPanelController.onSettingsChanged(settings, undefined,null)

		expect(colorSettingsPanelController["_viewModel"].whiteColorBuildings).toBeTruthy()
	})

	it("set neutralColorRangeFlipped", () => {
		let settings = { dynamicSettings: { neutralColorRange: { flipped: true } }, appSettings: {} } as Settings

		colorSettingsPanelController.onSettingsChanged(settings, undefined,null)

		expect(colorSettingsPanelController["_viewModel"].neutralColorRangeFlipped).toBeTruthy()
	})

	it("detects delta mode selection", () => {
		let fileStates = [
			{ file: {}, selectedAs: FileSelectionState.Comparison },
			{ file: {}, selectedAs: FileSelectionState.Reference }
		] as FileState[]

		colorSettingsPanelController.onFileSelectionStatesChanged(fileStates, null)

		expect(colorSettingsPanelController["_viewModel"].isDeltaState).toBeTruthy()
	})

	it("detects not delta mode selection", () => {
		let fileStates = [
			{ file: {}, selectedAs: FileSelectionState.None },
			{ file: {}, selectedAs: FileSelectionState.Partial }
		] as FileState[]

		colorSettingsPanelController.onFileSelectionStatesChanged(fileStates, null)

		expect(colorSettingsPanelController["_viewModel"].isDeltaState).toBeFalsy()
	})

	it("apply settings calls update settings correctly", () => {
		settingsService.updateSettings = jest.fn()
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

	it("only adapt color range if color metric is not the same ", () => {
		settingsService.updateSettings = jest.fn()
		let settings = { dynamicSettings: { colorMetric: "foo" }, appSettings: {} } as Settings

		colorSettingsPanelController.onSettingsChanged(settings, undefined,null)
		colorSettingsPanelController.onSettingsChanged(settings, undefined,null)

		expect(settingsService.updateSettings).toHaveBeenCalledTimes(1)
		expect(colorSettingsPanelController["lastColorMetric"]).toBe("foo")
	})

	it("correct metric max is retrieved for range calculation ", () => {
		metricService.getMaxMetricByMetricName = jest.fn()
		let settings = { dynamicSettings: { colorMetric: "rloc" }, appSettings: {} } as Settings

		colorSettingsPanelController.onSettingsChanged(settings, undefined,null)

		expect(metricService.getMaxMetricByMetricName).toHaveBeenCalledWith("rloc")
	})

	it("set adapted ColorRange in thirds for given metricValues", () => {
		withMockedSettingsService()
		metricService.getMaxMetricByMetricName = jest.fn(() => 100)

		colorSettingsPanelController.onSettingsChanged(settingsService.getSettings(), undefined,null)

		expect(settingsService.updateSettings).toHaveBeenCalledWith({
			dynamicSettings: { neutralColorRange: { flipped: false, from: 33.33, to: 66.66 } }
		})
	})
})
