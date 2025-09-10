import { CodeMapNode } from "../../../codeCharta.model"
import { hierarchy } from "d3-hierarchy"
import { HSL } from "../../../util/color/hsl"
import { isLeaf } from "../../../util/codeMapHelper"

export const OTHER_EXTENSION = "other"
export const NO_EXTENSION = "None"

export interface CategorizedMetricDistribution {
    visible: MetricDistribution[]
    others: MetricDistribution[]
    none: MetricDistribution[]
}

export interface MetricDistribution {
    fileExtension: string
    absoluteMetricValue: number
    relativeMetricValue: number
    color: string
}

export class FileExtensionCalculator {
    private static readonly OTHER_GROUP_THRESHOLD_VALUE = 3

    static getMetricDistribution(map: CodeMapNode, metric: string): CategorizedMetricDistribution {
        if (!map) {
            return { visible: [], others: [], none: [] }
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
            return { visible: [FileExtensionCalculator.getNoneExtension()], others: [], none: [FileExtensionCalculator.getNoneExtension()] }
        }

        const metrics = []
        for (const distribution of distributions.values()) {
            if (distribution.absoluteMetricValue !== 0) {
                distribution.relativeMetricValue = (distribution.absoluteMetricValue * 100) / sumOfAllMetricValues
                metrics.push(distribution)
            }
        }
        metrics.sort((a, b) => b.absoluteMetricValue - a.absoluteMetricValue)

        const distribution = FileExtensionCalculator.getMetricDistributionWithOthers(metrics)
        return distribution.visible.length > 0
            ? distribution
            : {
                  visible: [FileExtensionCalculator.getNoneExtension()],
                  others: [],
                  none: [FileExtensionCalculator.getNoneExtension()]
              }
    }

    private static getMetricDistributionWithOthers(distribution: MetricDistribution[]): CategorizedMetricDistribution {
        const otherExtension = FileExtensionCalculator.getOtherExtension()
        const noneExtension = FileExtensionCalculator.getNoExtension()

        const visible: MetricDistribution[] = []
        const others: MetricDistribution[] = []
        const none: MetricDistribution[] = []

        for (const metric of distribution) {
            if (metric.fileExtension === NO_EXTENSION) {
                noneExtension.absoluteMetricValue += metric.absoluteMetricValue
                noneExtension.relativeMetricValue += metric.relativeMetricValue
                continue
            }

            if (metric.relativeMetricValue >= this.OTHER_GROUP_THRESHOLD_VALUE) {
                visible.push(metric)
            } else {
                otherExtension.absoluteMetricValue += metric.absoluteMetricValue
                otherExtension.relativeMetricValue += metric.relativeMetricValue
                others.push(metric)
            }
        }

        if (noneExtension.absoluteMetricValue > 0) {
            none.push(noneExtension)
            if (noneExtension.relativeMetricValue >= this.OTHER_GROUP_THRESHOLD_VALUE || otherExtension.relativeMetricValue === 0) {
                visible.push(noneExtension)
            } else {
                otherExtension.absoluteMetricValue += noneExtension.absoluteMetricValue
                otherExtension.relativeMetricValue += noneExtension.relativeMetricValue
            }
        }

        if (others.length > 0) {
            visible.push(otherExtension)
        }

        return { visible: visible, others: others, none: none }
    }

    private static getOtherExtension(): MetricDistribution {
        return {
            fileExtension: OTHER_EXTENSION,
            absoluteMetricValue: 0,
            relativeMetricValue: 0,
            color: FileExtensionCalculator.getColor(OTHER_EXTENSION)
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
        return NO_EXTENSION
    }

    private static getNoExtension(): MetricDistribution {
        return {
            fileExtension: NO_EXTENSION,
            absoluteMetricValue: 0,
            relativeMetricValue: 0,
            color: FileExtensionCalculator.getColor(NO_EXTENSION)
        }
    }

    private static getNoneExtension(): MetricDistribution {
        return {
            fileExtension: NO_EXTENSION,
            absoluteMetricValue: null,
            relativeMetricValue: 100,
            color: FileExtensionCalculator.getColor(NO_EXTENSION)
        }
    }

    private static getColor(fileExtension: string): string {
        if (fileExtension === NO_EXTENSION || fileExtension === OTHER_EXTENSION) {
            return "#676867"
        }

        let hash = 0
        for (let index = 0; index < fileExtension.length; index++) {
            hash = fileExtension.codePointAt(index) + ((hash << 5) - hash)
        }
        return new HSL(hash % 360, 60, 50).toString()
    }
}
