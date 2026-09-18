import { createSelector } from "@ngrx/store"
import { CCFile } from "../../../model/codeCharta.model"
import { FileState } from "../../../model/files/files"
import { isDeltaState, isPartialState } from "../../../model/files/files.helper"
import { visibleFileStatesSelector } from "../../../stores/fileStore/fileStore.facade"
import { AggregationGenerator } from "../../../util/aggregationGenerator"
import { clone } from "../../../util/clone"
import { getDeltaFile } from "../../../util/getDeltaFile"

/**
 * Copies are made where they are needed rather than up front, because each one duplicates every node of
 * every loaded map — on a large project that is hundreds of megabytes per copy, and this selector is
 * memoized, so what it returns is handed to every recompute and must never be mutated in place.
 *
 * `AggregationGenerator` already copies what it is given, so the aggregation paths need nothing. The
 * delta path does: `DeltaGenerator` writes deltas, file counts and zeroed attributes straight into the
 * nodes it walks, and those would be the store's own.
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

// The domain word bank is no part of the structure: nothing downstream of this selector reads it. It is
// dropped before the deep clone rather than after, so neither this clone nor the ones further down the
// chain ever copy it — a bank can hold millions of entries and dominates every recompute it rides through.
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
