import { CategorizedMetricDistribution, MetricDistribution, NO_EXTENSION } from "../../../util/fileExtension/fileExtensionCalculator"

export function extensionsGroupedIntoOther(distribution: CategorizedMetricDistribution): MetricDistribution[] {
    if (distribution.others.length === 0) {
        return []
    }
    const hasOwnNoneSegment = distribution.visible.some(item => item.fileExtension === NO_EXTENSION)
    const mergedNone = hasOwnNoneSegment ? [] : distribution.none
    return [...distribution.others, ...mergedNone].sort((first, second) => second.absoluteMetricValue - first.absoluteMetricValue)
}
