import "./metricChooser.module"

import { MetricChooserController } from "./metricChooser.component"
import { SettingsService } from "../../state/settings.service"
import { CodeMapBuildingTransition } from "../codeMap/codeMap.mouseEvent.service"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { Settings } from "../../codeCharta.model"
import { DEFAULT_SETTINGS, SETTINGS } from "../../util/dataMocks"

describe("MetricChooserController", () => {
	let metricChooserController: MetricChooserController
	let services
	let dataDelta, dataNotDelta

	function rebuildController() {
		metricChooserController = new MetricChooserController(services.SettingsService, services.$rootScope)
	}

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.metricChooser")

		services = {
			settingsService: getService<SettingsService>("settingsService"),
			$rootScope: getService<IRootScopeService>("$rootScope")
		}
	}

	function withMockedSettingsService() {
		services.settingsService = metricChooserController["settingsService"] = jest.fn(() => {
			return {
				subscribe: jest.fn(),
				updateSettings: jest.fn(),
				getSettings: jest.fn().mockReturnValue(SETTINGS),
				getDefaultSettings: jest.fn().mockReturnValue(DEFAULT_SETTINGS)
			}
		})()
	}

	function withMockedBuildingTransitions() {
		dataDelta = ({
			to: {
				node: {
					attributes: { area: 10, height: 20, color: 30 },
					deltas: { area: 40, height: 50, color: 60 }
				}
			}
		} as unknown) as CodeMapBuildingTransition

		dataNotDelta = ({
			to: {
				node: {
					attributes: { area: 10, height: 20, color: 30 }
				}
			}
		} as unknown) as CodeMapBuildingTransition
	}

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedSettingsService()
	})

	it("should uptate height/area/color metric on settings changed", () => {
		let settings = { dynamicSettings: { areaMetric: "foo", heightMetric: "bar", colorMetric: "foobar" } } as Settings

		metricChooserController.onSettingsChanged(settings, undefined, null)

		expect(metricChooserController["_viewModel"].areaMetric).toEqual("foo")
		expect(metricChooserController["_viewModel"].heightMetric).toEqual("bar")
		expect(metricChooserController["_viewModel"].colorMetric).toEqual("foobar")
	})

	it("metric data should be updated", () => {
		let metricData = [
			{ name: "a", maxValue: 1, availableInVisibleMaps: true },
			{ name: "b", maxValue: 2, availableInVisibleMaps: false }
		]

		metricChooserController.onMetricDataAdded(metricData, null)

		expect(metricChooserController["_viewModel"].metricData).toEqual(metricData)
	})

	it("settings are updated if selected metrics are not available", () => {
		let metricData = [
			{ name: "a", maxValue: 1, availableInVisibleMaps: true },
			{ name: "b", maxValue: 2, availableInVisibleMaps: true },
			{ name: "c", maxValue: 2, availableInVisibleMaps: true }
		]

		metricChooserController.onMetricDataAdded(metricData, null)

		expect(services.settingsService.updateSettings).toHaveBeenCalledWith({
			dynamicSettings: { areaMetric: "a", colorMetric: "c", heightMetric: "b" }
		})
	})

	it("same metric is selected multiple times if less than 3 metrics available", () => {
		let metricData = [
			{ name: "a", maxValue: 1, availableInVisibleMaps: true },
			{ name: "b", maxValue: 1, availableInVisibleMaps: false }
		]

		metricChooserController.onMetricDataAdded(metricData, null)

		expect(services.settingsService.updateSettings).toHaveBeenCalledWith({
			dynamicSettings: { areaMetric: "a", colorMetric: "a", heightMetric: "a" }
		})
	})

	it("settings are not updated if selected metrics are available", () => {
		let metricData = [
			{ name: "mcc", maxValue: 1, availableInVisibleMaps: true },
			{ name: "rloc", maxValue: 2, availableInVisibleMaps: true }
		]

		metricChooserController.onMetricDataAdded(metricData, null)

		expect(services.settingsService.updateSettings).not.toBeCalled()
	})

	it("no metrics available, should not update settings", () => {
		let metricData = [{ name: "b", maxValue: 2, availableInVisibleMaps: false }]

		metricChooserController.onMetricDataAdded(metricData, null)

		expect(services.settingsService.updateSettings).not.toBeCalled()
	})

	it("apply settings area metric updates settings", () => {
		metricChooserController["_viewModel"].areaMetric = "a"

		metricChooserController.applySettingsAreaMetric()

		expect(services.settingsService.updateSettings).toBeCalledWith({ dynamicSettings: { areaMetric: "a", margin: null } })
	})

	it("apply settings color metric updates settings", () => {
		metricChooserController["_viewModel"].colorMetric = "c"

		metricChooserController.applySettingsColorMetric()

		expect(services.settingsService.updateSettings).toBeCalledWith({
			dynamicSettings: { colorMetric: "c", neutralColorRange: { flipped: false, from: null, to: null } }
		})
	})

	it("apply settings height metric updates settings", () => {
		metricChooserController["_viewModel"].heightMetric = "b"

		metricChooserController.applySettingsHeightMetric()

		expect(services.settingsService.updateSettings).toBeCalledWith({ dynamicSettings: { heightMetric: "b" } })
	})

	it("should set values and deltas to null if data incomplete", () => {
		let data = { from: {}, to: {} } as CodeMapBuildingTransition

		metricChooserController.onBuildingHovered(data, null)

		expect(metricChooserController.hoveredAreaDelta).toBe(null)
		expect(metricChooserController.hoveredAreaValue).toBe(null)
		expect(metricChooserController.hoveredColorDelta).toBe(null)
		expect(metricChooserController.hoveredColorValue).toBe(null)
		expect(metricChooserController.hoveredHeightValue).toBe(null)
		expect(metricChooserController.hoveredHeightDelta).toBe(null)
	})

	it("should set hovered values and set hovered deltas to null if not delta", () => {
		withMockedBuildingTransitions()
		metricChooserController["_viewModel"].areaMetric = "area"
		metricChooserController["_viewModel"].heightMetric = "height"
		metricChooserController["_viewModel"].colorMetric = "color"

		metricChooserController.onBuildingHovered(dataNotDelta, null)

		expect(metricChooserController.hoveredAreaDelta).toBe(null)
		expect(metricChooserController.hoveredAreaValue).toBe(10)
		expect(metricChooserController.hoveredColorDelta).toBe(null)
		expect(metricChooserController.hoveredColorValue).toBe(30)
		expect(metricChooserController.hoveredHeightValue).toBe(20)
		expect(metricChooserController.hoveredHeightDelta).toBe(null)
	})

	it("should set hovered values and deltas if delta", () => {
		withMockedBuildingTransitions()
		metricChooserController["_viewModel"].areaMetric = "area"
		metricChooserController["_viewModel"].heightMetric = "height"
		metricChooserController["_viewModel"].colorMetric = "color"

		metricChooserController.onBuildingHovered(dataDelta, null)

		expect(metricChooserController.hoveredAreaDelta).toBe(40)
		expect(metricChooserController.hoveredAreaValue).toBe(10)
		expect(metricChooserController.hoveredColorDelta).toBe(60)
		expect(metricChooserController.hoveredColorValue).toBe(30)
		expect(metricChooserController.hoveredHeightValue).toBe(20)
		expect(metricChooserController.hoveredHeightDelta).toBe(50)
	})

	it("hovered delta color should be null if not delta", () => {
		withMockedBuildingTransitions()
		metricChooserController.hoveredDeltaColor = "foo"

		metricChooserController.onBuildingHovered(dataNotDelta, null)

		expect(metricChooserController.hoveredDeltaColor).toBe(null)
	})

	it("hovered delta color should be inherited if hoveredHeigtDelta is 0", () => {
		withMockedBuildingTransitions()
		metricChooserController.hoveredHeightDelta = 0

		metricChooserController.onBuildingHovered(dataDelta, null)

		expect(metricChooserController.hoveredDeltaColor).toBe("inherit")
	})

	it("hovered delta color should be set correctly", () => {
		withMockedBuildingTransitions()
		metricChooserController["_viewModel"].heightMetric = "height"
		metricChooserController.hoveredHeightDelta = 2

		metricChooserController.onBuildingHovered(dataDelta, null)

		expect(metricChooserController.hoveredDeltaColor).toBe("green")
	})

	it("hovered delta color should be set correctly if reversed colors", () => {
		withMockedBuildingTransitions()
		metricChooserController["_viewModel"].heightMetric = "height"
		metricChooserController.hoveredHeightDelta = 2
		services.settingsService.getSettings = jest.fn(() => {
			return { appSettings: { deltaColorFlipped: true } }
		})

		metricChooserController.onBuildingHovered(dataDelta, null)

		expect(metricChooserController.hoveredDeltaColor).toBe("red")
	})
})
