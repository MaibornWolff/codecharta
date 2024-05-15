import { CodeMapNode, FileMeta } from "../../../codeCharta.model"
import { FileState } from "../../../model/files/files"
import { fileStatesAvailable, isDeltaState, isPartialState } from "../../../model/files/files.helper"
import { AggregationGenerator } from "../../../util/aggregationGenerator"
import { NodeDecorator } from "../../../util/nodeDecorator"
import { metricNamesSelector } from "./metricData/metricNames.selector"
import { getDeltaFile } from "./utils/getDeltaFile"
import { addEdgeMetricsForLeaves } from "./utils/addEdgeMetricsForLeaves"
import { blacklistSelector } from "../../store/fileSettings/blacklist/blacklist.selector"
import { attributeTypesSelector } from "../../store/fileSettings/attributeTypes/attributeTypes.selector"
import { visibleFileStatesSelector } from "../visibleFileStates.selector"
import { metricDataSelector } from "./metricData/metricData.selector"
import { createSelector } from "@ngrx/store"
import { clone } from "../../../util/clone"

const accumulatedDataFallback: AccumulatedData = Object.freeze({
    unifiedMapNode: undefined,
    unifiedFileMeta: undefined
})

export type AccumulatedData = { unifiedMapNode: CodeMapNode | undefined; unifiedFileMeta: FileMeta | undefined }

export const accumulatedDataSelector = createSelector(
    metricDataSelector,
    visibleFileStatesSelector,
    attributeTypesSelector,
    blacklistSelector,
    metricNamesSelector,
    (metricData, fileStates, attributeTypes, blacklist, metricNames) => {
        if (!fileStatesAvailable(fileStates) || !metricData.nodeMetricData) {
            return accumulatedDataFallback
        }

        const data = _getUndecoratedAccumulatedData(clone(fileStates))
        if (!data?.map) {
            return accumulatedDataFallback
        }

        NodeDecorator.decorateMap(data.map, metricData, blacklist)
        addEdgeMetricsForLeaves(metricData.nodeEdgeMetricsMap, data.map, metricNames)
        NodeDecorator.decorateParentNodesWithAggregatedAttributes(data.map, isDeltaState(fileStates), attributeTypes)

        return {
            unifiedMapNode: data.map,
            unifiedFileMeta: data.fileMeta
        }
    }
)

export const _getUndecoratedAccumulatedData = (fileStates: FileState[]) => {
    if (isPartialState(fileStates)) {
        return AggregationGenerator.calculateAggregationFile(fileStates)
    }
    if (isDeltaState(fileStates)) {
        const [reference, comparison] = fileStates
        if (comparison && reference.file.map.name !== comparison.file.map.name) {
            return AggregationGenerator.calculateAggregationFile(fileStates)
        }
        return getDeltaFile(fileStates)
    }
}
