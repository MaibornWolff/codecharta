import { StoreService } from "../../../store.service"
import { IRootScopeService } from "angular"
import { EdgeMetricData } from "../../../../codeCharta.model"
import { BlacklistService, BlacklistSubscriber } from "../../fileSettings/blacklist/blacklist.service"
import { FilesSelectionSubscriber, FilesService } from "../../files/files.service"
import { edgeMetricDataSelector } from "../../../selectors/accumulatedData/metricData/edgeMetricData.selector"

export interface EdgeMetricDataSubscriber {
	onEdgeMetricDataChanged(edgeMetricData: EdgeMetricData[])
}

export class EdgeMetricDataService implements BlacklistSubscriber, FilesSelectionSubscriber {
	private static EDGE_METRIC_DATA_CHANGED_EVENT = "edge-metric-data-changed"

	private edgeMetricData: EdgeMetricData[]

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		"ngInject"
		BlacklistService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
	}

	onBlacklistChanged() {
		this.updateEdgeMetricData()
	}

	onFilesSelectionChanged() {
		this.updateEdgeMetricData()
	}

	private updateEdgeMetricData() {
		const edgeMetricData = edgeMetricDataSelector(this.storeService.getState())
		if (edgeMetricData !== this.edgeMetricData) {
			this.edgeMetricData = edgeMetricData
			this.$rootScope.$broadcast(EdgeMetricDataService.EDGE_METRIC_DATA_CHANGED_EVENT, { edgeMetricData })
		}
	}

	static subscribe($rootScope: IRootScopeService, subscriber: EdgeMetricDataSubscriber) {
		$rootScope.$on(EdgeMetricDataService.EDGE_METRIC_DATA_CHANGED_EVENT, (_event_, data) => {
			subscriber.onEdgeMetricDataChanged(data.edgeMetricData)
		})
	}
}
