import { createSelector } from "@ngrx/store"
import { CCFile } from "../../../model/codeCharta.model"
import { FileState } from "../../../model/files/files"
import { isDeltaState, isPartialState } from "../../../model/files/files.helper"
import { visibleFileStatesSelector } from "../../../stores/fileStore/fileStore.facade"
import { AggregationGenerator } from "../../../util/aggregationGenerator"
import { clone } from "../../../util/clone"
import { getDeltaFile } from "../../../util/getDeltaFile"

/**
 * Copies are made where they are needed, not up front: each duplicates every node of every loaded map.
 * Only the delta path needs one, because `DeltaGenerator` writes into the nodes it walks — and what this
 * memoized selector returns must never be mutated.
 */
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
    return getDeltaFile(clone(fileStates))
}

// Dropped before the deep clone, not after: nothing downstream reads the bank, and it can hold millions
// of entries that every clone in the chain would otherwise copy.
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
    _getUndecoratedAccumulatedData(fileStates.map(withoutDomainWords))
)
