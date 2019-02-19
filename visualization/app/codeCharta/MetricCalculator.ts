import { CCFile, MetricData, CodeMapNode } from "./codeCharta.model";
import { HierarchyNode, hierarchy } from "d3";
export class MetricCalculator {
	public static calculateMetrics(importedFiles: CCFile[]): {
		metrics: string[];
		data: MetricData[];
	} {
		if (importedFiles.length <= 0) {
			return { metrics: [], data: [] };
		}
		else {
			const metrics = MetricCalculator.getUniqueMetricNames(importedFiles);
			const data = MetricCalculator.getMetricNamesWithMaxValue(importedFiles, metrics);
			return { metrics: metrics, data: data };
		}
	}
	private static getUniqueMetricNames(importedFiles: CCFile[]): string[] {
		let leaves: HierarchyNode<CodeMapNode>[] = [];
		importedFiles.forEach((file: CCFile) => {
			leaves = leaves.concat(hierarchy<CodeMapNode>(file.map).leaves());
		});
		let attributeList: string[][] = leaves.map((d: HierarchyNode<CodeMapNode>) => {
			return d.data.attributes ? Object.keys(d.data.attributes) : [];
		});
		let attributes: string[] = attributeList.reduce((left: string[], right: string[]) => {
			return left.concat(right.filter(el => left.indexOf(el) === -1));
		});
		return attributes.sort();
	}
	private static getMetricNamesWithMaxValue(importedFiles: CCFile[], metrics: string[]) {
		let metricData: MetricData[] = [];
		for (const attribute of metrics) {
			metricData.push({ name: attribute, maxValue: this.getMaxMetricInAllRevisions(importedFiles, attribute) });
		}
		return this.sortByAttributeName(metricData);
	}
	public static getMaxMetricInAllRevisions(importedFiles: CCFile[], metric: string): number {
		let maxValue = 0;
		importedFiles.forEach((file) => {
			let nodes = hierarchy(file.map).leaves();
			nodes.forEach((node: any) => {
				const currentValue = node.data.attributes[metric];
				if (currentValue > maxValue) {
					maxValue = currentValue;
				}
			});
		});
		return maxValue;
	}
	private static sortByAttributeName(metricData: MetricData[]): MetricData[] {
		return metricData.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
	}
}
