import {CCFile, CodeMapNode, FileState, MetricData} from "../codeCharta.model";
import {hierarchy, HierarchyNode} from "d3";
import {FileStateService, FileStateServiceSubscriber} from "./fileState.service";
import {FileStateHelper} from "../util/fileStateHelper";
import {IAngularEvent, IRootScopeService} from "angular";


export interface MetricStateServiceSubscriber {
	onMetricDataChanged(metricData: MetricData[], event: IAngularEvent)
}

export class MetricStateService implements FileStateServiceSubscriber {

	private static METRIC_DATA_CHANGED_EVENT = "metric-data-changed";

	private metricData: MetricData[] = []

	constructor(
		private $rootScope: IRootScopeService
	) {
		FileStateService.subscribe(this.$rootScope, this)
	}

	public onFileSelectionStatesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
		this.metricData = this.calculateMetrics(fileStates, FileStateHelper.getVisibleFileStates(fileStates))
		this.notifySubscriber()
	}

	public onImportedFilesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
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

	public getMaxMetricInAllRevisions(files: CCFile[], metric: string): number {
		let maxValue = 0;
		files.forEach((file: CCFile) => {
			let nodes: HierarchyNode<CodeMapNode>[] = hierarchy(file.map).leaves();
			nodes.forEach((node: any) => {
				const currentValue = node.data.attributes[metric];
				if (currentValue > maxValue) {
					maxValue = currentValue;
				}
			});
		});
		return maxValue;
	}

	public calculateMetrics(fileStates: FileState[], visibleFileStates: FileState[]): MetricData[] {
		if (fileStates.length <= 0) {
			return []
		} else {
			const allMetrics: string[] = this.getUniqueMetricNames(fileStates);
			const metricsFromVisibleMaps: string[] = this.getUniqueMetricNames(visibleFileStates)
			return this.calculateMetricData(fileStates, allMetrics, metricsFromVisibleMaps);
		}
	}

	private getUniqueMetricNames(fileStates: FileState[]): string[] {
		if (fileStates.length == 0) {
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

	private calculateMetricData(fileStates: FileState[], allMetrics: string[], metricsFromVisibleMaps: string[]) {
		let metricData: MetricData[] = [];
		for (const metricName of allMetrics) {
			metricData.push({
				name: metricName,
				maxValue: this.getMaxMetricInAllRevisions(fileStates.map(x => x.file), metricName),
				availableInVisibleMaps: !!metricsFromVisibleMaps.find(metric => metric == metricName)
			});
		}
		return this.sortByAttributeName(metricData);
	}

	private sortByAttributeName(metricData: MetricData[]): MetricData[] {
		return metricData.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
	}

	private notifySubscriber() {
		this.$rootScope.$broadcast(MetricStateService.METRIC_DATA_CHANGED_EVENT, this.metricData)
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: MetricStateServiceSubscriber) {
		$rootScope.$on(MetricStateService.METRIC_DATA_CHANGED_EVENT, (event, data) => {
			subscriber.onMetricDataChanged(data, event)
		})
	}
}
