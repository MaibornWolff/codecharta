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
	private edgeMetricHashMap: Map<string, Map<string, number>>

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
			this.notifyEdgeMetricDataUpdated()
		}
	}

	public onFileSelectionStatesChanged(fileStates: FileState[]) {
		this.edgeMetricData = this.calculateMetrics(fileStates, FileStateHelper.getVisibleFileStates(fileStates), [])
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

	private calculateMetrics(fileStates: FileState[], visibleFileStates: FileState[], blacklist: RecursivePartial<BlacklistItem>[]) {
		if (fileStates.length <= 0) {
			return []
		} else {
			const hashMap = this.calculateEdgeMetricData(fileStates, blacklist)
			return this.getMetricDataFromHashMap(hashMap)
		}
	}

	private calculateEdgeMetricData(
		fileStates: FileState[],
		blacklist: RecursivePartial<BlacklistItem>[]
	): Map<string, Map<string, number>> {
		this.edgeMetricHashMap = new Map()
		fileStates.forEach(fileState => {
			fileState.file.settings.fileSettings.edges.forEach(edge => {
				// TODO: Check if this actually works
				if (
					!CodeMapHelper.isPathBlacklisted(edge.fromNodeName, blacklist as BlacklistItem[], BlacklistType.exclude) &&
					!CodeMapHelper.isPathBlacklisted(edge.toNodeName, blacklist as BlacklistItem[], BlacklistType.exclude)
				) {
					this.addEdgeToCalculationMap(edge)
				}
			})
		})
		return this.edgeMetricHashMap
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
		if (!this.edgeMetricHashMap.has(edgeMetricName)) {
			this.edgeMetricHashMap.set(edgeMetricName, new Map())
		}
		return this.edgeMetricHashMap.get(edgeMetricName)
	}

	private getMetricDataFromHashMap(hashMap: Map<string, Map<string, number>>) {
		let metricData: MetricData[] = []

		hashMap.forEach((occurences: any, edgeMetric: any) => {
			let maximumMetricValue = 0
			occurences.forEach((value, _) => {
				if (value > maximumMetricValue) {
					maximumMetricValue = value
				}
			})
			metricData.push({ name: edgeMetric, maxValue: maximumMetricValue, availableInVisibleMaps: true })
		})

		return metricData
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
