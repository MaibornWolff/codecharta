import {
	addFile,
	invertStandard,
	removeFile,
	setAll,
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

export const files = createReducer(
	[],
	on(setFiles, (_state, action) => action.value),
	on(addFile, (state, action) => [...state, { file: action, selectedAs: FileSelectionState.None }]),
	on(removeFile, (state, action) => removeFileFromState(state, action.fileName)),
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
	on(setStandardByNames, (state, action) => setStandardByNamesState(state, action.fileNames)),
	on(invertStandard, state =>
		state.map(fileState => ({
			...fileState,
			selectedAs: fileState.selectedAs === FileSelectionState.Partial ? FileSelectionState.None : FileSelectionState.Partial
		}))
	),
	on(setAll, state => state.map(fileState => ({ ...fileState, selectedAs: FileSelectionState.Partial })))
)

function removeFileFromState(state: FileState[], fileName: string) {
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

function setDeltaState(state: FileState[], reference: CCFile, comparison?: CCFile) {
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

function setDeltaReferenceState(state: FileState[], reference: CCFile) {
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

function setDeltaComparisonState(state: FileState[], comparison: CCFile) {
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

function switchReferenceAndComparisonState(state: FileState[]) {
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
