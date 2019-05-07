import {
	BlacklistItem,
	BlacklistType,
	CodeMapNode,
	FileState,
	MetricData,
	RecursivePartial,
	Settings
} from "../codeCharta.model"
import {hierarchy, HierarchyNode} from "d3"
import {FileStateService, FileStateServiceSubscriber} from "./fileState.service"
import {FileStateHelper} from "../util/fileStateHelper"
import {IAngularEvent, IRootScopeService} from "angular"
import {SettingsService, SettingsServiceSubscriber} from "./settings.service"
import {CodeMapHelper} from "../util/codeMapHelper"


export interface MetricServiceSubscriber {
	onMetricDataAdded(metricData: MetricData[], event: IAngularEvent)
	onMetricDataRemoved(event: IAngularEvent)
}

interface MaxMetricValuePair {
	maxValue: number
	availableInVisibleMaps: boolean
}

export class MetricService implements FileStateServiceSubscriber, SettingsServiceSubscriber {

	private static METRIC_DATA_ADDED_EVENT = "metric-data-added";
	private static METRIC_DATA_REMOVED_EVENT = "metric-data-removed";


	private metricData: MetricData[] = []

	constructor(
		private $rootScope: IRootScopeService,
		private fileStateService: FileStateService
	) {
		FileStateService.subscribe(this.$rootScope, this)
		SettingsService.subscribe(this.$rootScope, this)
	}

	public onFileSelectionStatesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
		this.metricData = this.calculateMetrics(fileStates, FileStateHelper.getVisibleFileStates(fileStates), [])
		this.addUnaryMetric()
		this.notifyMetricDataAdded()
	}

	public onImportedFilesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
		this.metricData = null
		this.notifyMetricDataRemoved()
	}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>, event: angular.IAngularEvent) {
		if(update.fileSettings && update.fileSettings.blacklist) {
			const fileStates: FileState[] = this.fileStateService.getFileStates()
			this.metricData = this.calculateMetrics(fileStates, FileStateHelper.getVisibleFileStates(fileStates), update.fileSettings.blacklist)
			this.notifyMetricDataAdded()
		}
	}

	public getMetrics(): string[] {
		return this.metricData.map(x => x.name)
	}

	public getMetricData(): MetricData[] {
		return this.metricData
	}

	public getMaxMetricByMetricName(metricName: string): number {
		const metric: MetricData = this.metricData.find(x => x.name == metricName)
		return metric ? metric.maxValue : undefined
	}

	private calculateMetrics(fileStates: FileState[], visibleFileStates: FileState[], blacklist: BlacklistItem[]): MetricData[] {
		if (fileStates.length <= 0) {
			return []
		} else {
			//TODO: keep track of these metrics in service
			const metricsFromVisibleMaps = this.getUniqueMetricNames(visibleFileStates)
			const hashMap = this.buildHashMapFromMetrics(fileStates, blacklist, metricsFromVisibleMaps)
			return this.getMetricDataFromHashMap(hashMap)
		}
	}

	private buildHashMapFromMetrics(fileStates: FileState[], blacklist: BlacklistItem[], metricsFromVisibleMaps) {
		const hashMap: Map<string, MaxMetricValuePair> = new Map()

		fileStates.forEach((fileState: FileState) => {
			let nodes: HierarchyNode<CodeMapNode>[] = hierarchy(fileState.file.map).leaves()
			nodes.forEach((node: HierarchyNode<CodeMapNode>) => {
				if (node.data.path && !CodeMapHelper.isBlacklisted(node.data, blacklist, BlacklistType.exclude)) {
					this.addMaxMetricValuesToHashMap(node, hashMap, metricsFromVisibleMaps)
				}
			})
		})
		return hashMap
	}

	private addMaxMetricValuesToHashMap(node: HierarchyNode<CodeMapNode>, hashMap: Map<string, MaxMetricValuePair>, metricsFromVisibleMaps) {
		const attributes: string[] = Object.keys(node.data.attributes)

		attributes.forEach((metric: string) => {
			if (!hashMap.has(metric) || hashMap.get(metric).maxValue <= node.data.attributes[metric]) {
				hashMap.set(metric, {
					maxValue: node.data.attributes[metric],
					availableInVisibleMaps: this.isAvailableInVisibleMaps(metricsFromVisibleMaps, metric)
				})
			}
		})
	}

	private getMetricDataFromHashMap(hashMap: Map<string, MaxMetricValuePair>) : MetricData[] {
		const metricData = []

		hashMap.forEach((value: MaxMetricValuePair, key: string) => {
			metricData.push({
				name: key,
				maxValue: value.maxValue,
				availableInVisibleMaps: value.availableInVisibleMaps
			})
		})
		return this.sortByAttributeName(metricData)
	}

	private isAvailableInVisibleMaps(metricsFromVisibleMaps : string[], metric: string): boolean {
		return !!metricsFromVisibleMaps.find(metricName => metricName === metric)
	}

	private getUniqueMetricNames(fileStates: FileState[]): string[] {
		if (fileStates.length === 0) {
			return []
		} else {
			let leaves: HierarchyNode<CodeMapNode>[] = [];
			fileStates.forEach((fileState: FileState) => {
				leaves = leaves.concat(hierarchy<CodeMapNode>(fileState.file.map).leaves());
			});
			let attributeList: string[][] = leaves.map((d: HierarchyNode<CodeMapNode>) => {
				return d.data.attributes ? Object.keys(d.data.attributes) : [];
			});
			let attributes: string[] = attributeList.reduce((left: string[], right: string[]) => {
				return left.concat(right.filter(el => left.indexOf(el) === -1));
			});
			return attributes.sort();
		}
	}

	private sortByAttributeName(metricData: MetricData[]): MetricData[] {
		return metricData.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
	}

	private addUnaryMetric() {
		if(!this.metricData.find(x => x.name === "unary")) {
			this.metricData.push({
				name: "unary",
				maxValue: 1,
				availableInVisibleMaps: true
			})
		}
	}

	private notifyMetricDataAdded() {
		this.$rootScope.$broadcast(MetricService.METRIC_DATA_ADDED_EVENT, this.metricData)
	}

	private notifyMetricDataRemoved() {
		this.$rootScope.$broadcast(MetricService.METRIC_DATA_REMOVED_EVENT, this.metricData)
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: MetricServiceSubscriber) {
		$rootScope.$on(MetricService.METRIC_DATA_ADDED_EVENT, (event, data) => {
			subscriber.onMetricDataAdded(data, event)
		})

		$rootScope.$on(MetricService.METRIC_DATA_REMOVED_EVENT, (event, data) => {
			subscriber.onMetricDataRemoved(event)
		})
	}
}
