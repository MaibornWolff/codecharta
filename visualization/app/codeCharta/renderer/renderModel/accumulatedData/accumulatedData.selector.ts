import { createSelector } from "@ngrx/store"
import { structureTreeSelector } from "../../../lenses/structure/structure.facade"
import { CodeMapNode, FileMeta } from "../../../model/codeCharta.model"
import { fileStatesAvailable, isDeltaState } from "../../../model/files/files.helper"
import { visibleFileStatesSelector } from "../../../stores/fileStore/fileStore.facade"
import { excludedNodesSelector, excludeMetricRulesSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { clone } from "../../../util/clone"
import { NodeDecorator } from "../../../util/nodeDecorator"
import { attributeTypesSelector } from "../attributeTypes.selector"
import { edgeMetricNamesSelector } from "../edgeMetricData/edgeMetricData.selector"
import { metricDataSelector } from "./metricData/metricData.selector"
import { addEdgeMetricsForLeaves } from "./utils/addEdgeMetricsForLeaves"

const accumulatedDataFallback: AccumulatedData = Object.freeze({
    unifiedMapNode: undefined,
    unifiedFileMeta: undefined
})

export type AccumulatedData = { unifiedMapNode: CodeMapNode | undefined; unifiedFileMeta: FileMeta | undefined }

// The structure tree is cloned before decoration: the selector is memoized, so its instance is shared across recomputes and must not be mutated in place.
// Only exclusion is an input: a flatten rule changes how a subtree looks, not which nodes the map holds, and is applied while it is laid out instead.
export const accumulatedDataSelector = createSelector(
    metricDataSelector,
    visibleFileStatesSelector,
    structureTreeSelector,
    attributeTypesSelector,
    excludedNodesSelector,
    excludeMetricRulesSelector,
    edgeMetricNamesSelector,
    (metricData, fileStates, structureTree, attributeTypes, excludedNodes, excludeMetricRules, edgeMetricNames) => {
        if (!fileStatesAvailable(fileStates) || !metricData.nodeMetricData || !structureTree?.map) {
            return accumulatedDataFallback
        }

        const data = clone(structureTree)
        NodeDecorator.decorateMap(data.map, metricData, excludedNodes, excludeMetricRules)
        addEdgeMetricsForLeaves(metricData.nodeEdgeMetricsMap, data.map, edgeMetricNames)
        NodeDecorator.decorateParentNodesWithAggregatedAttributes(data.map, isDeltaState(fileStates), attributeTypes)

        return {
            unifiedMapNode: data.map,
            unifiedFileMeta: data.fileMeta
        }
    }
)
