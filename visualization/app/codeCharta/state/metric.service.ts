import { BlacklistItem, BlacklistType, CodeMapNode, FileState, MetricData, AttributeTypeValue, State } from "../codeCharta.model"
import { hierarchy, HierarchyNode } from "d3"
import { IRootScopeService } from "angular"
import { CodeMapHelper } from "../util/codeMapHelper"
import _ from "lodash"
import { BlacklistService, BlacklistSubscriber } from "./store/fileSettings/blacklist/blacklist.service"
import { StoreService } from "./store.service"
import { FilesService, FilesSelectionSubscriber } from "./store/files/files.service"
import { Files } from "../model/files"

export interface MetricServiceSubscriber {
	onMetricDataAdded(metricData: MetricData[])
}

interface MaxMetricValuePair {
	maxValue: number
}

export class MetricService implements FilesSelectionSubscriber, BlacklistSubscriber {
	private static METRIC_DATA_ADDED_EVENT = "metric-data-added"

	//TODO MetricData should contain attributeType
	private metricData: MetricData[] = []

	constructor(private $rootScope: IRootScopeService, private storeService: StoreService) {
		FilesService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)
	}

	public onFilesSelectionChanged(files: Files) {
		this.setNewMetricData()
	}

	public onBlacklistChanged(blacklist: BlacklistItem[]) {
		this.setNewMetricData()
	}

	public getMetrics(): string[] {
		return this.metricData.map(x => x.name)
	}

	public getMetricData(): MetricData[] {
		return this.metricData
	}

	public isMetricAvailable(metricName: string) {
		return this.metricData.find(x => x.name == metricName)
	}

	public getMaxMetricByMetricName(metricName: string): number {
		const metric: MetricData = this.metricData.find(x => x.name == metricName)
		return metric ? metric.maxValue : undefined
	}

	public getAttributeTypeByMetric(metricName: string, state: State): AttributeTypeValue {
		const attributeType = state.fileSettings.attributeTypes.nodes[metricName]
		return !!attributeType ? attributeType : null
	}

	private setNewMetricData() {
		this.metricData = this.calculateMetrics()
		this.addUnaryMetric()
		this.notifyMetricDataAdded()
	}

	private calculateMetrics(): MetricData[] {
		if (!this.storeService.getState().files.fileStatesAvailable()) {
			return []
		} else {
			//TODO: keep track of these metrics in service
			const hashMap = this.buildHashMapFromMetrics()
			return this.getMetricDataFromHashMap(hashMap)
		}
	}

	private buildHashMapFromMetrics() {
		const hashMap: Map<string, MaxMetricValuePair> = new Map()

		this.storeService
			.getState()
			.files.getVisibleFileStates()
			.forEach((fileState: FileState) => {
				const nodes: HierarchyNode<CodeMapNode>[] = hierarchy(fileState.file.map).leaves()
				nodes.forEach((node: HierarchyNode<CodeMapNode>) => {
					if (
						node.data.path &&
						!CodeMapHelper.isBlacklisted(node.data, this.storeService.getState().fileSettings.blacklist, BlacklistType.exclude)
					) {
						this.addMaxMetricValuesToHashMap(node, hashMap)
					}
				})
			})
		return hashMap
	}

	private addMaxMetricValuesToHashMap(node: HierarchyNode<CodeMapNode>, hashMap: Map<string, MaxMetricValuePair>) {
		const attributes: string[] = Object.keys(node.data.attributes)

		attributes.forEach((metric: string) => {
			if (!hashMap.has(metric) || hashMap.get(metric).maxValue <= node.data.attributes[metric]) {
				hashMap.set(metric, {
					maxValue: node.data.attributes[metric]
				})
			}
		})
	}

	private getMetricDataFromHashMap(hashMap: Map<string, MaxMetricValuePair>): MetricData[] {
		const metricData = []

		hashMap.forEach((value: MaxMetricValuePair, key: string) => {
			metricData.push({
				name: key,
				maxValue: value.maxValue
			})
		})
		return this.sortByAttributeName(metricData)
	}

	private sortByAttributeName(metricData: MetricData[]): MetricData[] {
		return metricData.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0))
	}

	private addUnaryMetric() {
		if (!this.metricData.find(x => x.name === "unary")) {
			this.metricData.push({
				name: "unary",
				maxValue: 1
			})
		}
	}

	private notifyMetricDataAdded() {
		this.$rootScope.$broadcast(MetricService.METRIC_DATA_ADDED_EVENT, this.metricData)
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: MetricServiceSubscriber) {
		$rootScope.$on(MetricService.METRIC_DATA_ADDED_EVENT, (event, data) => {
			subscriber.onMetricDataAdded(data)
		})
	}
}
