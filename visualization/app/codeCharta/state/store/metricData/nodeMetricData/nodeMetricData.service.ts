import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { NodeMetricDataActions, calculateNewNodeMetricData } from "./nodeMetricData.actions"
import { isActionOfType } from "../../../../util/reduxHelper"
import { BlacklistItem, NodeMetricData } from "../../../../codeCharta.model"
import { FilesSelectionSubscriber, FilesService } from "../../files/files.service"
import { BlacklistService, BlacklistSubscriber } from "../../fileSettings/blacklist/blacklist.service"
import { AttributeTypesService, AttributeTypesSubscriber } from "../../fileSettings/attributeTypes/attributeTypes.service"
import { FileState } from "../../../../model/files/files"
import { DialogService } from "../../../../ui/dialog/dialog.service"

export interface NodeMetricDataSubscriber {
	onNodeMetricDataChanged(nodeMetricData: NodeMetricData[])
}

export class NodeMetricDataService implements StoreSubscriber, FilesSelectionSubscriber, BlacklistSubscriber, AttributeTypesSubscriber {
	private static NODE_METRIC_DATA_CHANGED_EVENT = "node-metric-data-changed"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService, private dialogService: DialogService) {
		StoreService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)
		AttributeTypesService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, NodeMetricDataActions)) {
			this.notify(this.select())
		}
	}

	onFilesSelectionChanged(files: FileState[]) {
		try {
			this.storeService.dispatch(calculateNewNodeMetricData(files, this.storeService.getState().fileSettings.blacklist))
		} catch (error) {
			this.dialogService.showErrorDialog(error.message, "Could not load metrics")
		}
	}

	onBlacklistChanged(blacklist: BlacklistItem[]) {
		this.storeService.dispatch(calculateNewNodeMetricData(this.storeService.getState().files, blacklist))
	}

	onAttributeTypesChanged() {
		this.storeService.dispatch(
			calculateNewNodeMetricData(this.storeService.getState().files, this.storeService.getState().fileSettings.blacklist)
		)
	}

	getMetrics() {
		return this.storeService.getState().metricData.nodeMetricData.map(x => x.name)
	}

	isMetricAvailable(metricName: string) {
		return this.storeService.getState().metricData.nodeMetricData.some(x => x.name === metricName)
	}

	getMaxMetricByMetricName(metricName: string) {
		const metric = this.storeService.getState().metricData.nodeMetricData.find(x => x.name === metricName)
		return metric?.maxValue
	}

	getAttributeTypeByMetric(metricName: string) {
		return this.storeService.getState().fileSettings.attributeTypes.nodes[metricName]
	}

	private select() {
		return this.storeService.getState().metricData.nodeMetricData
	}

	private notify(newState: NodeMetricData[]) {
		this.$rootScope.$broadcast(NodeMetricDataService.NODE_METRIC_DATA_CHANGED_EVENT, { nodeMetricData: newState })
	}

	static subscribe($rootScope: IRootScopeService, subscriber: NodeMetricDataSubscriber) {
		$rootScope.$on(NodeMetricDataService.NODE_METRIC_DATA_CHANGED_EVENT, (_event_, data) => {
			subscriber.onNodeMetricDataChanged(data.nodeMetricData)
		})
	}
}
