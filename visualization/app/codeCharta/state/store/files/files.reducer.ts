import { FilesAction, FilesSelectionActions, NewFilesImportedActions, setFiles } from "./files.actions"
import { CCFile } from "../../../codeCharta.model"
import { FileSelectionState, FileState } from "../../../model/files/files"
import { isEqual } from "../../../model/files/files.helper"

export default function files(state = setFiles().payload, action: FilesAction) {
	switch (action.type) {
		case FilesSelectionActions.SET_FILES:
			return action.payload
		case NewFilesImportedActions.ADD_FILE:
			return [...state, { file: action.payload, selectedAs: FileSelectionState.None }]
		case NewFilesImportedActions.REMOVE_FILE:
			return removeFile(state, action.payload)
		case FilesSelectionActions.SET_DELTA:
			return setDelta(state, action.payload.referenceFile, action.payload.comparisonFile)
		case FilesSelectionActions.SET_DELTA_REFERENCE:
			return setDeltaReference(state, action.payload)
		case FilesSelectionActions.SET_DELTA_COMPARISON:
			return setDeltaComparison(state, action.payload)
		case FilesSelectionActions.SWITCH_REFERENCE_AND_COMPARISON:
			return switchReferenceAndComparison(state)
		case FilesSelectionActions.SET_STANDARD:
			return setStandardByNames(
				state,
				action.payload.map(x => x.fileMeta.fileName)
			)
		case FilesSelectionActions.SET_STANDARD_BY_NAMES:
			return setStandardByNames(state, action.payload)
		case FilesSelectionActions.INVERT_STANDARD:
			return state.map(fileState => ({
				...fileState,
				selectedAs: fileState.selectedAs === FileSelectionState.Partial ? FileSelectionState.None : FileSelectionState.Partial
			}))
		case FilesSelectionActions.SET_ALL:
			return state.map(fileState => ({ ...fileState, selectedAs: FileSelectionState.Partial }))
		default:
			return state
	}
}

function removeFile(state: FileState[], fileName: string) {
	const newState = state.filter(fileState => fileState.file.fileMeta.fileName !== fileName)
	const isAnyFileSelected = newState.some(fileState => fileState.selectedAs === FileSelectionState.Partial)
	if (!isAnyFileSelected) {
		newState[0] = {
			...newState[0],
			selectedAs: FileSelectionState.Partial
		}
	}
	return newState
}

function setDelta(state: FileState[], reference: CCFile, comparison?: CCFile) {
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

function setDeltaReference(state: FileState[], reference: CCFile) {
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

function setDeltaComparison(state: FileState[], comparison: CCFile) {
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

function switchReferenceAndComparison(state: FileState[]) {
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

function setStandardByNames(state: FileState[], partialFileNames: string[]): FileState[] {
	return state.map(fileState => ({
		...fileState,
		selectedAs: partialFileNames.includes(fileState.file.fileMeta.fileName) ? FileSelectionState.Partial : FileSelectionState.None
	}))
}
