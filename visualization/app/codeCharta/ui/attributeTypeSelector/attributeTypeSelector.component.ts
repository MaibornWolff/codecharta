import "./attributeTypeSelector.component.scss"
import { StoreService } from "../../state/store.service"
import { AttributeTypeValue } from "../../codeCharta.model"
import { updateAttributeType } from "../../state/store/fileSettings/attributeTypes/attributeTypes.actions"
import { MetricService } from "../../state/metric.service"
import { EdgeMetricDataService } from "../../state/edgeMetricData.service"

export class AttributeTypeSelectorController {
	private _viewModel: {
		aggregationSymbol: string
	} = {
		aggregationSymbol: ""
	}

	private type: string
	private metric: string

	/* @ngInject */
	constructor(
		private storeService: StoreService,
		private metricService: MetricService,
		private edgeMetricDataService: EdgeMetricDataService
	) {}

	public $onInit() {
		this.setAggregationSymbol()
	}

	public setToAbsolute(metricName: string, category: string) {
		this.setAttributeType(metricName, category, AttributeTypeValue.absolute)
	}

	public setToRelative(metricName: string, category: string) {
		this.setAttributeType(metricName, category, AttributeTypeValue.relative)
	}

	private setAttributeType(metricName: string, category: string, type: AttributeTypeValue) {
		this.storeService.dispatch(updateAttributeType(category, metricName, type))
		this.setAggregationSymbol()
	}

	private setAggregationSymbol() {
		const type =
			this.type === "nodes"
				? this.metricService.getAttributeTypeByMetric(this.metric)
				: this.edgeMetricDataService.getAttributeTypeByMetric(this.metric)
		switch (type) {
			case AttributeTypeValue.relative:
				this._viewModel.aggregationSymbol = "x͂"
				break
			case AttributeTypeValue.absolute:
			default:
				this._viewModel.aggregationSymbol = "Σ"
		}
	}
}

export const attributeTypeSelectorComponent = {
	selector: "attributeTypeSelectorComponent",
	template: require("./attributeTypeSelector.component.html"),
	controller: AttributeTypeSelectorController,
	bindings: { type: "@", metric: "@" }
}
