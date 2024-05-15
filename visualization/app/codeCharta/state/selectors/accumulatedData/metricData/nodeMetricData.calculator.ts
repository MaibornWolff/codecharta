import { hierarchy } from "d3-hierarchy"

import { BlacklistItem, NodeMetricData } from "../../../../codeCharta.model"
import { FileState } from "../../../../model/files/files"
import { isLeaf, isPathBlacklisted } from "../../../../util/codeMapHelper"
import { sortByMetricName } from "./sortByMetricName"

export const UNARY_METRIC = "unary"

export const calculateNodeMetricData = (visibleFileStates: FileState[], blacklist: BlacklistItem[]) => {
    if (visibleFileStates.length === 0) {
        return []
    }

    const metricValues: Map<string, number[]> = new Map()
    const metricMaxValues: Map<string, number> = new Map()
    const metricMinValues: Map<string, number> = new Map()

    for (const { file } of visibleFileStates) {
        for (const node of hierarchy(file.map)) {
            if (isLeaf(node) && node.data.path && !isPathBlacklisted(node.data.path, blacklist, "exclude")) {
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
