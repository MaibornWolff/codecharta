import { FileSelectionState, FileState } from "../../../model/files/files"
import { createSelectorFactory, defaultMemoize } from "@ngrx/store"
import { filesSelector } from "../../store/files/files.selector"
import { getVisibleFileStates, isDeltaState } from "../../../model/files/files.helper"
import { compareContentIgnoringOrder } from "../../../util/arrayHelper"

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
