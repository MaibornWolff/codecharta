import { CodeMapNode, FileMeta } from "../../../model/codeCharta.model"
import { fileStatesAvailable, isDeltaState } from "../../../model/files/files.helper"
import { NodeDecorator } from "../../../util/nodeDecorator"
import { edgeMetricNamesSelector } from "../edgeMetricData/edgeMetricData.selector"
import { addEdgeMetricsForLeaves } from "./utils/addEdgeMetricsForLeaves"
import { blacklistSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { nodeAttributeTypesSelector } from "../../../lenses/metrics/metricsLens.facade"
import { edgeAttributeTypesSelector } from "../../../lenses/dependency/dependencyLens.facade"
import { structureTreeSelector } from "../../../lenses/structure/structure.facade"
import { visibleFileStatesSelector } from "../../../stores/fileStore/fileStore.facade"
import { metricDataSelector } from "./metricData/metricData.selector"
import { createSelector } from "@ngrx/store"
import { clone } from "../../../util/clone"

const accumulatedDataFallback: AccumulatedData = Object.freeze({
    unifiedMapNode: undefined,
    unifiedFileMeta: undefined
})

export type AccumulatedData = { unifiedMapNode: CodeMapNode | undefined; unifiedFileMeta: FileMeta | undefined }

// The composing layer above the lenses (Slice 14d): it reads the structure lens's undecorated tree
// (`structureTreeSelector`) DOWNWARD, then layers on the metric data, the blacklist and the
// `{ nodes, edges }` attributeTypes recomposed from the two metric lenses (metrics = node types, ADR
// 12; dependency = edge types). Because the aggregation/id-decoration lives HERE, above the lenses,
// the metrics lens can never need to read this back — which is exactly what makes a cycle-free
// per-node `valueOf` possible (CF #1). The structure tree is cloned before decoration: the selector is
// memoized, so its instance is shared across recomputes and must not be mutated in place.
export const accumulatedDataSelector = createSelector(
    metricDataSelector,
    visibleFileStatesSelector,
    structureTreeSelector,
    nodeAttributeTypesSelector,
    edgeAttributeTypesSelector,
    blacklistSelector,
    edgeMetricNamesSelector,
    (metricData, fileStates, structureTree, nodeAttributeTypes, edgeAttributeTypes, blacklist, edgeMetricNames) => {
        if (!fileStatesAvailable(fileStates) || !metricData.nodeMetricData || !structureTree?.map) {
            return accumulatedDataFallback
        }

        const data = clone(structureTree)
        NodeDecorator.decorateMap(data.map, metricData, blacklist)
        addEdgeMetricsForLeaves(metricData.nodeEdgeMetricsMap, data.map, edgeMetricNames)
        NodeDecorator.decorateParentNodesWithAggregatedAttributes(data.map, isDeltaState(fileStates), {
            nodes: nodeAttributeTypes,
            edges: edgeAttributeTypes
        })

        return {
            unifiedMapNode: data.map,
            unifiedFileMeta: data.fileMeta
        }
    }
)
