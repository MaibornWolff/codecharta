import "./attributeTypeSelector.component.scss"
import { StoreService } from "../../state/store.service"
import { AttributeTypeValue } from "../../codeCharta.model"
import { AttributeTypesActions, updateAttributeType } from "../../state/store/fileSettings/attributeTypes/attributeTypes.actions"
import { NodeMetricDataService } from "../../state/store/metricData/nodeMetricData/nodeMetricData.service"
import { EdgeMetricDataService } from "../../state/store/metricData/edgeMetricData/edgeMetricData.service"
import { IRootScopeService } from "angular"

export class AttributeTypeSelectorController {
	private _viewModel: {
		aggregationSymbol: string
	} = {
		aggregationSymbol: ""
	}

	private type: string
	private metric: string

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private nodeMetricDataService: NodeMetricDataService,
		private edgeMetricDataService: EdgeMetricDataService
	) {
		this.$rootScope.$on(StoreService.STORE_CHANGED_EVENT, (_event_, data) => {
			if (data.actionType === AttributeTypesActions.UPDATE_ATTRIBUTE_TYPE) {
				this.setAggregationSymbol()
			}
		})
		"ngInject"
	}

	$onInit() {
		this.setAggregationSymbol()
	}

	setToAbsolute(metricName: string, category: string) {
		this.setAttributeType(metricName, category, AttributeTypeValue.absolute)
	}

	setToRelative(metricName: string, category: string) {
		this.setAttributeType(metricName, category, AttributeTypeValue.relative)
	}

	private setAttributeType(metricName: string, category: string, type: AttributeTypeValue) {
		this.storeService.dispatch(updateAttributeType(category, metricName, type))
		this.setAggregationSymbol()
	}

	private setAggregationSymbol() {
		const type =
			this.type === "nodes"
				? this.nodeMetricDataService.getAttributeTypeByMetric(this.metric)
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
