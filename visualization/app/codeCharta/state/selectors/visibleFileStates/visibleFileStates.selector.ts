import { FileSelectionState, FileState } from "../../../model/files/files"
import { createSelectorFactory, defaultMemoize } from "@ngrx/store"
import { filesSelector } from "../../store/files/files.selector"
import { getVisibleFileStates } from "../../../model/files/files.helper"

function removeMatch(array: string[], target: string): string[] {
    const matchIndex = array.indexOf(target)
    return [...array.slice(0, matchIndex), ...array.slice(matchIndex + 1)]
}

export function _onlyVisibleFilesMatterComparer(fileStates1: FileState[], fileStates2: FileState[]): boolean {
    if (fileStates1 === fileStates2) {
        return true
    }
    if (fileStates1.length === 0 && fileStates2.length === 0) {
        return true
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

    return visibleFileStates1.reduce((previousCallResult: boolean, arrayMember: string) => {
        if (previousCallResult === false) {
            return false
        }
        if (visibleFileStates2.includes(arrayMember)) {
            visibleFileStates2 = removeMatch(visibleFileStates2, arrayMember)
            return true
        }
        return false
    }, true)
}

export const visibleFileStatesSelector = createSelectorFactory(projection =>
    defaultMemoize(projection, _onlyVisibleFilesMatterComparer, _onlyVisibleFilesMatterComparer)
)(filesSelector, getVisibleFileStates)
