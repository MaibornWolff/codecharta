import { MetricData, Settings, RecursivePartial, FileState, BlacklistItem, Edge, BlacklistType } from "../codeCharta.model"
import { FileStateServiceSubscriber, FileStateService } from "./fileState.service"
import { SettingsServiceSubscriber, SettingsService } from "./settings.service"
import { IRootScopeService } from "angular"
import { FileStateHelper } from "../util/fileStateHelper"
import { CodeMapHelper } from "../util/codeMapHelper"

export interface EdgeMetricServiceSubscriber {
	onEdgeMetricDataUpdated(metricData: MetricData[])
}

export class EdgeMetricService implements FileStateServiceSubscriber, SettingsServiceSubscriber {
	private static EDGE_METRIC_DATA_UPDATED_EVENT = "edge-metric-data-updated"

	private edgeMetricData: MetricData[] = []
	private nodeEdgeMetricsMap: Map<string, Map<string, number>>

	constructor(private $rootScope: IRootScopeService, private fileStateService: FileStateService) {
		FileStateService.subscribe(this.$rootScope, this)
		SettingsService.subscribe(this.$rootScope, this)
	}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>) {
		if (update.fileSettings && update.fileSettings.blacklist) {
			const fileStates: FileState[] = this.fileStateService.getFileStates()
			this.edgeMetricData = this.calculateMetrics(
				fileStates,
				FileStateHelper.getVisibleFileStates(fileStates),
				update.fileSettings.blacklist
			)
			this.sortNodeEdgeMetricsMap()
			this.notifyEdgeMetricDataUpdated()
		}
	}

	public onFileSelectionStatesChanged(fileStates: FileState[]) {
		this.edgeMetricData = this.calculateMetrics(fileStates, FileStateHelper.getVisibleFileStates(fileStates), [])
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

	private calculateMetrics(fileStates: FileState[], visibleFileStates: FileState[], blacklist: RecursivePartial<BlacklistItem>[]) {
		if (fileStates.length <= 0) {
			return []
		} else {
			const hashMap = this.calculateEdgeMetricData(fileStates, blacklist)
			return this.getMetricDataFromMap(hashMap)
		}
	}

	private calculateEdgeMetricData(
		fileStates: FileState[],
		blacklist: RecursivePartial<BlacklistItem>[]
	): Map<string, Map<string, number>> {
		this.nodeEdgeMetricsMap = new Map()
		fileStates.forEach(fileState => {
			fileState.file.settings.fileSettings.edges.forEach(edge => {
				// TODO: Check if this actually works
				if (
					!CodeMapHelper.isPathBlacklisted(edge.fromNodeName, blacklist as BlacklistItem[], BlacklistType.exclude) &&
					!CodeMapHelper.isPathBlacklisted(edge.toNodeName, blacklist as BlacklistItem[], BlacklistType.exclude) &&
					this.nodeExistsInFileStates(edge, fileStates)
				) {
					this.addEdgeToCalculationMap(edge)
				}
			})
		})
		return this.nodeEdgeMetricsMap
	}

	private addEdgeToCalculationMap(edge: Edge) {
		for (let edgeMetric of Object.keys(edge.attributes)) {
			let edgeMetricEntry = this.getEntryForMetric(edgeMetric)

			this.addEdgeToNode(edgeMetricEntry, edge.fromNodeName)
			this.addEdgeToNode(edgeMetricEntry, edge.toNodeName)
		}
	}

	private addEdgeToNode(edgeMetricEntry: Map<string, number>, nodeName: string) {
		if (!edgeMetricEntry.has(nodeName)) {
			edgeMetricEntry.set(nodeName, 1)
		} else {
			edgeMetricEntry.set(nodeName, edgeMetricEntry.get(nodeName) + 1)
		}
	}

	private getEntryForMetric(edgeMetricName: string): Map<string, number> {
		if (!this.nodeEdgeMetricsMap.has(edgeMetricName)) {
			this.nodeEdgeMetricsMap.set(edgeMetricName, new Map())
		}
		return this.nodeEdgeMetricsMap.get(edgeMetricName)
	}

	// Should both nodes be visible or is one sufficient?
	private nodeExistsInFileStates(edge: Edge, fileStates: FileState[]): boolean {
		let exists: boolean = false
		fileStates.forEach(fileState => {
			if (
				CodeMapHelper.getCodeMapNodeFromPath(edge.fromNodeName, "File", fileState.file.map) ||
				CodeMapHelper.getCodeMapNodeFromPath(edge.toNodeName, "File", fileState.file.map)
			) {
				exists = true
			}
		})
		return exists
	}

	private getMetricDataFromMap(hashMap: Map<string, Map<string, number>>) {
		let metricData: MetricData[] = []

		hashMap.forEach((occurences: any, edgeMetric: any) => {
			let maximumMetricValue = 0
			occurences.forEach((value: number, _) => {
				if (value > maximumMetricValue) {
					maximumMetricValue = value
				}
			})
			metricData.push({ name: edgeMetric, maxValue: maximumMetricValue, availableInVisibleMaps: true })
		})

		return metricData
	}

	private sortNodeEdgeMetricsMap() {
		let sortedEdgeMetricMap = new Map()
		this.nodeEdgeMetricsMap.forEach((value, key) => {
			const sortedMapForMetric = new Map([...value.entries()].sort((a, b) => b[1] - a[1]))
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
