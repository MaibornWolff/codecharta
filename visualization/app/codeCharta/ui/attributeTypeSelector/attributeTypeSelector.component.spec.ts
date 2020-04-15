import "./attributeTypeSelector.module"
import { AttributeTypeSelectorController } from "./attributeTypeSelector.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { StoreService } from "../../state/store.service"
import { setAttributeTypes } from "../../state/store/fileSettings/attributeTypes/attributeTypes.actions"
import { AttributeTypeValue } from "../../codeCharta.model"
import { MetricService } from "../../state/metric.service"
import { EdgeMetricDataService } from "../../state/edgeMetricData.service"

describe("AttributeTypeSelectorController", () => {
	let attributeTypeSelectorController: AttributeTypeSelectorController
	let storeService: StoreService
	let metricService: MetricService
	let edgeMetricDataService: EdgeMetricDataService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.attributeTypeSelector")
		storeService = getService<StoreService>("storeService")
		metricService = getService<MetricService>("metricService")
		edgeMetricDataService = getService<EdgeMetricDataService>("edgeMetricDataService")
	}

	function rebuildController() {
		attributeTypeSelectorController = new AttributeTypeSelectorController(storeService, metricService, edgeMetricDataService)
	}

	describe("setToAbsolute", () => {
		it("should update attributeType to absolute", () => {
			attributeTypeSelectorController.setToAbsolute("bar", "nodes")

			expect(storeService.getState().fileSettings.attributeTypes.nodes["bar"]).toEqual(AttributeTypeValue.absolute)
		})
	})

	describe("setToRelative", () => {
		it("should set attributeType to relative", () => {
			attributeTypeSelectorController.setToRelative("foo", "edges")

			expect(storeService.getState().fileSettings.attributeTypes.edges["foo"]).toEqual(AttributeTypeValue.relative)
		})
	})

	describe("setAggregationSymbol", () => {
		beforeEach(() => {
			storeService.dispatch(
				setAttributeTypes({
					nodes: { rloc: AttributeTypeValue.absolute },
					edges: { pairingRate: AttributeTypeValue.relative }
				})
			)
		})

		it("should set aggregationSymbol to absolute", () => {
			attributeTypeSelectorController["metric"] = "rloc"
			attributeTypeSelectorController["type"] = "nodes"

			attributeTypeSelectorController.$onInit()

			expect(attributeTypeSelectorController["_viewModel"].aggregationSymbol).toEqual("Σ")
		})

		it("should set aggregationSymbol to relative", () => {
			attributeTypeSelectorController["metric"] = "pairingRate"
			attributeTypeSelectorController["type"] = "edges"

			attributeTypeSelectorController.$onInit()

			expect(attributeTypeSelectorController["_viewModel"].aggregationSymbol).toEqual("x͂")
		})

		it("should set aggregationSymbol to absolute if attributeType is not available", () => {
			attributeTypeSelectorController["metric"] = "foobar"
			attributeTypeSelectorController["type"] = "nodes"

			attributeTypeSelectorController.$onInit()

			expect(attributeTypeSelectorController["_viewModel"].aggregationSymbol).toEqual("Σ")
		})
	})
})
