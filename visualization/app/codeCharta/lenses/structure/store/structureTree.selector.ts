import { createSelector } from "@ngrx/store"
import { CCFile } from "../../../model/codeCharta.model"
import { FileState } from "../../../model/files/files"
import { isDeltaState, isPartialState } from "../../../model/files/files.helper"
import { visibleFileStatesSelector } from "../../../stores/fileStore/fileStore.facade"
import { AggregationGenerator } from "../../../util/aggregationGenerator"
import { clone } from "../../../util/clone"
import { getDeltaFile } from "../../../util/getDeltaFile"

// The clone is mandatory: this selector is memoized, so the same tree instance is handed to every recompute and must never be mutated in place.
export const _getUndecoratedAccumulatedData = (fileStates: FileState[]): CCFile | undefined => {
    if (isPartialState(fileStates)) {
        return AggregationGenerator.calculateAggregationFile(fileStates)
    }
    if (!isDeltaState(fileStates)) {
        return undefined
    }

    const [reference, comparison] = fileStates
    if (comparison && reference.file.map.name !== comparison.file.map.name) {
        return AggregationGenerator.calculateAggregationFile(fileStates)
    }
    return getDeltaFile(fileStates)
}

// The domain word bank is no part of the structure — nothing downstream of this selector reads it, and
// the aggregation and delta generators emit an empty one anyway. It is dropped before the deep clone
// rather than after, so neither this clone nor the ones further down the chain ever copy it: a bank can
// hold millions of entries and dominates every recompute it rides through.
const withoutDomainWords = (fileState: FileState): FileState => ({
    ...fileState,
    file: {
        ...fileState.file,
        settings: {
            ...fileState.file.settings,
            fileSettings: { ...fileState.file.settings.fileSettings, domainWords: {} }
        }
    }
})

export const structureTreeSelector = createSelector(visibleFileStatesSelector, fileStates =>
    _getUndecoratedAccumulatedData(clone(fileStates.map(withoutDomainWords)))
)
