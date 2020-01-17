import {
	AttributeTypes,
	BlacklistItem,
	BlacklistType,
	CodeMapNode,
	FileState,
	MetricData,
	AttributeType,
	AttributeTypeValue,
	State
} from "../codeCharta.model"
import { hierarchy, HierarchyNode } from "d3"
import { FileStateService, FileStateSubscriber } from "./fileState.service"
import { FileStateHelper } from "../util/fileStateHelper"
import { IRootScopeService } from "angular"
import { CodeMapHelper } from "../util/codeMapHelper"
import _ from "lodash"
import { BlacklistService, BlacklistSubscriber } from "./store/fileSettings/blacklist/blacklist.service"
import { StoreService } from "./store.service"

export interface MetricServiceSubscriber {
	onMetricDataAdded(metricData: MetricData[])
}

interface MaxMetricValuePair {
	maxValue: number
	availableInVisibleMaps: boolean
}

export class MetricService implements FileStateSubscriber, BlacklistSubscriber {
	private static METRIC_DATA_ADDED_EVENT = "metric-data-added"

	//TODO MetricData should contain attributeType
	private metricData: MetricData[] = []

	constructor(private $rootScope: IRootScopeService, private fileStateService: FileStateService, private storeService: StoreService) {
		FileStateService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)
	}

	public onFileStatesChanged(fileStates: FileState[]) {
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
		return this.metricData.find(x => x.name == metricName && x.availableInVisibleMaps)
	}

	public getMaxMetricByMetricName(metricName: string): number {
		const metric: MetricData = this.metricData.find(x => x.name == metricName)
		return metric ? metric.maxValue : undefined
	}

	public getAttributeTypeByMetric(metricName: string, state: State): AttributeTypeValue {
		const attributeType = this.getMergedAttributeTypes(state.fileSettings.attributeTypes).find(x => {
			return _.findKey(x) === metricName
		})

		if (attributeType) {
			return attributeType[metricName]
		}
		return null
	}

	private setNewMetricData() {
		const fileStates: FileState[] = this.fileStateService.getFileStates()
		this.metricData = this.calculateMetrics(fileStates, FileStateHelper.getVisibleFileStates(fileStates))
		this.addUnaryMetric()
		this.notifyMetricDataAdded()
	}

	private getMergedAttributeTypes(attributeTypes: AttributeTypes): AttributeType[] {
		const mergedAttributeTypes = [...attributeTypes.nodes]

		mergedAttributeTypes.forEach(nodeAttribute => {
			attributeTypes.edges.forEach(edgeAttribute => {
				if (_.findKey(nodeAttribute) !== _.findKey(edgeAttribute)) {
					mergedAttributeTypes.push(edgeAttribute)
				}
			})
		})

		return mergedAttributeTypes
	}

	private calculateMetrics(fileStates: FileState[], visibleFileStates: FileState[]): MetricData[] {
		if (fileStates.length <= 0) {
			return []
		} else {
			//TODO: keep track of these metrics in service
			const metricsFromVisibleMaps = this.getUniqueMetricNames(visibleFileStates)
			const hashMap = this.buildHashMapFromMetrics(fileStates, metricsFromVisibleMaps)
			return this.getMetricDataFromHashMap(hashMap)
		}
	}

	private buildHashMapFromMetrics(fileStates: FileState[], metricsFromVisibleMaps) {
		const hashMap: Map<string, MaxMetricValuePair> = new Map()

		fileStates.forEach((fileState: FileState) => {
			let nodes: HierarchyNode<CodeMapNode>[] = hierarchy(fileState.file.map).leaves()
			nodes.forEach((node: HierarchyNode<CodeMapNode>) => {
				if (
					node.data.path &&
					!CodeMapHelper.isBlacklisted(node.data, this.storeService.getState().fileSettings.blacklist, BlacklistType.exclude)
				) {
					this.addMaxMetricValuesToHashMap(node, hashMap, metricsFromVisibleMaps)
				}
			})
		})
		return hashMap
	}

	private addMaxMetricValuesToHashMap(
		node: HierarchyNode<CodeMapNode>,
		hashMap: Map<string, MaxMetricValuePair>,
		metricsFromVisibleMaps
	) {
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

	private getMetricDataFromHashMap(hashMap: Map<string, MaxMetricValuePair>): MetricData[] {
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

	private isAvailableInVisibleMaps(metricsFromVisibleMaps: string[], metric: string): boolean {
		return !!metricsFromVisibleMaps.find(metricName => metricName === metric)
	}

	private getUniqueMetricNames(fileStates: FileState[]): string[] {
		if (fileStates.length === 0) {
			return []
		} else {
			let leaves: HierarchyNode<CodeMapNode>[] = []
			fileStates.forEach((fileState: FileState) => {
				leaves = leaves.concat(hierarchy<CodeMapNode>(fileState.file.map).leaves())
			})
			let attributeList: string[][] = leaves.map((d: HierarchyNode<CodeMapNode>) => {
				return d.data.attributes ? Object.keys(d.data.attributes) : []
			})
			let attributes: string[] = attributeList.reduce((left: string[], right: string[]) => {
				return left.concat(right.filter(el => left.indexOf(el) === -1))
			})
			return attributes.sort()
		}
	}

	private sortByAttributeName(metricData: MetricData[]): MetricData[] {
		return metricData.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0))
	}

	private addUnaryMetric() {
		if (!this.metricData.find(x => x.name === "unary")) {
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

	public static subscribe($rootScope: IRootScopeService, subscriber: MetricServiceSubscriber) {
		$rootScope.$on(MetricService.METRIC_DATA_ADDED_EVENT, (event, data) => {
			subscriber.onMetricDataAdded(data)
		})
	}
}
