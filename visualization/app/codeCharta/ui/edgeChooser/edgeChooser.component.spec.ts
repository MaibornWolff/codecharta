import "./edgeChooser.module"
import { EdgeChooserController } from "./edgeChooser.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { EdgeMetricService } from "../../state/edgeMetric.service"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settingsService/settings.service"
import { CodeMapActionsService } from "../codeMap/codeMap.actions.service"
import { CodeMapMouseEventService, CodeMapBuildingTransition } from "../codeMap/codeMap.mouseEvent.service"

describe("EdgeChooserController", () => {
	let edgeChooserController: EdgeChooserController
	let $rootScope: IRootScopeService
	let edgeMetricService: EdgeMetricService
	let codeMapActionsService: CodeMapActionsService
	let settingsService: SettingsService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.edgeChooser")

		$rootScope = getService<IRootScopeService>("$rootScope")
		edgeMetricService = getService<EdgeMetricService>("edgeMetricService")
		codeMapActionsService = getService<CodeMapActionsService>("codeMapActionsService")
		settingsService = getService<SettingsService>("settingsService")
	}

	function rebuildController() {
		edgeChooserController = new EdgeChooserController($rootScope, edgeMetricService, codeMapActionsService, settingsService)
	}

	describe("constructor", () => {
		it("should subscribe to EdgeMetricService", () => {
			EdgeMetricService.subscribe = jest.fn()

			rebuildController()

			expect(EdgeMetricService.subscribe).toHaveBeenCalledWith($rootScope, edgeChooserController)
		})

		it("should subscribe to CodeMapMouseEventService, hovered buildings", () => {
			CodeMapMouseEventService.subscribeToBuildingHoveredEvents = jest.fn()

			rebuildController()

			expect(EdgeMetricService.subscribe).toHaveBeenCalledWith($rootScope, edgeChooserController)
		})
	})

	describe("onEdgeMetricDataUpdated", () => {
		it("should add non metric", () => {
			edgeChooserController.onEdgeMetricDataUpdated([])

			expect(edgeChooserController["_viewModel"].edgeMetricData.map(x => x.name)).toContain("None")
		})

		it("should store edge data", () => {
			const metricData = [
				{ name: "metric1", maxValue: 22, availableInVisibleMaps: true },
				{ name: "metric2", maxValue: 1, availableInVisibleMaps: false }
			]

			edgeChooserController.onEdgeMetricDataUpdated(metricData)

			expect(edgeChooserController["_viewModel"].edgeMetricData.map(x => x.name)).toContain("None")
			expect(edgeChooserController["_viewModel"].edgeMetricData.map(x => x.name)).toContain("metric1")
			expect(edgeChooserController["_viewModel"].edgeMetricData.map(x => x.name)).toContain("metric2")
		})

		it("should keep selected metric if available in new map", () => {
			const metricData = [{ name: "metric1", maxValue: 22, availableInVisibleMaps: true }]
			edgeChooserController["_viewModel"].edgeMetric = "metric1"

			edgeChooserController.onEdgeMetricDataUpdated(metricData)

			expect(edgeChooserController["_viewModel"].edgeMetric).toEqual("metric1")
		})

		it("should update edge metric if selected one is no longer available", () => {
			const metricData = [{ name: "metric2", maxValue: 22, availableInVisibleMaps: true }]
			edgeChooserController["_viewModel"].edgeMetric = "metric1"

			edgeChooserController.onEdgeMetricDataUpdated(metricData)

			expect(edgeChooserController["_viewModel"].edgeMetric).toEqual("metric2")
		})
	})

	describe("onBuildingHovered", () => {
		it("should set hovered value to null if no node is hovered", () => {
			const data = { to: { node: {} } } as CodeMapBuildingTransition
			edgeChooserController["_viewModel"].hoveredEdgeValue = { incoming: 22, outgoing: 42 }

			edgeChooserController.onBuildingHovered(data)

			expect((edgeChooserController["_viewModel"].hoveredEdgeValue = null))
		})

		it("should update hoveredEdgeValue according to hovered building", () => {
			const metricData = { name: "metric2", maxValue: 22, availableInVisibleMaps: true }
			const data = ({ to: { node: { edgeAttributes: metricData } } } as unknown) as CodeMapBuildingTransition

			edgeChooserController.onBuildingHovered(data)

			expect((edgeChooserController["_viewModel"].hoveredEdgeValue = null))
		})
	})

	describe("onEdgeMetricSelected", () => {
		it("should update Edge Previews", () => {
			codeMapActionsService.updateEdgePreviews = jest.fn()

			edgeChooserController.onEdgeMetricSelected()

			expect(codeMapActionsService.updateEdgePreviews).toHaveBeenCalled()
		})

		it("should update Settings", () => {
			settingsService.updateSettings = jest.fn()
			codeMapActionsService.updateEdgePreviews = jest.fn()
			edgeChooserController["_viewModel"].edgeMetric = "metric1"

			edgeChooserController.onEdgeMetricSelected()

			expect(settingsService.updateSettings).toHaveBeenCalledWith({ dynamicSettings: { edgeMetric: "metric1" } })
		})
	})
})
