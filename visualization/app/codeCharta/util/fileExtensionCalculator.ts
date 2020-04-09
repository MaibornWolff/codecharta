import { BlacklistItem, BlacklistType, CodeMapNode } from "../codeCharta.model"
import * as d3 from "d3"
import { HierarchyNode } from "d3"
import { CodeMapHelper } from "./codeMapHelper"
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
	private static OTHER_GROUP_THRESHOLD_VALUE = 3.0

	public static getMetricDistribution(map: CodeMapNode, metric: string, blacklist: BlacklistItem[]): MetricDistribution[] {
		let distribution: MetricDistribution[] = this.getAbsoluteDistribution(map, metric, blacklist)
		distribution = this.decorateDistributionWithRelativeMetricValue(distribution)
		distribution.sort((a, b) => b.absoluteMetricValue - a.absoluteMetricValue)
		distribution = this.getMetricDistributionWithOthers(distribution)

		return distribution
	}

	private static getAbsoluteDistribution(map: CodeMapNode, metric: string, blacklist: BlacklistItem[]): MetricDistribution[] {
		let distribution: MetricDistribution[] = []
		d3.hierarchy(map)
			.leaves()
			.forEach((node: HierarchyNode<CodeMapNode>) => {
				if (!CodeMapHelper.isBlacklisted(node.data, BlacklistType.exclude)) {
					const fileExtension: string = this.estimateFileExtension(node.data.name)
					const metricValue: number = node.data.attributes[metric]
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
		let otherExtension: MetricDistribution = this.getOtherExtension()
		let visibleDistributions: MetricDistribution[] = []

		distribution.forEach((x: MetricDistribution) => {
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

	public static hashCode(fileExtension: string): number {
		let hash: number = 0
		for (let i = 0; i < fileExtension.length; i++) {
			hash = fileExtension.charCodeAt(i) + ((hash << 5) - hash)
		}
		return hash
	}

	public static numberToHsl(hashCode: number): HSL {
		const shortened = hashCode % 360
		return new HSL(shortened, 40, 50)
	}

	public static getNoneExtension() {
		return {
			fileExtension: FileExtensionCalculator.NO_EXTENSION,
			absoluteMetricValue: null,
			relativeMetricValue: 100,
			color: "#676867"
		}
	}
}
