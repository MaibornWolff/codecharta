import { createSelector } from "@ngrx/store"
import { hoveredNodeSelector, selectedNodeSelector } from "../../../renderer/renderModel/renderModel.facade"
import { FileExtensionCalculator } from "../../../util/fileExtension/fileExtensionCalculator"
import { areaMetricSelector } from "../../../stores/mapState/mapState.read.facade"
import { metricDistributionSelector } from "./metricDistribution.selector"
import { NodeType } from "../../../model/codeCharta.model"

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
