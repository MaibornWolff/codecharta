import { CCAction, CCFile } from "../../../codeCharta.model"
import { FileState } from "../../../model/files/files"

export enum FilesSelectionActions {
	SET_STANDARD = "SET_STANDARD",
	SET_STANDARD_BY_NAMES = "SET_STANDARD_BY_NAMES",
	INVERT_STANDARD = "INVERT_STANDARD",
	SET_ALL = "SET_ALL",
	SET_DELTA = "SET_DELTA",
	SET_DELTA_REFERENCE = "SET_DELTA_REFERENCE",
	SET_DELTA_COMPARISON = "SET_DELTA_COMPARISON",
	SWITCH_REFERENCE_AND_COMPARISON = "SWITCH_REFERENCE_AND_COMPARISON"
}

export enum NewFilesImportedActions {
	SET_FILES = "SET_FILES",
	ADD_FILE = "ADD_FILE",
	REMOVE_FILE = "REMOVE_FILE"
}

export interface SetFilesAction extends CCAction {
	type: NewFilesImportedActions.SET_FILES
	payload: FileState[]
}

export interface RemoveFileAction extends CCAction {
	type: NewFilesImportedActions.REMOVE_FILE
	payload: string
}

export interface AddFileAction extends CCAction {
	type: NewFilesImportedActions.ADD_FILE
	payload: CCFile
}

export interface SetStandardAction extends CCAction {
	type: FilesSelectionActions.SET_STANDARD
	payload: CCFile[]
}

export interface SetStandardByNamesAction extends CCAction {
	type: FilesSelectionActions.SET_STANDARD_BY_NAMES
	payload: string[]
}

export interface InvertStandardAction extends CCAction {
	type: FilesSelectionActions.INVERT_STANDARD
}

export interface SetAllAction extends CCAction {
	type: FilesSelectionActions.SET_ALL
}

export interface SetDeltaAction extends CCAction {
	type: FilesSelectionActions.SET_DELTA
	payload: { referenceFile: CCFile; comparisonFile: CCFile }
}

export interface SetDeltaReferenceAction extends CCAction {
	type: FilesSelectionActions.SET_DELTA_REFERENCE
	payload: CCFile
}

export interface SetDeltaComparisonAction extends CCAction {
	type: FilesSelectionActions.SET_DELTA_COMPARISON
	payload: CCFile
}

export interface SwitchReferenceAndComparisonAction extends CCAction {
	type: FilesSelectionActions.SWITCH_REFERENCE_AND_COMPARISON
}

export type FilesAction =
	| SetFilesAction
	| AddFileAction
	| RemoveFileAction
	| SetStandardAction
	| SetStandardByNamesAction
	| InvertStandardAction
	| SetAllAction
	| SetDeltaAction
	| SetDeltaReferenceAction
	| SetDeltaComparisonAction
	| SwitchReferenceAndComparisonAction

export function setFiles(files: FileState[] = defaultFiles): SetFilesAction {
	return {
		type: NewFilesImportedActions.SET_FILES,
		payload: files
	}
}

export function addFile(file: CCFile): AddFileAction {
	return {
		type: NewFilesImportedActions.ADD_FILE,
		payload: file
	}
}

export function removeFile(fileName: string): RemoveFileAction {
	return {
		type: NewFilesImportedActions.REMOVE_FILE,
		payload: fileName
	}
}

export function setStandard(files: CCFile[]): SetStandardAction {
	return {
		type: FilesSelectionActions.SET_STANDARD,
		payload: files
	}
}

export function setStandardByNames(fileNames: string[]): SetStandardByNamesAction {
	return {
		type: FilesSelectionActions.SET_STANDARD_BY_NAMES,
		payload: fileNames
	}
}

export function invertStandard(): InvertStandardAction {
	return {
		type: FilesSelectionActions.INVERT_STANDARD
	}
}

export function setAll(): SetAllAction {
	return {
		type: FilesSelectionActions.SET_ALL
	}
}

export function setDelta(referenceFile: CCFile, comparisonFile?: CCFile): SetDeltaAction {
	return {
		type: FilesSelectionActions.SET_DELTA,
		payload: { referenceFile, comparisonFile }
	}
}

export function setDeltaReference(file: CCFile): SetDeltaReferenceAction {
	return {
		type: FilesSelectionActions.SET_DELTA_REFERENCE,
		payload: file
	}
}

export function setDeltaComparison(file: CCFile): SetDeltaComparisonAction {
	return {
		type: FilesSelectionActions.SET_DELTA_COMPARISON,
		payload: file
	}
}

export function switchReferenceAndComparison(): SwitchReferenceAndComparisonAction {
	return {
		type: FilesSelectionActions.SWITCH_REFERENCE_AND_COMPARISON
	}
}

export const defaultFiles: FileState[] = []
