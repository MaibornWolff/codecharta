import { createSelector } from "@ngrx/store"
import { hoveredNodeSelector } from "../../../state/selectors/hoveredNode.selector"
import { selectedNodeSelector } from "../../../state/selectors/selectedNode.selector"
import { FileExtensionCalculator } from "./fileExtensionCalculator"
import { areaMetricSelector } from "../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { metricDistributionSelector } from "./metricDistribution.selector"
import { NodeType } from "../../../codeCharta.model"

export const hoveredNodeMetricDistributionSelector = createSelector(
    hoveredNodeSelector,
    selectedNodeSelector,
    areaMetricSelector,
    metricDistributionSelector,
    (hoveredNode, selectedNode, areaMetric, globalDistribution) => {
        const nodeToShow = hoveredNode || selectedNode

        if (!nodeToShow || nodeToShow.type === NodeType.FILE) {
            return globalDistribution
        }
        return FileExtensionCalculator.getMetricDistribution(nodeToShow, areaMetric)
    }
)
