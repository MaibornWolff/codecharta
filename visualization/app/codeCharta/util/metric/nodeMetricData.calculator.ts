import { hierarchy } from "d3-hierarchy"

import { KeyValuePair, NodeMetricData } from "../../model/codeCharta.model"
import { FileState } from "../../model/files/files"
import { BlacklistMatcher } from "../blacklist/blacklistMatcher"
import { isLeaf } from "../codeMapHelper"
import { sortByMetricName } from "./sortByMetricName"
import { UNARY_METRIC } from "./unaryMetric"

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
                collectMetricValues(node.data.attributes, metricValues, metricMinValues, metricMaxValues)
            }
        }
    }

    const metricData: NodeMetricData[] = []

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

function collectMetricValues(
    attributes: KeyValuePair,
    metricValues: Map<string, number[]>,
    metricMinValues: Map<string, number>,
    metricMaxValues: Map<string, number>
) {
    for (const metric of Object.keys(attributes)) {
        const maxValue = metricMaxValues.get(metric)
        const minValue = metricMinValues.get(metric)

        if (!metricValues.get(metric)) {
            metricValues.set(metric, [])
        }
        metricValues.get(metric).push(attributes[metric])

        if (minValue === undefined || minValue >= attributes[metric]) {
            metricMinValues.set(metric, attributes[metric])
        }

        if (maxValue === undefined || maxValue <= attributes[metric]) {
            metricMaxValues.set(metric, attributes[metric])
        }
    }
}
