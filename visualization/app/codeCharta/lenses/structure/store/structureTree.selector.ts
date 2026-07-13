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

export const structureTreeSelector = createSelector(visibleFileStatesSelector, fileStates =>
    _getUndecoratedAccumulatedData(clone(fileStates))
)
