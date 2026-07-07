import { createSelector } from "@ngrx/store"
import { CCFile } from "../../../model/codeCharta.model"
import { FileState } from "../../../model/files/files"
import { isDeltaState, isPartialState } from "../../../model/files/files.helper"
import { AggregationGenerator } from "../../../util/aggregationGenerator"
import { getDeltaFile } from "../../../util/getDeltaFile"
import { clone } from "../../../util/clone"
import { visibleFileStatesSelector } from "../../../stores/fileStore/store/visibleFileStates.selector"

/**
 * The structure lens's undecorated unified tree — the read-only projection of the visible cc.json
 * `files` (Slice 14d). It folds the selected file states into ONE `CCFile` (aggregation for a
 * multi-file selection, delta for a comparison, the single file otherwise) WITHOUT any metric
 * decoration, blacklist classification, id assignment or aggregation. Those are VIEW-STATE-dependent
 * composing concerns owned by `accumulatedData` above the lenses — the structure lens reads no view
 * state (only the fileStore selection), which is what lets it live under `lenses/` (lens-no-view-state).
 *
 * `accumulatedData` reads this via `structure.facade`, clones it and decorates the clone — the clone is
 * mandatory: this selector is memoized, so the same tree instance is handed to every recompute and must
 * never be mutated in place.
 */
export const _getUndecoratedAccumulatedData = (fileStates: FileState[]): CCFile | undefined => {
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

export const structureTreeSelector = createSelector(visibleFileStatesSelector, fileStates =>
    _getUndecoratedAccumulatedData(clone(fileStates))
)
