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
	private static NO_EXTENSION = "none"

	// TODO: this does not exclude blacklisted nodes yet
	public static getRelativeFileExtensionDistribution(map: CodeMapNode, metrics: string[]): MetricDistributionPair {
		const distribution: MetricDistributionPair = this.getAbsoluteFileExtensionDistribution(map, metrics)

		_.keys(distribution).forEach(metric => {
			const sumOfAllMetricValues: number = this.getSumOfAllMetrics(distribution[metric])
			distribution[metric].forEach(
				(x: ExtensionAttribute) => (x.relativeMetricValue = (x.absoluteMetricValue / sumOfAllMetricValues) * 100)
			)
			distribution[metric].sort((a, b) => b.absoluteMetricValue - a.absoluteMetricValue)
		})

		return distribution
	}

	private static getAbsoluteFileExtensionDistribution(map: CodeMapNode, metrics: string[]): MetricDistributionPair {
		let distribution: MetricDistributionPair = {}
		d3.hierarchy(map)
			.leaves()
			.forEach((node: HierarchyNode<CodeMapNode>) => {
				const fileExtension: string = this.estimateFileExtension(node.data.name)
				metrics.forEach((metric: string) => {
					const metricValue: number = node.data.attributes[metric]
					if (!_.has(distribution, metric)) {
						distribution[metric] = []
					}
					const matchingFileExtensionObject = distribution[metric].find(x => x.fileExtension == fileExtension)
					if (matchingFileExtensionObject) {
						matchingFileExtensionObject.absoluteMetricValue += metricValue
					} else {
						distribution[metric].push({
							fileExtension: fileExtension,
							absoluteMetricValue: metricValue,
							relativeMetricValue: null,
							color: null
						})
					}
				})
			})
		return distribution
	}

	private static getSumOfAllMetrics(distribution: ExtensionAttribute[]): number {
		return distribution.map(x => x.absoluteMetricValue).reduce((partialSum, a) => partialSum + a)
	}

	private static estimateFileExtension(fileName: string): string {
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
