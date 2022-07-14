import { FilesAction, FilesSelectionActions, NewFilesImportedActions, setFiles } from "./files.actions"
import { CCFile } from "../../../codeCharta.model"
import { FileSelectionState, FileState } from "../../../model/files/files"
import { isEqual } from "../../../model/files/files.helper"

export default function files(state = setFiles().payload, action: FilesAction) {
	switch (action.type) {
		case NewFilesImportedActions.SET_FILES:
			return action.payload
		case NewFilesImportedActions.ADD_FILE:
			return addFile(state, action.payload)
		case NewFilesImportedActions.REMOVE_FILE:
			return removeFile(state, action.payload)
		case FilesSelectionActions.SET_DELTA:
			return setDelta(state, action.payload.referenceFile, action.payload.comparisonFile)
		case FilesSelectionActions.SET_DELTA_REFERENCE:
			return setDeltaReference(state, action.payload)
		case FilesSelectionActions.SET_DELTA_COMPARISON:
			return setDeltaComparison(state, action.payload)
		case FilesSelectionActions.SET_STANDARD:
			return setStandard(state, action.payload)
		case FilesSelectionActions.SET_STANDARD_BY_NAMES:
			return setStandardByNames(state, action.payload)
		case FilesSelectionActions.INVERT_STANDARD:
			return invertStandard(state)
		default:
			return state
	}
}

function addFile(state: FileState[], file: CCFile) {
	return [...state, { file, selectedAs: FileSelectionState.None }]
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

function setStandardByNames(state: FileState[], partialFileNames: string[]): FileState[] {
	return state.map(x => {
		let selectedAs = FileSelectionState.None
		if (partialFileNames.includes(x.file.fileMeta.fileName)) {
			selectedAs = FileSelectionState.Partial
		}
		return { ...x, selectedAs }
	})
}

function setStandard(state: FileState[], multipleFiles: CCFile[]) {
	return setStandardByNames(
		state,
		multipleFiles.map(x => x.fileMeta.fileName)
	)
}

function invertStandard(state: FileState[]) {
	return state.map(fileState => ({
		...fileState,
		selectedAs: fileState.selectedAs === FileSelectionState.Partial ? FileSelectionState.None : FileSelectionState.Partial
	}))
}
