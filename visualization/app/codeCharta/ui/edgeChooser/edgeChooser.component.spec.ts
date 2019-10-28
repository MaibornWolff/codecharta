import "./edgeChooser.module"
import { EdgeChooserController } from "./edgeChooser.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { EdgeMetricService } from "../../state/edgeMetric.service"
import { IRootScopeService, ITimeoutService } from "angular"
import { SettingsService } from "../../state/settingsService/settings.service"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { CODE_MAP_BUILDING } from "../../util/dataMocks"
import _ from "lodash"

describe("EdgeChooserController", () => {
	let edgeChooserController: EdgeChooserController
	let $rootScope: IRootScopeService
	let codeMapActionsService: CodeMapActionsService
	let settingsService: SettingsService
	let $timeout: ITimeoutService

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedCodeMapActionsService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.edgeChooser")

		$rootScope = getService<IRootScopeService>("$rootScope")
		codeMapActionsService = getService<CodeMapActionsService>("codeMapActionsService")
		settingsService = getService<SettingsService>("settingsService")
		$timeout = getService<ITimeoutService>("$timeout")
	}

	function rebuildController() {
		edgeChooserController = new EdgeChooserController($rootScope, codeMapActionsService, settingsService, $timeout)
	}

	function withMockedCodeMapActionsService() {
		codeMapActionsService = edgeChooserController["codeMapActionsService"] = jest.fn<CodeMapActionsService>(() => {
			return {
				updateEdgePreviews: jest.fn()
			}
		})()
	}

	describe("constructor", () => {
		it("should subscribe to EdgeMetricService", () => {
			EdgeMetricService.subscribe = jest.fn()

			rebuildController()

			expect(EdgeMetricService.subscribe).toHaveBeenCalledWith($rootScope, edgeChooserController)
		})

		it("should subscribe to hovered buildings", () => {
			CodeMapMouseEventService.subscribeToBuildingHovered = jest.fn()

			rebuildController()

			expect(CodeMapMouseEventService.subscribeToBuildingHovered).toHaveBeenCalledWith($rootScope, edgeChooserController)
		})

		it("should subscribe to unhovered buildings", () => {
			CodeMapMouseEventService.subscribeToBuildingUnhovered = jest.fn()

			rebuildController()

			expect(CodeMapMouseEventService.subscribeToBuildingUnhovered).toHaveBeenCalledWith($rootScope, edgeChooserController)
		})
	})

	describe("onEdgeMetricDataUpdated", () => {
		it("should store edge data", () => {
			const metricData = [
				{ name: "metric1", maxValue: 22, availableInVisibleMaps: true },
				{ name: "metric2", maxValue: 1, availableInVisibleMaps: false }
			]

			edgeChooserController.onEdgeMetricDataUpdated(metricData)

			expect(edgeChooserController["_viewModel"].edgeMetricData.map(x => x.name)).toContain("metric1")
			expect(edgeChooserController["_viewModel"].edgeMetricData.map(x => x.name)).toContain("metric2")
		})

		it("should keep selected metric if available in new map", () => {
			const metricData = [
				{ name: "metric1", maxValue: 22, availableInVisibleMaps: true },
				{ name: "None", maxValue: 1, availableInVisibleMaps: false }
			]
			edgeChooserController["_viewModel"].edgeMetric = "metric1"

			edgeChooserController.onEdgeMetricDataUpdated(metricData)

			expect(edgeChooserController["_viewModel"].edgeMetric).toEqual("metric1")
		})

		it("should update edgeMetric to None if selected edgeMetric is no longer available", () => {
			const metricData = [
				{ name: "metric2", maxValue: 22, availableInVisibleMaps: true },
				{ name: "None", maxValue: 1, availableInVisibleMaps: false }
			]
			edgeChooserController["_viewModel"].edgeMetric = "metric1"
			settingsService.updateSettings = jest.fn()

			edgeChooserController.onEdgeMetricDataUpdated(metricData)

			expect(settingsService.updateSettings).toHaveBeenCalledWith({ dynamicSettings: { edgeMetric: "None" } })
		})
	})

	describe("onBuildingHovered", () => {
		it("should set hovered value to null if no node is hovered", () => {
			const codeMapBuilding = _.cloneDeep(CODE_MAP_BUILDING)
			codeMapBuilding.setNode({})
			edgeChooserController["_viewModel"].hoveredEdgeValue = { incoming: 22, outgoing: 42 }

			edgeChooserController.onBuildingHovered(codeMapBuilding)

			expect((edgeChooserController["_viewModel"].hoveredEdgeValue = null))
		})

		it("should update hoveredEdgeValue according to hovered building", () => {
			const codeMapBuilding = _.cloneDeep(CODE_MAP_BUILDING)
			codeMapBuilding.edgeAttributes = { name: "metric2", maxValue: 22, availableInVisibleMaps: true }

			edgeChooserController.onBuildingHovered(codeMapBuilding)

			expect((edgeChooserController["_viewModel"].hoveredEdgeValue = null))
		})
	})

	describe("onBuildingUnhovered", () => {
		it("should set hovered value to null if no node is hovered", () => {
			edgeChooserController["_viewModel"].hoveredEdgeValue = { incoming: 22, outgoing: 42 }

			edgeChooserController.onBuildingUnhovered()

			expect((edgeChooserController["_viewModel"].hoveredEdgeValue = null))
		})
	})

	describe("onEdgeMetricChanged", () => {
		it("should set new edgeMetric into viewModel", () => {
			codeMapActionsService.updateEdgePreviews = jest.fn()

			edgeChooserController.onEdgeMetricChanged("myEdgeMetric")

			expect(edgeChooserController["_viewModel"].edgeMetric).toEqual("myEdgeMetric")
		})

		it("should set None as edgeMetric into viewModel", () => {
			codeMapActionsService.updateEdgePreviews = jest.fn()

			edgeChooserController.onEdgeMetricChanged(null)

			expect(edgeChooserController["_viewModel"].edgeMetric).toEqual("None")
		})

		it("should update Edge Previews", () => {
			codeMapActionsService.updateEdgePreviews = jest.fn()

			edgeChooserController.onEdgeMetricChanged("myEdgeMetric")

			expect(codeMapActionsService.updateEdgePreviews).toHaveBeenCalled()
		})
	})

	describe("onEdgeMetricSelected", () => {
		it("should update Settings", () => {
			settingsService.updateSettings = jest.fn()
			codeMapActionsService.updateEdgePreviews = jest.fn()
			edgeChooserController["_viewModel"].edgeMetric = "metric1"

			edgeChooserController.onEdgeMetricSelected()

			expect(settingsService.updateSettings).toHaveBeenCalledWith({ dynamicSettings: { edgeMetric: "metric1" } })
		})
	})

	describe("filterMetricData()", () => {
		it("should return the all entries if search term is empty", () => {
			let metricData = [
				{ name: "metric1", maxValue: 1, availableInVisibleMaps: true },
				{ name: "metric2", maxValue: 2, availableInVisibleMaps: false }
			]
			edgeChooserController["_viewModel"].searchTerm = ""
			edgeChooserController.onEdgeMetricDataUpdated(metricData)

			edgeChooserController.filterMetricData()

			expect(edgeChooserController["_viewModel"].edgeMetricData).toEqual(metricData)
		})

		it("should return only metrics that include search term", () => {
			let metricData = [
				{ name: "metric1", maxValue: 1, availableInVisibleMaps: true },
				{ name: "metric2", maxValue: 2, availableInVisibleMaps: false }
			]
			edgeChooserController["_viewModel"].searchTerm = "ic2"
			edgeChooserController.onEdgeMetricDataUpdated(metricData)

			edgeChooserController.filterMetricData()

			expect(edgeChooserController["_viewModel"].edgeMetricData).toEqual([
				{ name: "metric2", maxValue: 2, availableInVisibleMaps: false }
			])
		})

		it("should return an empty metric list if it doesn't have the searchTerm as substring", () => {
			let metricData = [
				{ name: "metric1", maxValue: 1, availableInVisibleMaps: true },
				{ name: "metric2", maxValue: 2, availableInVisibleMaps: false }
			]
			edgeChooserController["_viewModel"].searchTerm = "fooBar"
			edgeChooserController.onEdgeMetricDataUpdated(metricData)

			edgeChooserController.filterMetricData()

			expect(edgeChooserController["_viewModel"].edgeMetricData).toEqual([])
		})
	})
	describe("clearSearchTerm()", () => {
		it("should return an empty string, when function is called", () => {
			edgeChooserController["_viewModel"].searchTerm = "someString"

			edgeChooserController.clearSearchTerm()

			expect(edgeChooserController["_viewModel"].searchTerm).toEqual("")
		})

		it("should return the the metricData Array with all Elements, when function is called", () => {
			let metricData = [{ name: "metric1", maxValue: 1, availableInVisibleMaps: true }]
			edgeChooserController["_viewModel"].searchTerm = "rlo"
			edgeChooserController.onEdgeMetricDataUpdated(metricData)

			edgeChooserController.clearSearchTerm()

			expect(edgeChooserController["_viewModel"].edgeMetricData).toEqual(metricData)
		})
	})
})
