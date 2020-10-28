import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { calculateNewEdgeMetricData, EdgeMetricDataActions } from "./edgeMetricData.actions"
import { isActionOfType } from "../../../../util/reduxHelper"
import { BlacklistItem, CodeMapNode, EdgeMetricData } from "../../../../codeCharta.model"
import { FileState } from "../../../../model/files/files"
import { HierarchyNode } from "d3-hierarchy"
import { BlacklistService, BlacklistSubscriber } from "../../fileSettings/blacklist/blacklist.service"
import { FilesSelectionSubscriber, FilesService } from "../../files/files.service"
import { EdgeMetricCountMap, nodeEdgeMetricsMap } from "./edgeMetricData.reducer"
import { AttributeTypesService, AttributeTypesSubscriber } from "../../fileSettings/attributeTypes/attributeTypes.service"

export interface EdgeMetricDataSubscriber {
	onEdgeMetricDataChanged(edgeMetricData: EdgeMetricData[])
}

export class EdgeMetricDataService implements StoreSubscriber, BlacklistSubscriber, FilesSelectionSubscriber, AttributeTypesSubscriber {
	private static EDGE_METRIC_DATA_CHANGED_EVENT = "edge-metric-data-changed"
	static NONE_METRIC = "None"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
		AttributeTypesService.subscribe(this.$rootScope, this)
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, EdgeMetricDataActions)) {
			this.notify(this.select())
		}
	}

	onBlacklistChanged(blacklist: BlacklistItem[]) {
		this.storeService.dispatch(calculateNewEdgeMetricData(this.storeService.getState().files, blacklist))
	}

	onFilesSelectionChanged(files: FileState[]) {
		this.storeService.dispatch(calculateNewEdgeMetricData(files, this.storeService.getState().fileSettings.blacklist))
	}

	onAttributeTypesChanged() {
		this.storeService.dispatch(
			calculateNewEdgeMetricData(this.storeService.getState().files, this.storeService.getState().fileSettings.blacklist)
		)
	}

	getMetricNames() {
		return this.storeService.getState().metricData.edgeMetricData.map(x => x.name)
	}

	getAmountOfAffectedBuildings(metricName: string) {
		const nodeEdgeMetrics = nodeEdgeMetricsMap.get(metricName)
		return nodeEdgeMetrics === undefined ? 0 : nodeEdgeMetrics.size
	}

	getNodesWithHighestValue(metricName: string, amountOfEdgePreviews: number) {
		const nodeEdgeMetrics = nodeEdgeMetricsMap.get(metricName)
		const keys: string[] = []

		if (nodeEdgeMetrics === undefined) {
			return keys
		}

		if (amountOfEdgePreviews === 0) {
			return null
		}

		for (const key of nodeEdgeMetrics.keys()) {
			keys.push(key)
			if (keys.length === amountOfEdgePreviews) {
				break
			}
		}
		return keys
	}

	getMetricValuesForNode(node: HierarchyNode<CodeMapNode>, metricNames: string[]) {
		const nodeEdgeMetrics: EdgeMetricCountMap = new Map()

		for (const metricName of metricNames) {
			const edgeMetricCount = nodeEdgeMetricsMap.get(metricName)
			if (edgeMetricCount) {
				nodeEdgeMetrics.set(metricName, edgeMetricCount.get(node.data.path))
			}
		}

		return nodeEdgeMetrics
	}

	getAttributeTypeByMetric(metricName: string) {
		return this.storeService.getState().fileSettings.attributeTypes.edges[metricName]
	}

	private select() {
		return this.storeService.getState().metricData.edgeMetricData
	}

	private notify(newState: EdgeMetricData[]) {
		this.$rootScope.$broadcast(EdgeMetricDataService.EDGE_METRIC_DATA_CHANGED_EVENT, { edgeMetricData: newState })
	}

	static subscribe($rootScope: IRootScopeService, subscriber: EdgeMetricDataSubscriber) {
		$rootScope.$on(EdgeMetricDataService.EDGE_METRIC_DATA_CHANGED_EVENT, (_event_, data) => {
			subscriber.onEdgeMetricDataChanged(data.edgeMetricData)
		})
	}
}
