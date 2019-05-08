import { CodeMapNode, KeyValuePair } from "../codeCharta.model"
import * as d3 from "d3"
import { HierarchyNode } from "d3"
import _ from "lodash"

export interface FileExtensionDistribution {
	metric: string
	distribution: KeyValuePair
}

export class FileExtensionCalculator {
	private static NO_EXTENSION = "none"
	private static distribution: FileExtensionDistribution[]

	// TODO: this does not exclude blacklisted nodes yet
	public static getFileExtensionDistribution(map: CodeMapNode, metrics: string[]): FileExtensionDistribution[] {
		this.initEmptyDistribution(metrics)

		d3.hierarchy(map)
			.leaves()
			.forEach((node: HierarchyNode<CodeMapNode>) => {
				const fileExtension: string = this.estimateFileExtension(node.data.name)
				metrics.forEach((metric: string) => {
					const metricValue: number = node.data.attributes[metric]
					const distributionPointer: KeyValuePair = this.distribution.find(x => x.metric === metric).distribution

					if (_.keys(distributionPointer).includes(fileExtension)) {
						distributionPointer[fileExtension] += metricValue
					} else {
						distributionPointer[fileExtension] = metricValue
					}
				})
			})
		return this.distribution
	}

	private static initEmptyDistribution(metrics: string[]) {
		this.distribution = []

		metrics.forEach((metric: string) => {
			this.distribution.push({
				metric: metric,
				distribution: {}
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
