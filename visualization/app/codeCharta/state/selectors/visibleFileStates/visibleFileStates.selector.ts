import {FileSelectionState, FileState} from "../../../model/files/files"
import {createSelectorFactory, defaultMemoize} from "@ngrx/store"
import {filesSelector} from "../../store/files/files.selector"
import {getVisibleFileStates, isDeltaState} from "../../../model/files/files.helper"

function removeMatch(array: string[], target: string): string[] {
    const matchIndex = array.indexOf(target)
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

    const visibleFileStates1 = fileStates1
        .filter(file => file.selectedAs !== FileSelectionState.None)
        .map(file => file.file.fileMeta.fileName)
    let visibleFileStates2 = fileStates2
        .filter(file => file.selectedAs !== FileSelectionState.None)
        .map(file => file.file.fileMeta.fileName)

    if (visibleFileStates1.length !== visibleFileStates2.length) {
        return false
    }

    function reduceToDetermineIfArraysContainSameContents(previousCallResult: boolean, arrayMember: any): boolean {
        if (previousCallResult === false) {
            return false
        }

        if (visibleFileStates2.includes(arrayMember)) {
            visibleFileStates2 = removeMatch(visibleFileStates2, arrayMember)
            return true
        }

        return false
    }

    return visibleFileStates1.reduce(reduceToDetermineIfArraysContainSameContents, true)
}

export const visibleFileStatesSelector = createSelectorFactory(projection =>
    defaultMemoize(projection, onlyVisibleFilesMatterComparer, onlyVisibleFilesMatterComparer)
)(filesSelector, getVisibleFileStates)
