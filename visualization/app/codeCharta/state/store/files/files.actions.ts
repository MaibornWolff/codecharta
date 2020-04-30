import { CCAction, CCFile, FileState } from "../../../codeCharta.model"

export enum FilesSelectionActions {
	SET_SINGLE = "SET_SINGLE",
	SET_SINGLE_BY_NAME = "SET_SINGLE_BY_NAME",
	SET_MULTIPLE = "SET_MULTIPLE",
	SET_MULTIPLE_BY_NAMES = "SET_MULTIPLE_BY_NAMES",
	SET_DELTA = "SET_DELTA",
	SET_DELTA_BY_NAMES = "SET_DELTA_BY_NAMES",
	RESET_SELECTION = "RESET_SELECTION"
}

export enum NewFilesImportedActions {
	SET_FILES = "SET_FILES",
	ADD_FILE = "ADD_FILE",
	RESET_FILES = "RESET_FILES"
}

export interface SetFilesAction extends CCAction {
	type: NewFilesImportedActions.SET_FILES
	payload: FileState[]
}

export interface AddFileAction extends CCAction {
	type: NewFilesImportedActions.ADD_FILE
	payload: CCFile
}

export interface ResetFilesAction extends CCAction {
	type: NewFilesImportedActions.RESET_FILES
}

export interface SetSingleAction extends CCAction {
	type: FilesSelectionActions.SET_SINGLE
	payload: CCFile
}

export interface SetSingleByNameAction extends CCAction {
	type: FilesSelectionActions.SET_SINGLE_BY_NAME
	payload: string
}

export interface SetMultipleAction extends CCAction {
	type: FilesSelectionActions.SET_MULTIPLE
	payload: CCFile[]
}

export interface SetMultipleByNamesAction extends CCAction {
	type: FilesSelectionActions.SET_MULTIPLE_BY_NAMES
	payload: string[]
}

export interface SetDeltaAction extends CCAction {
	type: FilesSelectionActions.SET_DELTA
	payload: { referenceFile: CCFile; comparisonFile: CCFile }
}

export interface SetDeltaByNamesAction extends CCAction {
	type: FilesSelectionActions.SET_DELTA_BY_NAMES
	payload: { referenceFileName: string; comparisonFileName: string }
}

export interface ResetSelectionAction extends CCAction {
	type: FilesSelectionActions.RESET_SELECTION
}

export type FilesAction =
	| SetFilesAction
	| ResetFilesAction
	| ResetSelectionAction
	| AddFileAction
	| SetSingleAction
	| SetSingleByNameAction
	| SetMultipleAction
	| SetMultipleByNamesAction
	| SetDeltaAction
	| SetDeltaByNamesAction

export function setFiles(files: FileState[] = defaultFiles): SetFilesAction {
	return {
		type: NewFilesImportedActions.SET_FILES,
		payload: files
	}
}

export function resetFiles(): ResetFilesAction {
	return {
		type: NewFilesImportedActions.RESET_FILES
	}
}

export function resetSelection(): ResetSelectionAction {
	return {
		type: FilesSelectionActions.RESET_SELECTION
	}
}

export function addFile(file: CCFile): AddFileAction {
	return {
		type: NewFilesImportedActions.ADD_FILE,
		payload: file
	}
}

export function setSingle(file: CCFile): SetSingleAction {
	return {
		type: FilesSelectionActions.SET_SINGLE,
		payload: file
	}
}

export function setSingleByName(name: string): SetSingleByNameAction {
	return {
		type: FilesSelectionActions.SET_SINGLE_BY_NAME,
		payload: name
	}
}

export function setMultiple(files: CCFile[]): SetMultipleAction {
	return {
		type: FilesSelectionActions.SET_MULTIPLE,
		payload: files
	}
}

export function setMultipleByNames(fileNames: string[]): SetMultipleByNamesAction {
	return {
		type: FilesSelectionActions.SET_MULTIPLE_BY_NAMES,
		payload: fileNames
	}
}

export function setDelta(referenceFile: CCFile, comparisonFile: CCFile): SetDeltaAction {
	return {
		type: FilesSelectionActions.SET_DELTA,
		payload: { referenceFile, comparisonFile }
	}
}

export function setDeltaByNames(referenceFileName: string, comparisonFileName: string): SetDeltaByNamesAction {
	return {
		type: FilesSelectionActions.SET_DELTA_BY_NAMES,
		payload: { referenceFileName, comparisonFileName }
	}
}

export const defaultFiles: FileState[] = []
