import { MetricData, BlacklistItem, Edge, BlacklistType, CodeMapNode, EdgeMetricCount, AttributeTypeValue } from "../codeCharta.model"
import { IRootScopeService } from "angular"
import { CodeMapHelper } from "../util/codeMapHelper"
import { HierarchyNode } from "d3"
import { BlacklistService, BlacklistSubscriber } from "./store/fileSettings/blacklist/blacklist.service"
import { FilesService, FilesSelectionSubscriber } from "./store/files/files.service"
import { Files } from "../model/files"
import { StoreService } from "./store.service"

export interface EdgeMetricDataServiceSubscriber {
	onEdgeMetricDataUpdated(metricData: MetricData[])
}

export class EdgeMetricDataService implements FilesSelectionSubscriber, BlacklistSubscriber {
	private static EDGE_METRIC_DATA_UPDATED_EVENT = "edge-metric-data-updated"

	private edgeMetricData: MetricData[] = []
	private nodeEdgeMetricsMap: Map<string, Map<string, EdgeMetricCount>>

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		FilesService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)
	}

	public onBlacklistChanged(blacklist: BlacklistItem[]) {
		this.updateEdgeMetrics()
	}

	public onFilesSelectionChanged(files: Files) {
		this.updateEdgeMetrics()
	}

	private updateEdgeMetrics() {
		this.edgeMetricData = this.calculateMetrics()
		this.addNoneMetric()
		this.sortNodeEdgeMetricsMap()
		this.notifyEdgeMetricDataUpdated()
	}

	public getMetricNames(): string[] {
		if (!this.edgeMetricData) {
			return []
		}

		return this.edgeMetricData.map(x => x.name)
	}

	public getAmountOfAffectedBuildings(metricName: string): number {
		if (!this.nodeEdgeMetricsMap || !this.nodeEdgeMetricsMap.has(metricName)) {
			return 0
		}
		return this.nodeEdgeMetricsMap.get(metricName).size
	}

	public getNodesWithHighestValue(metricName: string, numberOfNodes: number): string[] {
		if (!this.nodeEdgeMetricsMap || !this.nodeEdgeMetricsMap.has(metricName)) {
			return []
		}

		let highestEdgeCountBuildings: string[] = []
		const edgeMetricMapKeyIterator = this.nodeEdgeMetricsMap.get(metricName).keys()
		for (let i = 0; i < numberOfNodes; i++) {
			highestEdgeCountBuildings.push(edgeMetricMapKeyIterator.next().value)
		}

		return highestEdgeCountBuildings
	}

	public getMetricValuesForNode(node: HierarchyNode<CodeMapNode>): Map<string, EdgeMetricCount> {
		const metricNames = this.getMetricNames().filter(it => !!this.nodeEdgeMetricsMap.get(it))
		let nodeEdgeMetrics = new Map()

		metricNames.forEach(metric => {
			nodeEdgeMetrics.set(metric, this.nodeEdgeMetricsMap.get(metric).get(node.data.path))
		})
		return nodeEdgeMetrics
	}

	public getMetricData(): MetricData[] {
		return this.edgeMetricData
	}

	public getAttributeTypeByMetric(metricName: string): AttributeTypeValue {
		return this.storeService.getState().fileSettings.attributeTypes.edges[metricName]
	}

	private calculateMetrics(): MetricData[] {
		if (!this.storeService.getState().files.fileStatesAvailable()) {
			return []
		} else {
			const hashMap = this.calculateEdgeMetricData()
			return this.getMetricDataFromMap(hashMap)
		}
	}

	private calculateEdgeMetricData(): Map<string, Map<string, EdgeMetricCount>> {
		this.nodeEdgeMetricsMap = new Map()
		const pathsPerFileState = this.storeService
			.getState()
			.files.getVisibleFileStates()
			.map(fileState => CodeMapHelper.getAllPaths(fileState.file.map))
		const allFilePaths: string[] = [].concat(...pathsPerFileState)
		this.storeService
			.getState()
			.files.getVisibleFileStates()
			.forEach(fileState => {
				fileState.file.settings.fileSettings.edges.forEach(edge => {
					if (this.bothNodesAssociatedAreVisible(edge, allFilePaths)) {
						this.addEdgeToCalculationMap(edge)
					}
				})
			})
		return this.nodeEdgeMetricsMap
	}

	private bothNodesAssociatedAreVisible(edge: Edge, filePaths: string[]): boolean {
		const fromPath = filePaths.find(x => x === edge.fromNodeName)
		const toPath = filePaths.find(x => x === edge.toNodeName)
		return fromPath && toPath && this.isNotBlacklisted(fromPath) && this.isNotBlacklisted(toPath)
	}

	private isNotBlacklisted(path: string): boolean {
		const blacklist = this.storeService.getState().fileSettings.blacklist
		return !CodeMapHelper.isPathBlacklisted(path, blacklist, BlacklistType.exclude)
	}

	private addEdgeToCalculationMap(edge: Edge) {
		for (let edgeMetric of Object.keys(edge.attributes)) {
			const edgeMetricEntry = this.getEntryForMetric(edgeMetric)
			this.addEdgeToNodes(edgeMetricEntry, edge.fromNodeName, edge.toNodeName)
		}
	}

	private getEntryForMetric(edgeMetricName: string): Map<string, EdgeMetricCount> {
		if (!this.nodeEdgeMetricsMap.has(edgeMetricName)) {
			this.nodeEdgeMetricsMap.set(edgeMetricName, new Map())
		}
		return this.nodeEdgeMetricsMap.get(edgeMetricName)
	}

	private addEdgeToNodes(edgeMetricEntry: Map<string, EdgeMetricCount>, fromNode: string, toNode: string) {
		this.createEntryIfNecessary(edgeMetricEntry, fromNode)
		this.createEntryIfNecessary(edgeMetricEntry, toNode)
		edgeMetricEntry.get(fromNode).outgoing += 1
		edgeMetricEntry.get(toNode).incoming += 1
	}

	private createEntryIfNecessary(edgeMetricEntry: Map<string, EdgeMetricCount>, nodeName: string) {
		if (!edgeMetricEntry.has(nodeName)) {
			edgeMetricEntry.set(nodeName, { incoming: 0, outgoing: 0 })
		}
	}

	private getMetricDataFromMap(hashMap: Map<string, Map<string, EdgeMetricCount>>): MetricData[] {
		let metricData: MetricData[] = []

		hashMap.forEach((occurences: any, edgeMetric: any) => {
			let maximumMetricValue = 0
			occurences.forEach((value: EdgeMetricCount, _) => {
				const combinedValue = value.incoming + value.outgoing
				if (combinedValue > maximumMetricValue) {
					maximumMetricValue = combinedValue
				}
			})
			metricData.push({ name: edgeMetric, maxValue: maximumMetricValue })
		})

		return metricData
	}

	private sortNodeEdgeMetricsMap() {
		let sortedEdgeMetricMap = new Map()
		if (this.nodeEdgeMetricsMap) {
			this.nodeEdgeMetricsMap.forEach((value, key) => {
				const sortedMapForMetric = new Map(
					[...value.entries()].sort((a, b) => b[1].incoming + b[1].outgoing - (a[1].incoming + a[1].outgoing))
				)
				sortedEdgeMetricMap.set(key, sortedMapForMetric)
			})
		}
		this.nodeEdgeMetricsMap = sortedEdgeMetricMap
	}

	private addNoneMetric() {
		this.edgeMetricData.push({ name: "None", maxValue: 0 })
	}

	private notifyEdgeMetricDataUpdated() {
		this.$rootScope.$broadcast(EdgeMetricDataService.EDGE_METRIC_DATA_UPDATED_EVENT, this.edgeMetricData)
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: EdgeMetricDataServiceSubscriber) {
		$rootScope.$on(EdgeMetricDataService.EDGE_METRIC_DATA_UPDATED_EVENT, (event, data) => {
			subscriber.onEdgeMetricDataUpdated(data)
		})
	}
}
