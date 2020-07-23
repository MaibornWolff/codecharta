import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { NodeMetricDataActions, calculateNewNodeMetricData } from "./nodeMetricData.actions"
import { isActionOfType } from "../../../../util/reduxHelper"
import { AttributeTypes, AttributeTypeValue, BlacklistItem, NodeMetricData } from "../../../../codeCharta.model"
import { FilesSelectionSubscriber, FilesService } from "../../files/files.service"
import { BlacklistService, BlacklistSubscriber } from "../../fileSettings/blacklist/blacklist.service"
import { AttributeTypesService, AttributeTypesSubscriber } from "../../fileSettings/attributeTypes/attributeTypes.service"
import { FileState } from "../../../../model/files/files"

export interface NodeMetricDataSubscriber {
	onNodeMetricDataChanged(nodeMetricData: NodeMetricData[])
}

export class NodeMetricDataService implements StoreSubscriber, FilesSelectionSubscriber, BlacklistSubscriber, AttributeTypesSubscriber {
	private static NODE_METRIC_DATA_CHANGED_EVENT = "node-metric-data-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)
		AttributeTypesService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, NodeMetricDataActions)) {
			this.notify(this.select())
		}
	}

	public onFilesSelectionChanged(files: FileState[]) {
		this.storeService.dispatch(calculateNewNodeMetricData(files, this.storeService.getState().fileSettings.blacklist))
	}

	public onBlacklistChanged(blacklist: BlacklistItem[]) {
		this.storeService.dispatch(calculateNewNodeMetricData(this.storeService.getState().files, blacklist))
	}

	public onAttributeTypesChanged(attributeTypes: AttributeTypes) {
		this.storeService.dispatch(
			calculateNewNodeMetricData(this.storeService.getState().files, this.storeService.getState().fileSettings.blacklist)
		)
	}

	public getMetrics(): string[] {
		return this.storeService.getState().metricData.nodeMetricData.map(x => x.name)
	}

	public isMetricAvailable(metricName: string): boolean {
		return this.storeService.getState().metricData.nodeMetricData.some(x => x.name == metricName)
	}

	public getMaxMetricByMetricName(metricName: string): number {
		const metric: NodeMetricData = this.storeService.getState().metricData.nodeMetricData.find(x => x.name == metricName)
		return metric ? metric.maxValue : undefined
	}

	public getAttributeTypeByMetric(metricName: string): AttributeTypeValue {
		return this.storeService.getState().fileSettings.attributeTypes.nodes[metricName]
	}

	private select() {
		return this.storeService.getState().metricData.nodeMetricData
	}

	private notify(newState: NodeMetricData[]) {
		this.$rootScope.$broadcast(NodeMetricDataService.NODE_METRIC_DATA_CHANGED_EVENT, { nodeMetricData: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: NodeMetricDataSubscriber) {
		$rootScope.$on(NodeMetricDataService.NODE_METRIC_DATA_CHANGED_EVENT, (event, data) => {
			subscriber.onNodeMetricDataChanged(data.nodeMetricData)
		})
	}
}
