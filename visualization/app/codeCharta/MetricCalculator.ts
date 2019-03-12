import {CCFile, CodeMapNode, FileSelectionState, FileState, MetricData} from "./codeCharta.model";
import {hierarchy, HierarchyNode} from "d3";

export class MetricCalculator {

	public static getMaxMetricInAllRevisions(files: CCFile[], metric: string): number {
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

	public static calculateMetrics(fileStates: FileState[], visibleFileStates: FileState[]): MetricData[] {
		if (fileStates.length <= 0) {
			return []
		} else {
			const allMetrics: string[] = this.getUniqueMetricNames(fileStates);
			const metricsFromVisibleMaps: string[] = this.getUniqueMetricNames(visibleFileStates)
			return this.getMetricData(fileStates, allMetrics, metricsFromVisibleMaps);
		}
	}

	private static getUniqueMetricNames(fileStates: FileState[]): string[] {
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

	private static getMetricData(fileStates: FileState[], allMetrics: string[], metricsFromVisibleMaps: string[]) {
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

	private static sortByAttributeName(metricData: MetricData[]): MetricData[] {
		return metricData.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
	}
}
