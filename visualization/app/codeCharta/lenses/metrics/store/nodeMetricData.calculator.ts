import { hierarchy } from "d3-hierarchy"

import { NodeMetricData } from "../../../codeCharta.model"
import { FileState } from "../../../model/files/files"
import { BlacklistMatcher } from "../../../util/blacklist/blacklistMatcher"
import { isLeaf } from "../../../util/codeMapHelper"
import { sortByMetricName } from "../../../util/metric/sortByMetricName"
import { UNARY_METRIC } from "../../../util/metric/unaryMetric"

export const calculateNodeMetricData = (visibleFileStates: FileState[], matcher: BlacklistMatcher) => {
    if (visibleFileStates.length === 0) {
        return []
    }

    const metricValues: Map<string, number[]> = new Map()
    const metricMaxValues: Map<string, number> = new Map()
    const metricMinValues: Map<string, number> = new Map()

    for (const { file } of visibleFileStates) {
        for (const node of hierarchy(file.map)) {
            if (isLeaf(node) && node.data.path && !matcher.isExcludedLeaf(node.data.path)) {
                for (const metric of Object.keys(node.data.attributes)) {
                    const maxValue = metricMaxValues.get(metric)
                    const minValue = metricMinValues.get(metric)

                    if (!metricValues.get(metric)) {
                        metricValues.set(metric, [])
                    }
                    metricValues.get(metric).push(node.data.attributes[metric])

                    if (minValue === undefined || minValue >= node.data.attributes[metric]) {
                        metricMinValues.set(metric, node.data.attributes[metric])
                    }

                    if (maxValue === undefined || maxValue <= node.data.attributes[metric]) {
                        metricMaxValues.set(metric, node.data.attributes[metric])
                    }
                }
            }
        }
    }

    const metricData: NodeMetricData[] = []

    // TODO: Remove the unary metric.
    metricMaxValues.set(UNARY_METRIC, 1)
    metricMinValues.set(UNARY_METRIC, 1)

    for (const [key, value] of metricMaxValues) {
        metricData.push({
            name: key,
            values: metricValues.get(key),
            maxValue: value,
            minValue: metricMinValues.get(key)
        })
    }

    sortByMetricName(metricData)
    return metricData
}
