import { CodeMapNode } from "../codeCharta.model"
import { hierarchy } from "d3"
import { HSL } from "./color/hsl"

export interface MetricDistribution {
	fileExtension: string
	absoluteMetricValue: number
	relativeMetricValue: number
	color: string
}

export class FileExtensionCalculator {
	private static readonly NO_EXTENSION = "None"
	private static readonly OTHER_EXTENSION = "other"
	private static OTHER_GROUP_THRESHOLD_VALUE = 3

	public static getMetricDistribution(map: CodeMapNode, metric: string) {
		let distribution: MetricDistribution[] = this.getAbsoluteDistribution(map, metric)
		distribution = this.decorateDistributionWithRelativeMetricValue(distribution)
		distribution.sort((a, b) => b.absoluteMetricValue - a.absoluteMetricValue)
		distribution = this.getMetricDistributionWithOthers(distribution)

		return distribution
	}

	private static getAbsoluteDistribution(map: CodeMapNode, metric: string) {
		const distribution: MetricDistribution[] = []
		hierarchy(map)
			.leaves()
			.forEach(node => {
				if (!node.data.isExcluded) {
					const fileExtension = this.estimateFileExtension(node.data.name)
					const metricValue = node.data.attributes[metric]
					const matchingFileExtensionObject = distribution.find(x => x.fileExtension === fileExtension)

					if (matchingFileExtensionObject) {
						matchingFileExtensionObject.absoluteMetricValue += metricValue
					} else {
						distribution.push(this.getDistributionObject(fileExtension, metricValue))
					}
				}
			})
		return distribution
	}

	private static decorateDistributionWithRelativeMetricValue(distribution: MetricDistribution[]) {
		const sumOfAllMetricValues = this.getSumOfAllMetrics(distribution)
		if (sumOfAllMetricValues === 0) {
			return [this.getNoneExtension()]
		}
		distribution.forEach(x => {
			if (x.absoluteMetricValue !== 0) {
				x.relativeMetricValue = (x.absoluteMetricValue / sumOfAllMetricValues) * 100
			}
		})

		return distribution
	}

	private static getMetricDistributionWithOthers(distribution: MetricDistribution[]) {
		const otherExtension: MetricDistribution = this.getOtherExtension()
		const visibleDistributions: MetricDistribution[] = []

		distribution.forEach(x => {
			if (x.relativeMetricValue > FileExtensionCalculator.OTHER_GROUP_THRESHOLD_VALUE) {
				visibleDistributions.push(x)
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

	private static getDistributionObject(fileExtension: string, metricValue: number): MetricDistribution {
		return {
			fileExtension,
			absoluteMetricValue: metricValue,
			relativeMetricValue: null,
			color: null
		}
	}

	private static getSumOfAllMetrics(distribution: MetricDistribution[]) {
		return distribution.reduce((partialSum, a) => partialSum + a.absoluteMetricValue, 0)
	}

	public static estimateFileExtension(fileName: string) {
		if (fileName.includes(".")) {
			return fileName.split(".").reverse()[0].toLowerCase()
		}
		return FileExtensionCalculator.NO_EXTENSION
	}

	public static hashCode(fileExtension: string) {
		let hash = 0
		for (let i = 0; i < fileExtension.length; i++) {
			hash = fileExtension.charCodeAt(i) + ((hash << 5) - hash)
		}
		return hash
	}

	public static numberToHsl(hashCode: number) {
		const shortened = hashCode % 360
		return new HSL(shortened, 40, 50)
	}

	public static getNoneExtension(): MetricDistribution {
		return {
			fileExtension: FileExtensionCalculator.NO_EXTENSION,
			absoluteMetricValue: null,
			relativeMetricValue: 100,
			color: "#676867"
		}
	}
}
