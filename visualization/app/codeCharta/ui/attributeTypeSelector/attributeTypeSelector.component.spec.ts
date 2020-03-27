import "./attributeTypeSelector.module"
import { AttributeTypeSelectorController } from "./attributeTypeSelector.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { StoreService } from "../../state/store.service"
import { setAttributeTypes } from "../../state/store/fileSettings/attributeTypes/attributeTypes.actions"
import { AttributeTypeValue, State } from "../../codeCharta.model"
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
		withMockedDispatch()
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

	function withMockedDispatch() {
		attributeTypeSelectorController["storeService"].dispatch = jest.fn(() => {})
		storeService.getState = () => {
			return ({ fileSettings: { attributeTypes: { nodes: { bar: "relative" }, edges: {} } } } as unknown) as State
		}
	}

	describe("setToAbsolute", () => {
		it("should change attributeType to absolute", () => {
			const expected = setAttributeTypes({ nodes: { bar: AttributeTypeValue.absolute }, edges: {} })

			attributeTypeSelectorController.setToAbsolute("bar", "nodes")

			expect(storeService.dispatch).toBeCalledWith(expected)
		})

		it("should set attributeType to absolute for previously non-available metric", () => {
			const expected = setAttributeTypes({ nodes: { foo: AttributeTypeValue.absolute, bar: AttributeTypeValue.relative }, edges: {} })

			attributeTypeSelectorController.setToAbsolute("foo", "nodes")

			expect(storeService.dispatch).toBeCalledWith(expected)
		})
	})

	describe("setToRelative", () => {
		it("should set attributeType to relative", () => {
			const expected = setAttributeTypes({ nodes: { bar: AttributeTypeValue.relative }, edges: { foo: AttributeTypeValue.relative } })

			attributeTypeSelectorController.setToRelative("foo", "edges")

			expect(storeService.dispatch).toBeCalledWith(expected)
		})
	})

	describe("setAggregationSymbol", () => {
		beforeEach(() => {
			storeService.getState = jest.fn().mockReturnValue({
				fileSettings: {
					attributeTypes: {
						nodes: { rloc: AttributeTypeValue.absolute },
						edges: { pairingRate: AttributeTypeValue.relative }
					}
				}
			})
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
