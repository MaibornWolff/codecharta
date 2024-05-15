import { CodeMapNode } from "../../../codeCharta.model"
import { hierarchy } from "d3-hierarchy"
import { HSL } from "../../../util/color/hsl"
import { isLeaf } from "../../../util/codeMapHelper"

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

    static getMetricDistribution(map: CodeMapNode, metric: string): MetricDistribution[] {
        if (!map) {
            return []
        }

        const distributions: Map<string, MetricDistribution> = new Map()
        let sumOfAllMetricValues = 0

        for (const node of hierarchy(map)) {
            if (isLeaf(node) && !node.data.isExcluded) {
                const metricValue = node.data.attributes[metric]
                const fileExtension = FileExtensionCalculator.estimateFileExtension(node.data.name)
                const matchingFileExtensionObject = distributions.get(fileExtension)
                sumOfAllMetricValues += metricValue

                if (matchingFileExtensionObject) {
                    matchingFileExtensionObject.absoluteMetricValue += metricValue
                } else {
                    distributions.set(fileExtension, FileExtensionCalculator.getDistributionObject(fileExtension, metricValue))
                }
            }
        }
        if (sumOfAllMetricValues === 0) {
            return [FileExtensionCalculator.getNoneExtension()]
        }

        let metrics = []
        for (const distribution of distributions.values()) {
            if (distribution.absoluteMetricValue !== 0) {
                distribution.relativeMetricValue = (distribution.absoluteMetricValue * 100) / sumOfAllMetricValues
                metrics.push(distribution)
            }
        }
        metrics.sort((a, b) => b.absoluteMetricValue - a.absoluteMetricValue)
        metrics = FileExtensionCalculator.getMetricDistributionWithOthers(metrics)
        return metrics.length > 0 ? metrics : [FileExtensionCalculator.getNoneExtension()]
    }

    private static getMetricDistributionWithOthers(distribution: MetricDistribution[]) {
        const otherExtension = FileExtensionCalculator.getOtherExtension()
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
            color: FileExtensionCalculator.getColor(FileExtensionCalculator.OTHER_EXTENSION)
        }
    }

    private static getDistributionObject(fileExtension: string, metricValue: number): MetricDistribution {
        return {
            fileExtension,
            absoluteMetricValue: metricValue,
            relativeMetricValue: 0,
            color: FileExtensionCalculator.getColor(fileExtension)
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

    private static getNoneExtension(): MetricDistribution {
        return {
            fileExtension: FileExtensionCalculator.NO_EXTENSION,
            absoluteMetricValue: null,
            relativeMetricValue: 100,
            color: FileExtensionCalculator.getColor(FileExtensionCalculator.NO_EXTENSION)
        }
    }

    private static getColor(fileExtension: string): string {
        if (fileExtension === FileExtensionCalculator.NO_EXTENSION || fileExtension === FileExtensionCalculator.OTHER_EXTENSION) {
            return "#676867"
        }

        let hash = 0
        for (let index = 0; index < fileExtension.length; index++) {
            hash = fileExtension.codePointAt(index) + ((hash << 5) - hash)
        }
        return new HSL(hash % 360, 60, 50).toString()
    }
}
