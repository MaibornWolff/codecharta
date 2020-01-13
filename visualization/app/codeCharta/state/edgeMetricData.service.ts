import {
	MetricData,
	FileState,
	BlacklistItem,
	Edge,
	BlacklistType,
	CodeMapNode,
	EdgeMetricCount,
	FileSelectionState
} from "../codeCharta.model"
import { FileStateSubscriber, FileStateService } from "./fileState.service"
import { IRootScopeService } from "angular"
import { FileStateHelper } from "../util/fileStateHelper"
import { CodeMapHelper } from "../util/codeMapHelper"
import { HierarchyNode } from "d3"
import { BlacklistService, BlacklistSubscriber } from "./store/fileSettings/blacklist/blacklist.service"

export interface EdgeMetricDataServiceSubscriber {
	onEdgeMetricDataUpdated(metricData: MetricData[])
}

export class EdgeMetricDataService implements FileStateSubscriber, BlacklistSubscriber {
	private static EDGE_METRIC_DATA_UPDATED_EVENT = "edge-metric-data-updated"

	private edgeMetricData: MetricData[] = []
	private nodeEdgeMetricsMap: Map<string, Map<string, EdgeMetricCount>>

	constructor(private $rootScope: IRootScopeService, private fileStateService: FileStateService) {
		FileStateService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)
	}

	public onBlacklistChanged(blacklist: BlacklistItem[]) {
		const fileStates: FileState[] = this.fileStateService.getFileStates()
		this.updateEdgeMetrics(fileStates, blacklist)
	}

	public onFileStatesChanged(fileStates: FileState[]) {
		this.updateEdgeMetrics(fileStates, [])
	}

	private updateEdgeMetrics(fileStates: FileState[], blacklist: BlacklistItem[]) {
		this.edgeMetricData = this.calculateMetrics(FileStateHelper.getVisibleFileStates(fileStates), blacklist)
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

	private calculateMetrics(visibleFileStates: FileState[], blacklist: BlacklistItem[]): MetricData[] {
		if (visibleFileStates.length <= 0) {
			return []
		} else {
			const hashMap = this.calculateEdgeMetricData(visibleFileStates, blacklist)
			return this.getMetricDataFromMap(hashMap)
		}
	}

	private calculateEdgeMetricData(fileStates: FileState[], blacklist: BlacklistItem[]): Map<string, Map<string, EdgeMetricCount>> {
		this.nodeEdgeMetricsMap = new Map()
		const pathsPerFileState = fileStates
			.filter(x => x.selectedAs != FileSelectionState.None)
			.map(fileState => CodeMapHelper.getAllPaths(fileState.file.map))
		const allFilePaths: string[] = [].concat(...pathsPerFileState)
		fileStates.forEach(fileState => {
			fileState.file.settings.fileSettings.edges.forEach(edge => {
				if (this.bothNodesAssociatedAreVisible(edge, blacklist, allFilePaths)) {
					this.addEdgeToCalculationMap(edge)
				}
			})
		})
		return this.nodeEdgeMetricsMap
	}

	private bothNodesAssociatedAreVisible(edge: Edge, blacklist: BlacklistItem[], filePaths: string[]): boolean {
		const fromPath = filePaths.find(x => x === edge.fromNodeName)
		const toPath = filePaths.find(x => x === edge.toNodeName)
		return fromPath && toPath && this.isNotBlacklisted(fromPath, blacklist) && this.isNotBlacklisted(toPath, blacklist)
	}

	private isNotBlacklisted(path: string, blacklist: BlacklistItem[]): boolean {
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
			metricData.push({ name: edgeMetric, maxValue: maximumMetricValue, availableInVisibleMaps: true })
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
		this.edgeMetricData.push({ name: "None", maxValue: 0, availableInVisibleMaps: false })
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
