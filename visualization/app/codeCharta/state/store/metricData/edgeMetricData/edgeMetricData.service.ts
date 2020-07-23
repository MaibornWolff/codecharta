import { StoreService, StoreSubscriber } from "../../../store.service"
import { IRootScopeService } from "angular"
import { calculateNewEdgeMetricData, EdgeMetricDataActions } from "./edgeMetricData.actions"
import { isActionOfType } from "../../../../util/reduxHelper"
import { AttributeTypeValue, BlacklistItem, CodeMapNode, EdgeMetricCount, EdgeMetricData } from "../../../../codeCharta.model"
import { FileState } from "../../../../model/files/files"
import { HierarchyNode } from "d3"
import { BlacklistService } from "../../fileSettings/blacklist/blacklist.service"
import { FilesService } from "../../files/files.service"
import { nodeEdgeMetricsMap } from "./edgeMetricData.reducer"

export interface EdgeMetricDataSubscriber {
	onEdgeMetricDataChanged(edgeMetricData: EdgeMetricData[])
}

export class EdgeMetricDataService implements StoreSubscriber {
	private static EDGE_METRIC_DATA_CHANGED_EVENT = "edge-metric-data-changed"
	public static NONE_METRIC = "None"

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		StoreService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
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

	public getMetricNames(): string[] {
		if (!this.storeService.getState().metricData.edgeMetricData) {
			return []
		}

		return this.storeService.getState().metricData.edgeMetricData.map(x => x.name)
	}

	public getAmountOfAffectedBuildings(metricName: string): number {
		if (!nodeEdgeMetricsMap || !nodeEdgeMetricsMap.has(metricName)) {
			return 0
		}
		return nodeEdgeMetricsMap.get(metricName).size
	}

	public getNodesWithHighestValue(metricName: string, numberOfNodes: number): string[] {
		if (!nodeEdgeMetricsMap || !nodeEdgeMetricsMap.has(metricName)) {
			return []
		}

		const highestEdgeCountBuildings: string[] = []
		const edgeMetricMapKeyIterator = nodeEdgeMetricsMap.get(metricName).keys()
		for (let i = 0; i < numberOfNodes; i++) {
			highestEdgeCountBuildings.push(edgeMetricMapKeyIterator.next().value)
		}

		return highestEdgeCountBuildings
	}

	public getMetricValuesForNode(node: HierarchyNode<CodeMapNode>): Map<string, EdgeMetricCount> {
		const metricNames = this.getMetricNames().filter(it => !!nodeEdgeMetricsMap.get(it))
		const nodeEdgeMetrics = new Map()

		metricNames.forEach(metric => {
			nodeEdgeMetrics.set(metric, nodeEdgeMetricsMap.get(metric).get(node.data.path))
		})
		return nodeEdgeMetrics
	}

	public getMetricData(): EdgeMetricData[] {
		return this.storeService.getState().metricData.edgeMetricData
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
