import { selectedNodeSelector } from "../selectedNode.selector"
import { Metric } from "../../../ui/attributeSideBar/util/metric"
import { primaryMetricNamesSelector } from "./primaryMetricNames.selector"
import { Edge } from "app/codeCharta/ui/attributeSideBar/util/edge"
import { CodeMapNode } from "app/codeCharta/codeCharta.model"
import { createSelector } from "@ngrx/store"

export type PrimaryMetrics = {
    area: Metric
    height: Metric
    color: Metric
    edge: Edge
}

export const primaryMetricsSelector = createSelector(
    selectedNodeSelector,
    primaryMetricNamesSelector,
    (selectedNode, primaryMetricNames) => {
        if (!selectedNode) {
            return
        }

        return {
            area: {
                name: primaryMetricNames.areaMetric,
                value: selectedNode.attributes[primaryMetricNames.areaMetric]
            },
            height: {
                name: primaryMetricNames.heightMetric,
                value: selectedNode.attributes[primaryMetricNames.heightMetric]
            },
            color: {
                name: primaryMetricNames.colorMetric,
                value: selectedNode.attributes[primaryMetricNames.colorMetric]
            },
            edge: getEdge(primaryMetricNames.edgeMetric, selectedNode)
        }
    }
)

function getEdge(key: string, selectedNode: CodeMapNode): Edge {
    if (key === undefined || key === null) {
        return null
    }
    return {
        name: key,
        incoming: selectedNode.edgeAttributes[key]?.incoming,
        outgoing: selectedNode.edgeAttributes[key]?.outgoing
    }
}
