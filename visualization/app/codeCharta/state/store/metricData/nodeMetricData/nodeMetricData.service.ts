import { StoreService } from "../../../store.service"
import { IRootScopeService } from "angular"
import { NodeMetricData } from "../../../../codeCharta.model"
import { FilesSelectionSubscriber, FilesService } from "../../files/files.service"
import { BlacklistService, BlacklistSubscriber } from "../../fileSettings/blacklist/blacklist.service"
import { AttributeTypesService, AttributeTypesSubscriber } from "../../fileSettings/attributeTypes/attributeTypes.service"
import { nodeMetricDataSelector } from "../../../selectors/accumulatedData/metricData/nodeMetricData.selector"

export interface NodeMetricDataSubscriber {
	onNodeMetricDataChanged(nodeMetricData: NodeMetricData[])
}

export class NodeMetricDataService implements FilesSelectionSubscriber, BlacklistSubscriber, AttributeTypesSubscriber {
	static UNARY_METRIC = "unary"
	private static NODE_METRIC_DATA_CHANGED_EVENT = "node-metric-data-changed"
	private nodeMetricData: NodeMetricData[]

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		FilesService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)
		AttributeTypesService.subscribe(this.$rootScope, this)
	}

	onFilesSelectionChanged() {
		this.updateNodeMetricData()
	}

	onBlacklistChanged() {
		this.updateNodeMetricData()
	}

	// This shouldn't be needed, as nodeMetricData is not dependent on AttributeTypesChanged, but switching to median in attribute side bar breaks without it
	onAttributeTypesChanged() {
		const nodeMetricData = nodeMetricDataSelector(this.storeService.getState())
		this.$rootScope.$broadcast(NodeMetricDataService.NODE_METRIC_DATA_CHANGED_EVENT, { nodeMetricData })
	}

	getMetrics() {
		return this.nodeMetricData.map(x => x.name)
	}

	isMetricAvailable(metricName: string) {
		return this.nodeMetricData?.some(x => x.name === metricName)
	}

	getMaxValueOfMetric(metricName: string) {
		const metric = this.nodeMetricData.find(x => x.name === metricName)
		return metric?.maxValue
	}

	getMinValueOfMetric(metricName: string) {
		const metric = this.nodeMetricData.find(x => x.name === metricName)
		return metric ? metric.minValue : 0
	}

	getAttributeTypeByMetric(metricName: string) {
		return this.storeService.getState().fileSettings.attributeTypes.nodes[metricName]
	}

	private updateNodeMetricData() {
		const nodeMetricData = nodeMetricDataSelector(this.storeService.getState())
		if (nodeMetricData !== this.nodeMetricData) {
			this.nodeMetricData = nodeMetricData
			this.$rootScope.$broadcast(NodeMetricDataService.NODE_METRIC_DATA_CHANGED_EVENT, { nodeMetricData })
		}
	}

	static subscribe($rootScope: IRootScopeService, subscriber: NodeMetricDataSubscriber) {
		$rootScope.$on(NodeMetricDataService.NODE_METRIC_DATA_CHANGED_EVENT, (_event_, data) => {
			subscriber.onNodeMetricDataChanged(data.nodeMetricData)
		})
	}
}
