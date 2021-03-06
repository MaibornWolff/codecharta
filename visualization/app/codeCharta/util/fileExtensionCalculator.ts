import { CodeMapNode } from "../codeCharta.model"
import { hierarchy } from "d3-hierarchy"
import { HSL } from "./color/hsl"
import { isLeaf } from "./codeMapHelper"

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

	static getMetricDistribution(map: CodeMapNode, metric: string) {
		const distributions: Map<string, MetricDistribution> = new Map()
		let sumOfAllMetricValues = 0

		for (const node of hierarchy(map)) {
			if (isLeaf(node) && !node.data.isExcluded) {
				const metricValue = node.data.attributes[metric]
				const fileExtension = this.estimateFileExtension(node.data.name)
				const matchingFileExtensionObject = distributions.get(fileExtension)
				sumOfAllMetricValues += metricValue

				if (matchingFileExtensionObject) {
					matchingFileExtensionObject.absoluteMetricValue += metricValue
				} else {
					distributions.set(fileExtension, this.getDistributionObject(fileExtension, metricValue))
				}
			}
		}
		if (sumOfAllMetricValues === 0) {
			return [this.getNoneExtension()]
		}
		const metrics = []
		for (const distribution of distributions.values()) {
			if (distribution.absoluteMetricValue !== 0) {
				distribution.relativeMetricValue = (distribution.absoluteMetricValue * 100) / sumOfAllMetricValues
				metrics.push(distribution)
			}
		}
		metrics.sort((a, b) => b.absoluteMetricValue - a.absoluteMetricValue)
		return this.getMetricDistributionWithOthers(metrics)
	}

	private static getMetricDistributionWithOthers(distribution: MetricDistribution[]) {
		const otherExtension = this.getOtherExtension()
		const visibleDistributions: MetricDistribution[] = []

		for (const metric of distribution) {
			if (metric.relativeMetricValue > FileExtensionCalculator.OTHER_GROUP_THRESHOLD_VALUE) {
				visibleDistributions.push(metric)
			} else {
				otherExtension.absoluteMetricValue += metric.absoluteMetricValue
				otherExtension.relativeMetricValue += metric.relativeMetricValue
			}
		}

		if (otherExtension.relativeMetricValue > 0) {
			visibleDistributions.push(otherExtension)
		}

		return visibleDistributions
	}

	private static getOtherExtension(): MetricDistribution {
		return {
			fileExtension: FileExtensionCalculator.OTHER_EXTENSION,
			absoluteMetricValue: 0,
			relativeMetricValue: 0,
			color: "#676867"
		}
	}

	private static getDistributionObject(fileExtension: string, metricValue: number): MetricDistribution {
		return {
			fileExtension,
			absoluteMetricValue: metricValue,
			relativeMetricValue: 0,
			color: null
		}
	}

	static estimateFileExtension(fileName: string) {
		const lastDotPosition = fileName.lastIndexOf(".")
		if (lastDotPosition > 0 && lastDotPosition !== fileName.length) {
			const extension = fileName.slice(lastDotPosition + 1)
			return extension.toLowerCase()
		}
		return FileExtensionCalculator.NO_EXTENSION
	}

	static hashCode(fileExtension: string) {
		let hash = 0
		for (let index = 0; index < fileExtension.length; index++) {
			hash = fileExtension.charCodeAt(index) + ((hash << 5) - hash)
		}
		return hash
	}

	static numberToHsl(hashCode: number) {
		const shortened = hashCode % 360
		return new HSL(shortened, 40, 50)
	}

	static getNoneExtension(): MetricDistribution {
		return {
			fileExtension: FileExtensionCalculator.NO_EXTENSION,
			absoluteMetricValue: null,
			relativeMetricValue: 100,
			color: "#676867"
		}
	}
}
