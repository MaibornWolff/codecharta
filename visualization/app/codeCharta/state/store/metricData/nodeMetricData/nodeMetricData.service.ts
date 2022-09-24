import { StoreService } from "../../../store.service"
import { IRootScopeService } from "angular"
import { NodeMetricData } from "../../../../codeCharta.model"
import { FilesSelectionSubscriber, FilesService } from "../../files/files.service"
import { BlacklistService, BlacklistSubscriber } from "../../fileSettings/blacklist/blacklist.service"
import { nodeMetricDataSelector } from "../../../selectors/accumulatedData/metricData/nodeMetricData.selector"

export interface NodeMetricDataSubscriber {
	onNodeMetricDataChanged(nodeMetricData: NodeMetricData[])
}

export class NodeMetricDataService implements FilesSelectionSubscriber, BlacklistSubscriber {
	private static NODE_METRIC_DATA_CHANGED_EVENT = "node-metric-data-changed"

	private nodeMetricData: NodeMetricData[] = []

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		FilesService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)
	}

	onFilesSelectionChanged() {
		this.updateNodeMetricData()
	}

	onBlacklistChanged() {
		this.updateNodeMetricData()
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
