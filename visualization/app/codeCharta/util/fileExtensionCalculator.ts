import { CodeMapNode } from "../codeCharta.model"
import * as d3 from "d3"
import { HierarchyNode } from "d3"
import _ from "lodash"

export interface MetricDistribution {
	fileExtension: string
	absoluteMetricValue: number
	relativeMetricValue: number
	color: string
}

export class FileExtensionCalculator {
	private static readonly NO_EXTENSION = "None"
	private static readonly OTHER_EXTENSION = "other"
	private static OTHER_GROUP_THRESHOLD_VALUE = 90

	// TODO: this does not exclude blacklisted nodes yet
	public static getMetricDistribution(map: CodeMapNode, metric: string): MetricDistribution[] {
		let distribution: MetricDistribution[] = this.getAbsoluteDistribution(map, metric)
		distribution = this.decorateDistributionWithRelativeMetricValue(distribution)
		distribution.sort((a, b) => b.absoluteMetricValue - a.absoluteMetricValue)
		distribution = this.getMetricDistributionWithOthers(distribution)
		return distribution
	}

	private static getAbsoluteDistribution(map: CodeMapNode, metric: string): MetricDistribution[] {
		let distribution: MetricDistribution[] = []
		d3.hierarchy(map)
			.leaves()
			.forEach((node: HierarchyNode<CodeMapNode>) => {
				const fileExtension: string = this.estimateFileExtension(node.data.name)
				const metricValue: number = node.data.attributes[metric]
				const matchingFileExtensionObject = distribution.find(x => x.fileExtension === fileExtension)

				if (matchingFileExtensionObject) {
					matchingFileExtensionObject.absoluteMetricValue += metricValue
				} else {
					distribution.push(this.getDistributionObject(fileExtension, metricValue))
				}
			})
		return distribution
	}

	private static decorateDistributionWithRelativeMetricValue(distribution: MetricDistribution[]): MetricDistribution[] {
		const sumOfAllMetricValues: number = this.getSumOfAllMetrics(distribution)
		if (sumOfAllMetricValues === 0) {
			return [this.getNoneExtension()]
		}
		distribution.forEach((x: MetricDistribution) => {
			if (x.absoluteMetricValue !== 0) {
				x.relativeMetricValue = (x.absoluteMetricValue / sumOfAllMetricValues) * 100
			}
		})

		return distribution
	}

	private static getMetricDistributionWithOthers(distribution: MetricDistribution[]): MetricDistribution[] {
		let cummulativeRelativeSum: number = 0
		let otherExtension: MetricDistribution = this.getOtherExtension()
		let visibleDistributions: MetricDistribution[] = []

		distribution.forEach((x: MetricDistribution) => {
			if (cummulativeRelativeSum < FileExtensionCalculator.OTHER_GROUP_THRESHOLD_VALUE) {
				visibleDistributions.push(x)
				cummulativeRelativeSum += x.relativeMetricValue
			} else {
				otherExtension.absoluteMetricValue += x.absoluteMetricValue
				otherExtension.relativeMetricValue += x.relativeMetricValue
			}
		})

		if (otherExtension.relativeMetricValue > 0) {
			visibleDistributions.push(otherExtension)
		}

		return visibleDistributions
	}

	private static getOtherExtension() {
		return {
			fileExtension: FileExtensionCalculator.OTHER_EXTENSION,
			absoluteMetricValue: null,
			relativeMetricValue: 0,
			color: "#676867"
		}
	}

	private static getNoneExtension() {
		return {
			fileExtension: FileExtensionCalculator.NO_EXTENSION,
			absoluteMetricValue: null,
			relativeMetricValue: 100,
			color: "#676867"
		}
	}

	private static getDistributionObject(fileExtension: string, metricValue: number): MetricDistribution {
		return {
			fileExtension: fileExtension,
			absoluteMetricValue: metricValue,
			relativeMetricValue: null,
			color: null
		}
	}

	private static getSumOfAllMetrics(distribution: MetricDistribution[]): number {
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
