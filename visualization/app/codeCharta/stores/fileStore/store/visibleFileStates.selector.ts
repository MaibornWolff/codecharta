import { createSelector, createSelectorFactory, defaultMemoize } from "@ngrx/store"
import { FileSelectionState, FileState } from "../../../model/files/files"
import { getVisibleFileStates, isDeltaState } from "../../../model/files/files.helper"
import { compareContentIgnoringOrder } from "../../../util/arrayHelper"
import { filesSelector } from "./files.selector"

export function _onlyVisibleFilesMatterComparer(fileStates1: FileState[], fileStates2: FileState[]): boolean {
    if (fileStates1 === fileStates2) {
        return true
    }

    if (fileStates1.length === 0 && fileStates2.length === 0) {
        return true
    }

    if (isDeltaState(fileStates1) || isDeltaState(fileStates2)) {
        return compareDeltaState(fileStates1, fileStates2)
    }

    const visibleFileChecksums1 = fileStates1
        .filter(file => file.selectedAs === FileSelectionState.Partial)
        .map(file => file.file.fileMeta.fileChecksum)
    const visibleFileChecksum2 = fileStates2
        .filter(file => file.selectedAs === FileSelectionState.Partial)
        .map(file => file.file.fileMeta.fileChecksum)

    if (visibleFileChecksums1.length !== visibleFileChecksum2.length) {
        return false
    }

    return compareContentIgnoringOrder(visibleFileChecksums1, visibleFileChecksum2)
}

function compareDeltaState(fileStates1: FileState[], fileStates2: FileState[]): boolean {
    if (isDeltaState(fileStates1) !== isDeltaState(fileStates2)) {
        return false
    }

    const referenceFile1 = fileStates1.find(file => file.selectedAs === FileSelectionState.Reference)
    const referenceFile2 = fileStates2.find(file => file.selectedAs === FileSelectionState.Reference)
    if (referenceFile1.file.fileMeta.fileChecksum !== referenceFile2.file.fileMeta.fileChecksum) {
        return false
    }

    const comparisonFile1 = fileStates1.find(file => file.selectedAs === FileSelectionState.Comparison)
    const comparisonFile2 = fileStates2.find(file => file.selectedAs === FileSelectionState.Comparison)
    if (
        comparisonFile1?.file.fileMeta.fileChecksum !== comparisonFile2?.file.fileMeta.fileChecksum ||
        !comparisonFile1 !== !comparisonFile2
    ) {
        return false
    }

    return true
}

export const visibleFileStatesSelector = createSelectorFactory(projection =>
    defaultMemoize(projection, _onlyVisibleFilesMatterComparer, _onlyVisibleFilesMatterComparer)
)(filesSelector, getVisibleFileStates)

/**
 * The visible file states, re-projected whenever the file store changes — same projection as
 * `visibleFileStatesSelector`, but with honest default memoization.
 *
 * Consumers that read per-file `fileSettings` need this one. `visibleFileStatesSelector` memoizes on the
 * CHECKSUMS of the visible files alone, so it reports "nothing changed" for a file set whose entries were
 * replaced by richer objects and keeps handing out its previous projection. The IndexedDB restore is
 * exactly that case: it first commits the files re-parsed from the persisted state — `getNameDataPair`
 * round-trips through the flat 1.x export shape, which carries edges, blacklist and marked packages but
 * has no slot for the domain lens, so `domainWords` comes back empty — and only then dispatches the
 * persisted file states, which do carry the words, under the very same checksums. The store therefore
 * ends up correct while a checksum-memoized projection stays stuck on the domain-less parse.
 */
export const visibleFileStatesWithCurrentSettingsSelector = createSelector(filesSelector, getVisibleFileStates)
