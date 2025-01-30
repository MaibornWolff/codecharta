import { FileSelectionState, FileState } from "../../../model/files/files"
import { createSelectorFactory, defaultMemoize } from "@ngrx/store"
import { filesSelector } from "../../store/files/files.selector"
import { getVisibleFileStates, isDeltaState } from "../../../model/files/files.helper"

function removeMatch<T>(array: T[], matchIndex: number): T[] {
    return [...array.slice(0, matchIndex), ...array.slice(matchIndex + 1)]
}

export function onlyVisibleFilesMatterComparer(fileStates1: FileState[], fileStates2: FileState[]): boolean {
    if (fileStates1 === fileStates2) {
        return true
    }

    if (fileStates1.length === 0 && fileStates2.length === 0) {
        return true
    }

    if (isDeltaState(fileStates1) !== isDeltaState(fileStates2)) {
        return false
    }

    if (isDeltaState(fileStates1) || isDeltaState(fileStates2)) {
        const referenceFile1 = fileStates1.find(file => file.selectedAs === FileSelectionState.Reference)
        const referenceFile2 = fileStates2.find(file => file.selectedAs === FileSelectionState.Reference)
        console.log(referenceFile1, referenceFile2)
        if (referenceFile1.file.fileMeta.fileChecksum !== referenceFile2.file.fileMeta.fileChecksum) {
            return false
        }

        const comparisonFile1 = fileStates1.find(file => file.selectedAs === FileSelectionState.Comparison)
        const comparisonFile2 = fileStates2.find(file => file.selectedAs === FileSelectionState.Comparison)
        console.log(comparisonFile1, comparisonFile2)
        if (comparisonFile1.file.fileMeta.fileChecksum !== comparisonFile2.file.fileMeta.fileChecksum) {
            return false
        }
        return true
    }

    const visibleFileStates1 = fileStates1
        .filter(file => file.selectedAs === FileSelectionState.Partial)
        .map(file => file.file.fileMeta.fileChecksum)
    let visibleFileStates2 = fileStates2
        .filter(file => file.selectedAs === FileSelectionState.Partial)
        .map(file => file.file.fileMeta.fileChecksum)

    if (visibleFileStates1.length !== visibleFileStates2.length) {
        return false
    }

    function reduceToDetermineIfArraysContainSameContents(previousCallResult: boolean, arrayMember: any): boolean {
        if (previousCallResult === false) {
            return false
        }

        const matchIndex = visibleFileStates2.indexOf(arrayMember)
        if (matchIndex >= 0) {
            visibleFileStates2 = removeMatch(visibleFileStates2, matchIndex)
            return true
        }

        return false
    }

    return visibleFileStates1.reduce(reduceToDetermineIfArraysContainSameContents, true)
}

export const visibleFileStatesSelector = createSelectorFactory(projection =>
    defaultMemoize(projection, onlyVisibleFilesMatterComparer, onlyVisibleFilesMatterComparer)
)(filesSelector, getVisibleFileStates)
