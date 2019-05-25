import { CodeMapNode } from "../codeCharta.model"
import * as d3 from "d3"
import { HierarchyNode } from "d3"
import _ from "lodash"

export interface ExtensionAttribute {
	fileExtension: string
	absoluteMetricValue: number
	relativeMetricValue: number
	color: string
}

export interface MetricDistributionPair {
	[key: string]: ExtensionAttribute[]
}

export class FileExtensionCalculator {
	private static NO_EXTENSION = "None"

	// TODO: this does not exclude blacklisted nodes yet
	public static getRelativeFileExtensionDistribution(map: CodeMapNode, metric: string): ExtensionAttribute[] {
		const distribution: ExtensionAttribute[] = this.getAbsoluteFileExtensionDistribution(map, metric)

		const sumOfAllMetricValues: number = this.getSumOfAllMetrics(distribution)
		distribution.forEach((x: ExtensionAttribute) => {
			if (x.absoluteMetricValue !== 0) {
				x.relativeMetricValue = (x.absoluteMetricValue / sumOfAllMetricValues) * 100
			}
		})
		distribution.sort((a, b) => b.absoluteMetricValue - a.absoluteMetricValue)

		return distribution
	}

	private static getAbsoluteFileExtensionDistribution(map: CodeMapNode, metric: string): ExtensionAttribute[] {
		let distribution: ExtensionAttribute[] = []
		d3.hierarchy(map).leaves().forEach((node: HierarchyNode<CodeMapNode>) => {
			const fileExtension: string = this.estimateFileExtension(node.data.name)
			const metricValue: number = node.data.attributes[metric]
			const matchingFileExtensionObject = distribution.find(x => x.fileExtension == fileExtension)

			if (matchingFileExtensionObject) {
				matchingFileExtensionObject.absoluteMetricValue += metricValue
			} else {
				distribution.push({
					fileExtension: fileExtension,
					absoluteMetricValue: metricValue,
					relativeMetricValue: null,
					color: null
				})
			}
		})
		return distribution
	}

	private static getSumOfAllMetrics(distribution: ExtensionAttribute[]): number {
		return distribution.map(x => x.absoluteMetricValue).reduce((partialSum, a) => partialSum + a)
	}

	public static estimateFileExtension(fileName: string): string {
		if (fileName.includes(".")) {
			return fileName
				.split(".")
				.reverse()[0]
				.toLowerCase()
		} else {
			return FileExtensionCalculator.NO_EXTENSION
		}
	}
}
