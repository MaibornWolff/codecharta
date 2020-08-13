import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { calculateNewEdgeMetricData, EdgeMetricDataActions } from "./edgeMetricData.actions"
import { isActionOfType } from "../../../../util/reduxHelper"
import { AttributeTypes, AttributeTypeValue, BlacklistItem, CodeMapNode, EdgeMetricData } from "../../../../codeCharta.model"
import { FileState } from "../../../../model/files/files"
import { HierarchyNode } from "d3"
import { BlacklistService, BlacklistSubscriber } from "../../fileSettings/blacklist/blacklist.service"
import { FilesSelectionSubscriber, FilesService } from "../../files/files.service"
import { EdgeMetricCountMap, nodeEdgeMetricsMap } from "./edgeMetricData.reducer"
import { AttributeTypesService, AttributeTypesSubscriber } from "../../fileSettings/attributeTypes/attributeTypes.service"

export interface EdgeMetricDataSubscriber {
	onEdgeMetricDataChanged(edgeMetricData: EdgeMetricData[])
}

export class EdgeMetricDataService implements StoreSubscriber, BlacklistSubscriber, FilesSelectionSubscriber, AttributeTypesSubscriber {
	private static EDGE_METRIC_DATA_CHANGED_EVENT = "edge-metric-data-changed"
	public static NONE_METRIC = "None"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
		AttributeTypesService.subscribe(this.$rootScope, this)
	}

	public onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, EdgeMetricDataActions)) {
			this.notify(this.select())
		}
	}

	public onBlacklistChanged(blacklist: BlacklistItem[]) {
		this.storeService.dispatch(calculateNewEdgeMetricData(this.storeService.getState().files, blacklist))
	}

	public onFilesSelectionChanged(files: FileState[]) {
		this.storeService.dispatch(calculateNewEdgeMetricData(files, this.storeService.getState().fileSettings.blacklist))
	}

	public onAttributeTypesChanged(attributeTypes: AttributeTypes) {
		this.storeService.dispatch(
			calculateNewEdgeMetricData(this.storeService.getState().files, this.storeService.getState().fileSettings.blacklist)
		)
	}

	public getMetricNames(): string[] {
		return this.storeService.getState().metricData.edgeMetricData.map(x => x.name)
	}

	public getAmountOfAffectedBuildings(metricName: string): number {
		const nodeEdgeMetrics = nodeEdgeMetricsMap.get(metricName)
		return nodeEdgeMetrics === undefined ? 0 : nodeEdgeMetrics.size
	}

	public getNodesWithHighestValue(metricName: string, amountOfEdgePreviews: number): string[] {
		const nodeEdgeMetrics = nodeEdgeMetricsMap.get(metricName)
		const keys = []

		if (nodeEdgeMetrics === undefined) {
			return keys
		}

		for (const key of nodeEdgeMetrics.keys()) {
			keys.push(key)
			if (keys.length === amountOfEdgePreviews) {
				break
			}
		}
		return keys
	}

	public getMetricValuesForNode(node: HierarchyNode<CodeMapNode>): EdgeMetricCountMap {
		const nodeEdgeMetrics = new Map()

		for (const metricName of this.getMetricNames()) {
			const edgeMetricCount = nodeEdgeMetricsMap.get(metricName)
			if (edgeMetricCount) {
				nodeEdgeMetrics.set(metricName, edgeMetricCount.get(node.data.path))
			}
		}

		return nodeEdgeMetrics
	}

	public getAttributeTypeByMetric(metricName: string): AttributeTypeValue {
		return this.storeService.getState().fileSettings.attributeTypes.edges[metricName]
	}

	private select() {
		return this.storeService.getState().metricData.edgeMetricData
	}

	private notify(newState: EdgeMetricData[]) {
		this.$rootScope.$broadcast(EdgeMetricDataService.EDGE_METRIC_DATA_CHANGED_EVENT, { edgeMetricData: newState })
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: EdgeMetricDataSubscriber) {
		$rootScope.$on(EdgeMetricDataService.EDGE_METRIC_DATA_CHANGED_EVENT, (event, data) => {
			subscriber.onEdgeMetricDataChanged(data.edgeMetricData)
		})
	}
}
