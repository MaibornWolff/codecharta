import "./metricType.module"
import { MetricSelections, MetricTypeController } from "./metricType.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { MetricService } from "../../state/metric.service"
import { IRootScopeService } from "angular"
import { AttributeTypeValue } from "../../codeCharta.model"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { StoreService } from "../../state/store.service"
import { AreaMetricService } from "../../state/store/dynamicSettings/areaMetric/areaMetric.service"
import { HeightMetricService } from "../../state/store/dynamicSettings/heightMetric/heightMetric.service"
import { ColorMetricService } from "../../state/store/dynamicSettings/colorMetric/colorMetric.service"
import { setAttributeTypes } from "../../state/store/fileSettings/attributeTypes/attributeTypes.actions"
import { EdgeMetricDataService } from "../../state/edgeMetricData.service"
import { EdgeMetricService } from "../../state/store/dynamicSettings/edgeMetric/edgeMetric.service"
import { setEdgeMetric } from "../../state/store/dynamicSettings/edgeMetric/edgeMetric.actions"
import { setHeightMetric } from "../../state/store/dynamicSettings/heightMetric/heightMetric.actions"

describe("MetricTypeController", () => {
	let metricTypeController: MetricTypeController
	let $rootScope: IRootScopeService
	let metricService: MetricService
	let storeService: StoreService
	let edgeMetricDataService: EdgeMetricDataService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.metricType")

		$rootScope = getService<IRootScopeService>("$rootScope")
		metricService = getService<MetricService>("metricService")
		storeService = getService<StoreService>("storeService")
		edgeMetricDataService = getService<EdgeMetricDataService>("edgeMetricDataService")
	}

	function rebuildController() {
		metricTypeController = new MetricTypeController($rootScope, metricService, edgeMetricDataService, storeService)
	}

	describe("constructor", () => {
		beforeEach(() => {
			AreaMetricService.subscribe = jest.fn()
			HeightMetricService.subscribe = jest.fn()
			ColorMetricService.subscribe = jest.fn()
			EdgeMetricService.subscribe = jest.fn()
			CodeMapMouseEventService.subscribeToBuildingHovered = jest.fn()
			CodeMapMouseEventService.subscribeToBuildingUnhovered = jest.fn()
		})

		it("should subscribe to Metric-Events", () => {
			rebuildController()

			expect(AreaMetricService.subscribe).toHaveBeenCalledWith($rootScope, metricTypeController)
			expect(HeightMetricService.subscribe).toHaveBeenCalledWith($rootScope, metricTypeController)
			expect(ColorMetricService.subscribe).toHaveBeenCalledWith($rootScope, metricTypeController)
			expect(EdgeMetricService.subscribe).toHaveBeenCalledWith($rootScope, metricTypeController)
		})

		it("should subscribe to CodeMapMouseEventService", () => {
			rebuildController()

			expect(CodeMapMouseEventService.subscribeToBuildingHovered).toHaveBeenCalledWith(
				$rootScope,
				metricTypeController
			)
			expect(CodeMapMouseEventService.subscribeToBuildingUnhovered).toHaveBeenCalledWith(
				$rootScope,
				metricTypeController
			)
		})
	})

	describe("onAreaMetricChanged", () => {
		it("should set the areaMetricType to absolute", () => {
			storeService.dispatch(setAttributeTypes({ nodes: { rloc: AttributeTypeValue.absolute }, edges: {} }))
			metricTypeController["metricSelection"] = MetricSelections.areaMetric

			metricTypeController.onAreaMetricChanged("rloc")

			expect(metricTypeController["_viewModel"].metricType).toBe(AttributeTypeValue.absolute)
		})
	})

	describe("onHeightMetricChanged", () => {
		it("should set the heightMetricType to absolute", () => {
			storeService.dispatch(setAttributeTypes({ nodes: { mcc: AttributeTypeValue.absolute }, edges: {} }))
			metricTypeController["metricSelection"] = MetricSelections.heightMetric

			metricTypeController.onHeightMetricChanged("mcc")

			expect(metricTypeController["_viewModel"].metricType).toBe(AttributeTypeValue.absolute)
		})
	})

	describe("onColorMetricChanged", () => {
		it("should set the colorMetricType to relative", () => {
			storeService.dispatch(setAttributeTypes({ nodes: { coverage: AttributeTypeValue.relative }, edges: {} }))
			metricTypeController["metricSelection"] = MetricSelections.colorMetric

			metricTypeController.onColorMetricChanged("coverage")

			expect(metricTypeController["_viewModel"].metricType).toBe(AttributeTypeValue.relative)
		})
	})

	describe("onEdgeMetricChanged", () => {
		it("should set the edgeMetricType to relative", () => {
			storeService.dispatch(setAttributeTypes({ nodes: {}, edges: { foo: AttributeTypeValue.relative } }))
			metricTypeController["metricSelection"] = MetricSelections.edgeMetric

			metricTypeController.onEdgeMetricChanged("foo")

			expect(metricTypeController["_viewModel"].metricType).toBe(AttributeTypeValue.relative)
		})
	})

	describe("onMetricDataAdded", () => {
		it("should update metricType for node selections", () => {
			storeService.dispatch(setAttributeTypes({ nodes: {}, edges: { foo: AttributeTypeValue.relative } }))
			storeService.dispatch(setHeightMetric("foo"))
			metricTypeController["metricSelection"] = MetricSelections.heightMetric
			metricService.getAttributeTypeByMetric = jest.fn().mockReturnValue(AttributeTypeValue.relative)

			metricTypeController.onMetricDataAdded()

			expect(metricService.getAttributeTypeByMetric).toBeCalledWith("foo")
			expect(metricTypeController["_viewModel"].metricType).toBe(AttributeTypeValue.relative)
		})

		it("should update metricType for edge selection", () => {
			storeService.dispatch(setAttributeTypes({ nodes: {}, edges: { foo: AttributeTypeValue.relative } }))
			storeService.dispatch(setEdgeMetric("foo"))
			metricTypeController["metricSelection"] = MetricSelections.edgeMetric
			edgeMetricDataService.getAttributeTypeByMetric = jest.fn().mockReturnValue(AttributeTypeValue.relative)

			metricTypeController.onMetricDataAdded()

			expect(edgeMetricDataService.getAttributeTypeByMetric).toBeCalledWith("foo")
			expect(metricTypeController["_viewModel"].metricType).toBe(AttributeTypeValue.relative)
		})
	})

	describe("onBuildingHovered", () => {
		it("should set isBuildingHovered to true", () => {
			metricTypeController.onBuildingHovered({ node: { isLeaf: false } } as CodeMapBuilding)

			expect(metricTypeController["_viewModel"].isFolderHovered).toBeTruthy()
		})

		it("should not set isBuildingHovered to true if building is a leaf", () => {
			metricTypeController.onBuildingHovered({
				node: { isLeaf: true }
			} as CodeMapBuilding)

			expect(metricTypeController["_viewModel"].isFolderHovered).toBeFalsy()
		})

		it("should set isBuildingHovered to true when going from a folder to another folder", () => {
			metricTypeController.onBuildingHovered({
				node: { isLeaf: false }
			} as CodeMapBuilding)

			expect(metricTypeController["_viewModel"].isFolderHovered).toBeTruthy()
		})

		it("should set isBuildingHovered to false when going from a folder to leaf", () => {
			metricTypeController.onBuildingHovered({
				node: { isLeaf: false }
			} as CodeMapBuilding)

			metricTypeController.onBuildingHovered({
				node: { isLeaf: true }
			} as CodeMapBuilding)

			expect(metricTypeController["_viewModel"].isFolderHovered).toBeFalsy()
		})
	})

	describe("onBuildingUnhovered", () => {
		it("should set isBuildingHovered to false", () => {
			metricTypeController.onBuildingUnhovered()

			expect(metricTypeController["_viewModel"].isFolderHovered).toBeFalsy()
		})
	})
})
