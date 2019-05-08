import { CodeMapNode, KeyValuePair } from "../codeCharta.model"
import * as d3 from "d3"
import { HierarchyNode } from "d3"
import _ from "lodash"

export interface ExtensionAttribute {
	fileExtension: string,
	absoluteMetricValue: number,
	relativeMetricValue: number,
	color: string
}

export interface MetricDistribution {
	metric: string
	distribution: ExtensionAttribute[]
}

export class FileExtensionCalculator {
	private static NO_EXTENSION = "none"
	private static distribution: MetricDistribution[]

	// TODO: this does not exclude blacklisted nodes yet
	public static getAbsoluteFileExtensionDistribution(map: CodeMapNode, metrics: string[]): MetricDistribution[] {
		this.initEmptyDistribution(metrics)

		d3.hierarchy(map)
			.leaves()
			.forEach((node: HierarchyNode<CodeMapNode>) => {
				const fileExtension: string = this.estimateFileExtension(node.data.name)
				metrics.forEach((metric: string) => {
					const metricValue: number = node.data.attributes[metric]
					const extensionPointer: ExtensionAttribute[] = this.distribution.find(x => x.metric === metric).distribution
					const matchingItem: ExtensionAttribute = extensionPointer.find(x => x.fileExtension === fileExtension)

					if (matchingItem) {
						matchingItem.absoluteMetricValue += metricValue
					} else {
						extensionPointer.push({
							fileExtension: fileExtension,
							absoluteMetricValue: metricValue,
							relativeMetricValue: null,
							color: null
						})
					}
				})
			})
		return this.distribution
	}

	public static getRelativeFileExtensionDistribution(map: CodeMapNode, metrics: string[]): MetricDistribution[] {
		const distribution: MetricDistribution[] = this.getAbsoluteFileExtensionDistribution(map, metrics)

		distribution.forEach((distribution: MetricDistribution) => {
			const sumOfAllMetricValues: number = this.getSumOfAllMetrics(distribution)
			distribution.distribution.forEach((x: ExtensionAttribute) =>
					x.relativeMetricValue = Math.round(x.absoluteMetricValue / sumOfAllMetricValues * 10000) / 100
			)
			distribution.distribution.sort((a,b) => b.absoluteMetricValue - a.absoluteMetricValue)
		})

		return distribution
	}

	private static getSumOfAllMetrics(distribution: MetricDistribution): number {
		return distribution.distribution.map(x => x.absoluteMetricValue)
			.reduce((partialSum, a) => partialSum + a)
	}

	private static initEmptyDistribution(metrics: string[]) {
		this.distribution = []

		metrics.forEach((metric: string) => {
			this.distribution.push({
				metric: metric,
				distribution: []
			})
		})
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
