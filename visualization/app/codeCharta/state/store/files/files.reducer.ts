import {
    addFile,
    removeFiles,
    setDelta,
    setDeltaComparison,
    setDeltaReference,
    setFiles,
    setStandard,
    setStandardByNames,
    switchReferenceAndComparison
} from "./files.actions"
import { CCFile } from "../../../codeCharta.model"
import { FileSelectionState, FileState } from "../../../model/files/files"
import { isEqual } from "../../../model/files/files.helper"
import { createReducer, on } from "@ngrx/store"

export const defaultFiles: FileState[] = []
export const files = createReducer(
    defaultFiles,
    on(setFiles, (state, action) => setFileStatesState(state, action.value)),
    on(addFile, (state, action) => insertIntoSortedState(state, action.file)),
    on(removeFiles, (state, action) => removeFilesFromState(state, action.fileNames)),
    on(setDelta, (state, action) => setDeltaState(state, action.referenceFile, action.comparisonFile)),
    on(setDeltaReference, (state, action) => setDeltaReferenceState(state, action.file)),
    on(setDeltaComparison, (state, action) => setDeltaComparisonState(state, action.file)),
    on(switchReferenceAndComparison, state => switchReferenceAndComparisonState(state)),
    on(setStandard, (state, action) =>
        setStandardByNamesState(
            state,
            action.files.map(x => x.fileMeta.fileName)
        )
    ),
    on(setStandardByNames, (state, action) => setStandardByNamesState(state, action.fileNames))
)

function setFileStatesState(_: FileState[], fileStates: FileState[]): FileState[] {
    if (fileStates === undefined) {
        return defaultFiles
    }
    return [...fileStates].sort((fileStateA, fileStateB) => (greaterEqualThan(fileStateA.file, fileStateB.file) ? 1 : -1))
}

function insertIntoSortedState(state: FileState[], file: CCFile) {
    const index = state.findIndex(fileState => greaterEqualThan(fileState.file, file))
    const fileState = { file, selectedAs: FileSelectionState.None }
    if (index === -1) {
        return [...state, fileState]
    }
    return [...state.slice(0, index), fileState, ...state.slice(index)]
}

function greaterEqualThan(fileA: CCFile, fileB: CCFile): boolean {
    if (fileA.fileMeta.fileName > fileB.fileMeta.fileName) {
        return true
    }
    if (fileA.fileMeta.fileName < fileB.fileMeta.fileName) {
        return false
    }
    return fileA.fileMeta.fileChecksum >= fileB.fileMeta.fileChecksum
}

function removeFilesFromState(state: FileState[], fileNames: string[]): FileState[] {
    if (fileNames.length === 0) {
        return state
    }
    const newState = state.filter(fileState => !fileNames.includes(fileState.file.fileMeta.fileName))
    const isAnyFileSelected = newState.some(fileState => fileState.selectedAs === FileSelectionState.Partial)
    if (!isAnyFileSelected) {
        newState[0] = {
            ...newState[0],
            selectedAs: FileSelectionState.Partial
        }
    }
    return newState
}

function setDeltaState(state: FileState[], reference: CCFile, comparison?: CCFile): FileState[] {
    return state.map(file => {
        if (isEqual(file.file, reference)) {
            return { ...file, selectedAs: FileSelectionState.Reference }
        }
        if (comparison && isEqual(file.file, comparison)) {
            return { ...file, selectedAs: FileSelectionState.Comparison }
        }
        return { ...file, selectedAs: FileSelectionState.None }
    })
}

function setDeltaReferenceState(state: FileState[], reference: CCFile): FileState[] {
    return state.map(file => {
        if (isEqual(file.file, reference)) {
            return { ...file, selectedAs: FileSelectionState.Reference }
        }
        if (file.selectedAs === FileSelectionState.Comparison) {
            return file
        }
        return { ...file, selectedAs: FileSelectionState.None }
    })
}

function setDeltaComparisonState(state: FileState[], comparison: CCFile): FileState[] {
    return state.map(file => {
        if (file.file === comparison) {
            return { ...file, selectedAs: FileSelectionState.Comparison }
        }
        if (file.selectedAs === FileSelectionState.Reference) {
            return file
        }
        return { ...file, selectedAs: FileSelectionState.None }
    })
}

function switchReferenceAndComparisonState(state: FileState[]): FileState[] {
    return state.map(file => {
        if (file.selectedAs === FileSelectionState.Reference) {
            return { ...file, selectedAs: FileSelectionState.Comparison }
        }
        if (file.selectedAs === FileSelectionState.Comparison) {
            return { ...file, selectedAs: FileSelectionState.Reference }
        }
        return file
    })
}

function setStandardByNamesState(state: FileState[], partialFileNames: string[]): FileState[] {
    return state.map(fileState => ({
        ...fileState,
        selectedAs: partialFileNames.includes(fileState.file.fileMeta.fileName) ? FileSelectionState.Partial : FileSelectionState.None
    }))
}
