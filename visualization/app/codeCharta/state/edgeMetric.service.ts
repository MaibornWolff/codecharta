import {
	MetricData,
	RecursivePartial,
	FileState,
	BlacklistItem,
	Edge,
	BlacklistType,
	CodeMapNode,
	EdgeMetricCount
} from "../codeCharta.model"
import { FileStateServiceSubscriber, FileStateService } from "./fileState.service"
import { IRootScopeService } from "angular"
import { FileStateHelper } from "../util/fileStateHelper"
import { CodeMapHelper } from "../util/codeMapHelper"
import { BlacklistSubscriber } from "./settingsService/settings.service.events"
import { SettingsService } from "./settingsService/settings.service"
import { HierarchyNode } from "d3"

export interface EdgeMetricServiceSubscriber {
	onEdgeMetricDataUpdated(metricData: MetricData[])
}

export class EdgeMetricService implements FileStateServiceSubscriber, BlacklistSubscriber {
	private static EDGE_METRIC_DATA_UPDATED_EVENT = "edge-metric-data-updated"

	private edgeMetricData: MetricData[] = []
	private nodeEdgeMetricsMap: Map<string, Map<string, EdgeMetricCount>>

	constructor(private $rootScope: IRootScopeService, private fileStateService: FileStateService) {
		FileStateService.subscribe(this.$rootScope, this)
		SettingsService.subscribeToBlacklist(this.$rootScope, this)
	}

	public onBlacklistChanged(blacklist: BlacklistItem[]) {
		const fileStates: FileState[] = this.fileStateService.getFileStates()
		this.edgeMetricData = this.calculateMetrics(FileStateHelper.getVisibleFileStates(fileStates), blacklist)
		this.sortNodeEdgeMetricsMap()
		this.notifyEdgeMetricDataUpdated()
	}

	public onFileSelectionStatesChanged(fileStates: FileState[]) {
		this.edgeMetricData = this.calculateMetrics(FileStateHelper.getVisibleFileStates(fileStates), [])
		this.sortNodeEdgeMetricsMap()
		this.notifyEdgeMetricDataUpdated()
	}

	// TODO: Probably not needed?
	public onImportedFilesChanged(fileStates: FileState[]) {
		this.edgeMetricData = []
		this.notifyEdgeMetricDataUpdated()
	}

	public getMetricNames(): string[] {
		return this.edgeMetricData.map(x => x.name)
	}

	public getAmountOfAffectedBuildings(metricName: string): number {
		if (!this.nodeEdgeMetricsMap.has(metricName)) {
			return 0
		}
		return this.nodeEdgeMetricsMap.get(metricName).size
	}

	public getNodesWithHighestValue(metricName: string, numberOfNodes: number): string[] {
		if (!this.nodeEdgeMetricsMap.has(metricName)) {
			return []
		}

		let highestEdgeCountBuildings: string[] = []
		const edgeMetricMapKeyIterator = this.nodeEdgeMetricsMap.get(metricName).keys()
		for (let i = 0; i < numberOfNodes; i++) {
			highestEdgeCountBuildings.push(edgeMetricMapKeyIterator.next().value)
		}

		return highestEdgeCountBuildings
	}

	public getMetricValuesForNode(node: HierarchyNode<CodeMapNode>) {
		const metricNames = this.getMetricNames().filter(it => !!this.nodeEdgeMetricsMap.get(it))
		let nodeEdgeMetrics = new Map()

		metricNames.forEach(metric => {
			nodeEdgeMetrics.set(metric, this.nodeEdgeMetricsMap.get(metric).get(node.data.path))
		})
		return nodeEdgeMetrics
	}

	public getMetricData() {
		return this.edgeMetricData
	}

	private calculateMetrics(visibleFileStates: FileState[], blacklist: RecursivePartial<BlacklistItem>[]) {
		if (visibleFileStates.length <= 0) {
			return []
		} else {
			const hashMap = this.calculateEdgeMetricData(visibleFileStates, blacklist)
			return this.getMetricDataFromMap(hashMap)
		}
	}

	private calculateEdgeMetricData(
		fileStates: FileState[],
		blacklist: RecursivePartial<BlacklistItem>[]
	): Map<string, Map<string, EdgeMetricCount>> {
		this.nodeEdgeMetricsMap = new Map()
		fileStates.forEach(fileState => {
			fileState.file.settings.fileSettings.edges.forEach(edge => {
				if (this.bothNodesAssociatedAreVisible(edge, blacklist, fileStates)) {
					this.addEdgeToCalculationMap(edge)
				}
			})
		})
		return this.nodeEdgeMetricsMap
	}

	private addEdgeToCalculationMap(edge: Edge) {
		for (let edgeMetric of Object.keys(edge.attributes)) {
			const edgeMetricEntry = this.getEntryForMetric(edgeMetric)
			this.addEdgeToNodes(edgeMetricEntry, edge.fromNodeName, edge.toNodeName)
		}
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

	private getEntryForMetric(edgeMetricName: string): Map<string, EdgeMetricCount> {
		if (!this.nodeEdgeMetricsMap.has(edgeMetricName)) {
			this.nodeEdgeMetricsMap.set(edgeMetricName, new Map())
		}
		return this.nodeEdgeMetricsMap.get(edgeMetricName)
	}

	private bothNodesAssociatedAreVisible(edge: Edge, blacklist, fileStates: FileState[]): boolean {
		const fromNode = this.getMapNodeFromPath(edge.fromNodeName, fileStates)
		const toNode = this.getMapNodeFromPath(edge.toNodeName, fileStates)
		return fromNode && toNode && this.isNotBlacklisted(fromNode, blacklist) && this.isNotBlacklisted(toNode, blacklist)
	}

	private getMapNodeFromPath(path: string, fileStates: FileState[]) {
		let mapNode = undefined
		fileStates.forEach(fileState => {
			const nodeFound = CodeMapHelper.getCodeMapNodeFromPath(path, "File", fileState.file.map)
			if (nodeFound) {
				mapNode = nodeFound
			}
		})
		return mapNode
	}

	private isNotBlacklisted(node: CodeMapNode, blacklist: BlacklistItem[]): boolean {
		return !CodeMapHelper.isBlacklisted(node, blacklist as BlacklistItem[], BlacklistType.exclude)
	}

	private getMetricDataFromMap(hashMap: Map<string, Map<string, EdgeMetricCount>>) {
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
		this.nodeEdgeMetricsMap.forEach((value, key) => {
			const sortedMapForMetric = new Map(
				[...value.entries()].sort((a, b) => b[1].incoming + b[1].outgoing - (a[1].incoming + a[1].outgoing))
			)
			sortedEdgeMetricMap.set(key, sortedMapForMetric)
		})
		this.nodeEdgeMetricsMap = sortedEdgeMetricMap
	}

	private notifyEdgeMetricDataUpdated() {
		this.$rootScope.$broadcast(EdgeMetricService.EDGE_METRIC_DATA_UPDATED_EVENT, this.edgeMetricData)
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: EdgeMetricServiceSubscriber) {
		$rootScope.$on(EdgeMetricService.EDGE_METRIC_DATA_UPDATED_EVENT, (event, data) => {
			subscriber.onEdgeMetricDataUpdated(data)
		})
	}
}
