import "./metricChooser.module"

import { MetricChooserController } from "./metricChooser.component"
import { SettingsService } from "../../state/settingsService/settings.service"
import { CodeMapBuildingTransition, CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService, ITimeoutService } from "angular"
import { DEFAULT_SETTINGS, SETTINGS } from "../../util/dataMocks"
import { MetricService } from "../../state/metric.service"

describe("MetricChooserController", () => {
	let metricChooserController: MetricChooserController
	let settingsService: SettingsService
	let $rootScope: IRootScopeService
	let $timeout: ITimeoutService
	let dataDelta, dataNotDelta

	function rebuildController() {
		metricChooserController = new MetricChooserController(settingsService, $rootScope, $timeout)
	}

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.metricChooser")

		settingsService = getService<SettingsService>("settingsService")
		$rootScope = getService<IRootScopeService>("$rootScope")
		$timeout = getService<ITimeoutService>("$timeout")
	}

	function withMockedSettingsService() {
		settingsService = metricChooserController["settingsService"] = jest.fn(() => {
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

	describe("constructor", () => {
		beforeEach(() => {
			SettingsService.subscribeToAreaMetric = jest.fn()
			SettingsService.subscribeToHeightMetric = jest.fn()
			SettingsService.subscribeToColorMetric = jest.fn()
			SettingsService.subscribeToDistributionMetric = jest.fn()

			CodeMapMouseEventService.subscribeToBuildingHoveredEvents = jest.fn()
			MetricService.subscribe = jest.fn()
		})

		it("should subscribe to Metric-Events", () => {
			rebuildController()

			expect(SettingsService.subscribeToAreaMetric).toHaveBeenCalledWith($rootScope, metricChooserController)
			expect(SettingsService.subscribeToHeightMetric).toHaveBeenCalledWith($rootScope, metricChooserController)
			expect(SettingsService.subscribeToColorMetric).toHaveBeenCalledWith($rootScope, metricChooserController)
			expect(SettingsService.subscribeToDistributionMetric).toHaveBeenCalledWith($rootScope, metricChooserController)
		})

		it("should subscribe to Building-Hovered-Event", () => {
			rebuildController()

			expect(CodeMapMouseEventService.subscribeToBuildingHoveredEvents).toHaveBeenCalledWith($rootScope, metricChooserController)
		})

		it("should subscribe to MetricService", () => {
			rebuildController()

			expect(MetricService.subscribe).toHaveBeenCalledWith($rootScope, metricChooserController)
		})
	})

	describe("onAreaMetricChanged", () => {
		it("should update the viewModel", () => {
			metricChooserController.onAreaMetricChanged("rloc")

			expect(metricChooserController["_viewModel"].areaMetric).toEqual("rloc")
		})
	})

	describe("onHeightMetricChanged", () => {
		it("should update the viewModel", () => {
			metricChooserController.onHeightMetricChanged("rloc")

			expect(metricChooserController["_viewModel"].heightMetric).toEqual("rloc")
		})
	})

	describe("onColorMetricChanged", () => {
		it("should update the viewModel", () => {
			metricChooserController.onColorMetricChanged("rloc")

			expect(metricChooserController["_viewModel"].colorMetric).toEqual("rloc")
		})
	})

	describe("onDistributionMetricChanged", () => {
		it("should update the viewModel", () => {
			metricChooserController.onDistributionMetricChanged("rloc")

			expect(metricChooserController["_viewModel"].distributionMetric).toEqual("rloc")
		})
	})

	describe("onMetricDataAdded", () => {
		it("metric data should be updated", () => {
			let metricData = [
				{ name: "a", maxValue: 1, availableInVisibleMaps: true },
				{ name: "b", maxValue: 2, availableInVisibleMaps: false }
			]

			metricChooserController.onMetricDataAdded(metricData)

			expect(metricChooserController["_viewModel"].metricData).toEqual(metricData)
		})

		it("settings are updated if selected metrics are not available", () => {
			let metricData = [
				{ name: "a", maxValue: 1, availableInVisibleMaps: true },
				{ name: "b", maxValue: 2, availableInVisibleMaps: true },
				{ name: "c", maxValue: 2, availableInVisibleMaps: true },
				{ name: "d", maxValue: 2, availableInVisibleMaps: true }
			]

			metricChooserController.onMetricDataAdded(metricData)

			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				dynamicSettings: { areaMetric: "a", colorMetric: "c", heightMetric: "b", distributionMetric: "a" }
			})
		})

		it("same metric is selected multiple times if less than 3 metrics available", () => {
			let metricData = [
				{ name: "a", maxValue: 1, availableInVisibleMaps: true },
				{ name: "b", maxValue: 1, availableInVisibleMaps: false }
			]

			metricChooserController.onMetricDataAdded(metricData)

			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				dynamicSettings: { areaMetric: "a", colorMetric: "a", heightMetric: "a", distributionMetric: "a" }
			})
		})

		it("settings are not updated if selected metrics are available", () => {
			let metricData = [
				{ name: "mcc", maxValue: 1, availableInVisibleMaps: true },
				{ name: "rloc", maxValue: 2, availableInVisibleMaps: true }
			]

			metricChooserController.onMetricDataAdded(metricData)

			expect(settingsService.updateSettings).not.toBeCalled()
		})

		it("no metrics available, should not update settings", () => {
			let metricData = [{ name: "b", maxValue: 2, availableInVisibleMaps: false }]

			metricChooserController.onMetricDataAdded(metricData)

			expect(settingsService.updateSettings).not.toBeCalled()
		})
	})

	describe("applySettingsAreaMetric", () => {
		it("should updateSettings with areaMetric and margin null, when dynamicMargin is enabled", () => {
			settingsService.getSettings = jest.fn().mockReturnValue({ appSettings: { dynamicMargin: true } })

			metricChooserController["_viewModel"].areaMetric = "mcc"

			metricChooserController.applySettingsAreaMetric()

			expect(settingsService.updateSettings).toBeCalledWith({
				dynamicSettings: {
					areaMetric: "mcc",
					margin: null
				}
			})
		})

		it("should updateSettings with areaMetric and margin from settings, when dynamicMargin is disabled", () => {
			settingsService.getSettings = jest.fn().mockReturnValue({
				appSettings: { dynamicMargin: false },
				dynamicSettings: { margin: 20 }
			})

			metricChooserController["_viewModel"].areaMetric = "mcc"

			metricChooserController.applySettingsAreaMetric()

			expect(settingsService.updateSettings).toBeCalledWith({
				dynamicSettings: {
					areaMetric: "mcc",
					margin: 20
				}
			})
		})
	})

	describe("applySettingsColorMetric", () => {
		it("should update color metric settings", () => {
			metricChooserController["_viewModel"].colorMetric = "c"

			metricChooserController.applySettingsColorMetric()

			expect(settingsService.updateSettings).toBeCalledWith({
				dynamicSettings: { colorMetric: "c", colorRange: { from: null, to: null } }
			})
		})
	})

	describe("applySettingsHeightMetric", () => {
		it("should update height metric settings", () => {
			metricChooserController["_viewModel"].heightMetric = "b"

			metricChooserController.applySettingsHeightMetric()

			expect(settingsService.updateSettings).toBeCalledWith({ dynamicSettings: { heightMetric: "b" } })
		})
	})

	describe("onBuildingHovered", () => {
		it("should set values and deltas to null if data incomplete", () => {
			let data = { from: {}, to: {} } as CodeMapBuildingTransition

			metricChooserController.onBuildingHovered(data)

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

			metricChooserController.onBuildingHovered(dataNotDelta)

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

			metricChooserController.onBuildingHovered(dataDelta)

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

			metricChooserController.onBuildingHovered(dataNotDelta)

			expect(metricChooserController.hoveredDeltaColor).toBe(null)
		})

		it("hovered delta color should be inherited if hoveredHeigtDelta is 0", () => {
			withMockedBuildingTransitions()
			metricChooserController.hoveredHeightDelta = 0

			metricChooserController.onBuildingHovered(dataDelta)

			expect(metricChooserController.hoveredDeltaColor).toBe("inherit")
		})

		it("hovered delta color should be set correctly", () => {
			withMockedBuildingTransitions()
			metricChooserController["_viewModel"].heightMetric = "height"
			metricChooserController.hoveredHeightDelta = 2

			metricChooserController.onBuildingHovered(dataDelta)

			expect(metricChooserController.hoveredDeltaColor).toBe("green")
		})

		it("hovered delta color should be set correctly if reversed colors", () => {
			withMockedBuildingTransitions()
			metricChooserController["_viewModel"].heightMetric = "height"
			metricChooserController.hoveredHeightDelta = 2
			settingsService.getSettings = jest.fn(() => {
				return { appSettings: { invertDeltaColors: true } }
			})

			metricChooserController.onBuildingHovered(dataDelta)

			expect(metricChooserController.hoveredDeltaColor).toBe("red")
		})
	})
	describe("filterMetricData()", () => {
		it("should return the default MetricData list", () => {
			let metricData = [
				{ name: "rloc", maxValue: 1, availableInVisibleMaps: true },
				{ name: "mcc", maxValue: 2, availableInVisibleMaps: false }
			]
			metricChooserController["_viewModel"].searchTerm = ""
			metricChooserController.onMetricDataAdded(metricData)

			metricChooserController.filterMetricData()

			expect(metricChooserController["_viewModel"].metricData).toEqual(metricData)
		})
		it("should return only metric mcc from MetricData list, when its the searchTerm", () => {
			let metricData = [
				{ name: "rloc", maxValue: 1, availableInVisibleMaps: true },
				{ name: "mcc", maxValue: 2, availableInVisibleMaps: false }
			]
			metricChooserController["_viewModel"].searchTerm = "mcc"
			metricChooserController.onMetricDataAdded(metricData)

			metricChooserController.filterMetricData()

			expect(metricChooserController["_viewModel"].metricData).toEqual([{ name: "mcc", maxValue: 2, availableInVisibleMaps: false }])
		})

		it("should return rloc metric when searchTerm is only 'rl'", () => {
			let metricData = [
				{ name: "rloc", maxValue: 1, availableInVisibleMaps: true },
				{ name: "mcc", maxValue: 2, availableInVisibleMaps: false }
			]
			metricChooserController["_viewModel"].searchTerm = "rl"
			metricChooserController.onMetricDataAdded(metricData)

			metricChooserController.filterMetricData()

			expect(metricChooserController["_viewModel"].metricData).toEqual([{ name: "rloc", maxValue: 1, availableInVisibleMaps: true }])
		})

		it("should return the metrics which contains the metrics with 'c' in it", () => {
			let metricData = [
				{ name: "rloc", maxValue: 1, availableInVisibleMaps: true },
				{ name: "mcc", maxValue: 2, availableInVisibleMaps: false },
				{ name: "avg", maxValue: 3, availableInVisibleMaps: false }
			]
			metricChooserController["_viewModel"].searchTerm = "c"
			metricChooserController.onMetricDataAdded(metricData)

			metricChooserController.filterMetricData()

			expect(metricChooserController["_viewModel"].metricData).toEqual([
				{ name: "rloc", maxValue: 1, availableInVisibleMaps: true },
				{ name: "mcc", maxValue: 2, availableInVisibleMaps: false }
			])
		})

		it("should return the metrics which contains substrings with 'mc' as prefix", () => {
			let metricData = [
				{ name: "rloc", maxValue: 1, availableInVisibleMaps: true },
				{ name: "mcc", maxValue: 2, availableInVisibleMaps: false },
				{ name: "avg", maxValue: 3, availableInVisibleMaps: false },
				{ name: "cmc", maxValue: 4, availableInVisibleMaps: true }
			]
			metricChooserController["_viewModel"].searchTerm = "mc"
			metricChooserController.onMetricDataAdded(metricData)

			metricChooserController.filterMetricData()

			expect(metricChooserController["_viewModel"].metricData).toEqual([
				{ name: "mcc", maxValue: 2, availableInVisibleMaps: false },
				{ name: "cmc", maxValue: 4, availableInVisibleMaps: true }
			])
		})
		it("should return an empty metric list if it doesn't have the searchTerm as substring", () => {
			let metricData = [
				{ name: "rloc", maxValue: 1, availableInVisibleMaps: true },
				{ name: "mcc", maxValue: 2, availableInVisibleMaps: false },
				{ name: "avg", maxValue: 3, availableInVisibleMaps: false },
				{ name: "cmc", maxValue: 4, availableInVisibleMaps: true }
			]
			metricChooserController["_viewModel"].searchTerm = "rla"
			metricChooserController.onMetricDataAdded(metricData)

			metricChooserController.filterMetricData()

			expect(metricChooserController["_viewModel"].metricData).toEqual([])
		})
	})
	describe("clearSearchTerm()", () => {
		it("should return an empty string, when function is called", () => {
			metricChooserController["_viewModel"].searchTerm = "someString"

			metricChooserController.clearSearchTerm()

			expect(metricChooserController["_viewModel"].searchTerm).toEqual("")
		})

		it("should return the the metricData Array with all Elements, when function is called", () => {
			let metricData = [
				{ name: "rloc", maxValue: 1, availableInVisibleMaps: true },
				{ name: "mcc", maxValue: 2, availableInVisibleMaps: false },
				{ name: "avg", maxValue: 3, availableInVisibleMaps: false },
				{ name: "cmc", maxValue: 4, availableInVisibleMaps: true }
			]
			metricChooserController["_viewModel"].searchTerm = "rlo"
			metricChooserController.onMetricDataAdded(metricData)

			metricChooserController.clearSearchTerm()

			expect(metricChooserController["_viewModel"].metricData).toEqual(metricData)
		})
	})
})
