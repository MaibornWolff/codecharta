import "./metricValueHovered.module"
import { MetricValueHoveredController } from "./metricValueHovered.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService, ITimeoutService } from "angular"
import { SettingsService } from "../../state/settingsService/settings.service"
import { CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { Node } from "../../codeCharta.model"
import { CODE_MAP_BUILDING } from "../../util/dataMocks"
import _ from "lodash"

describe("MetricValueHoveredController", () => {
	let metricValueHoveredController: MetricValueHoveredController
	let $rootScope: IRootScopeService
	let $timeout: ITimeoutService
	let deltaBuilding
	let codeMapBuilding

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.metricValueHovered")

		$rootScope = getService<IRootScopeService>("$rootScope")
		$timeout = getService<ITimeoutService>("$timeout")
	}

	function rebuildController() {
		metricValueHoveredController = new MetricValueHoveredController($rootScope, $timeout)
	}

	function withMockedBuildingTransitions() {
		deltaBuilding = _.cloneDeep(CODE_MAP_BUILDING)
		deltaBuilding.node.attributes = { area: 10, height: 20, color: 30 }
		deltaBuilding.node.deltas = { area: 40, height: 50, color: 60 }

		codeMapBuilding = _.cloneDeep(CODE_MAP_BUILDING)
		codeMapBuilding.node.attributes = { area: 10, height: 20, color: 30 }
		codeMapBuilding.node.deltas = undefined
	}

	describe("constructor", () => {
		beforeEach(() => {
			SettingsService.subscribeToHeightMetric = jest.fn()
			CodeMapMouseEventService.subscribeToBuildingHovered = jest.fn()
			CodeMapMouseEventService.subscribeToBuildingUnhovered = jest.fn()
		})

		it("should subscribe to Height-Metric", () => {
			rebuildController()

			expect(SettingsService.subscribeToHeightMetric).toHaveBeenCalledWith($rootScope, metricValueHoveredController)
		})

		it("should subscribe to Building-Hovered-Event", () => {
			rebuildController()

			expect(CodeMapMouseEventService.subscribeToBuildingHovered).toHaveBeenCalledWith($rootScope, metricValueHoveredController)
		})

		it("should subscribe to Building-Unhovered-Event", () => {
			rebuildController()

			expect(CodeMapMouseEventService.subscribeToBuildingUnhovered).toHaveBeenCalledWith($rootScope, metricValueHoveredController)
		})
	})

	describe("onHeightMetricChanged", () => {
		it("should update the viewModel", () => {
			metricValueHoveredController.onHeightMetricChanged("rloc")

			expect(metricValueHoveredController["_viewModel"].heightMetric).toEqual("rloc")
		})
	})

	describe("onBuildingHovered", () => {
		it("should set hovered values and set hovered deltas to null if not delta", () => {
			withMockedBuildingTransitions()
			metricValueHoveredController["_viewModel"].heightMetric = "height"

			metricValueHoveredController.onBuildingHovered(codeMapBuilding)
			const node: Node = metricValueHoveredController["_viewModel"]["hoveredNode"]

			expect(node.deltas).toBe(undefined)
			expect(node.attributes["area"]).toBe(10)
			expect(node.attributes["color"]).toBe(30)
			expect(node.attributes["height"]).toBe(20)
		})

		it("should set hovered values and deltas if delta", () => {
			withMockedBuildingTransitions()
			metricValueHoveredController["_viewModel"].heightMetric = "height"

			metricValueHoveredController.onBuildingHovered(deltaBuilding)

			const node: Node = metricValueHoveredController["_viewModel"]["hoveredNode"]
			expect(node.deltas["area"]).toBe(40)
			expect(node.attributes["area"]).toBe(10)
			expect(node.deltas["color"]).toBe(60)
			expect(node.attributes["color"]).toBe(30)
			expect(node.deltas["height"]).toBe(50)
			expect(node.attributes["height"]).toBe(20)
		})

		it("hovered delta color should be neutral color if hoveredHeigtDelta is 0", () => {
			withMockedBuildingTransitions()
			metricValueHoveredController["_viewModel"].heightMetric = "height"
			metricValueHoveredController["_viewModel"]["hoveredNode"] = deltaBuilding.node as Node
			metricValueHoveredController["_viewModel"]["hoveredNode"]["deltas"]["height"] = 0

			metricValueHoveredController.onBuildingHovered(deltaBuilding)

			expect(metricValueHoveredController["_viewModel"]["deltaColor"]).toBe("#e6e6e6")
		})

		it("hovered delta color should be positive color if hoveredHeigtDelta is 2", () => {
			withMockedBuildingTransitions()
			metricValueHoveredController["_viewModel"].heightMetric = "height"
			metricValueHoveredController["_viewModel"]["hoveredNode"] = deltaBuilding.node as Node
			metricValueHoveredController["_viewModel"]["hoveredNode"]["deltas"]["height"] = 2

			metricValueHoveredController.onBuildingHovered(deltaBuilding)

			expect(metricValueHoveredController["_viewModel"]["deltaColor"]).toBe("#b1d8a8")
		})

		it("hovered delta color should be negative color if hoveredHeigtDelta is -2", () => {
			withMockedBuildingTransitions()
			metricValueHoveredController["_viewModel"].heightMetric = "height"
			metricValueHoveredController["_viewModel"]["hoveredNode"] = deltaBuilding.node as Node
			metricValueHoveredController["_viewModel"]["hoveredNode"]["deltas"]["height"] = -2

			metricValueHoveredController.onBuildingHovered(deltaBuilding)

			expect(metricValueHoveredController["_viewModel"]["deltaColor"]).toBe("#ffcccc")
		})
	})

	describe("onBuildingUnhovered", () => {
		it("should set hoveredNode to null if data incomplete", () => {
			metricValueHoveredController.onBuildingUnhovered()

			expect(metricValueHoveredController["_viewModel"]["hoveredNode"]).toBe(null)
		})
	})
})
