import { Action } from "redux"
import { Files } from "../../../model/files"
import { CCFile } from "../../../model/codeCharta.model"

export enum FilesActions {
	SET_FILES = "SET_FILES",
	RESET_FILES = "RESET_FILES",
	RESET_SELECTION = "RESET_SELECTION",
	ADD_FILE = "ADD_FILE",
	SET_SINGLE = "SET_SINGLE",
	SET_SINGLE_BY_NAME = "SET_SINGLE_BY_NAME",
	SET_MULTIPLE = "SET_MULTIPLE",
	SET_MULTIPLE_BY_NAME = "SET_MULTIPLE_BY_NAME",
	SET_DELTA = "SET_DELTA",
	SET_DELTA_BY_NAME = "SET_DELTA_BY_NAME"
}

export interface SetFilesAction extends Action {
	type: FilesActions.SET_FILES
	payload: Files
}

export interface ResetFilesAction extends Action {
	type: FilesActions.RESET_FILES
}

export interface ResetSelectionAction extends Action {
	type: FilesActions.RESET_SELECTION
}

export interface AddFileAction extends Action {
	type: FilesActions.ADD_FILE
	payload: CCFile
}

export interface SetSingleAction extends Action {
	type: FilesActions.SET_SINGLE
	payload: CCFile
}

export interface SetSingleByNameAction extends Action {
	type: FilesActions.SET_SINGLE_BY_NAME
	payload: string
}

export interface SetMultipleAction extends Action {
	type: FilesActions.SET_MULTIPLE
	payload: CCFile[]
}

export interface SetMultipleByNameAction extends Action {
	type: FilesActions.SET_MULTIPLE_BY_NAME
	payload: string[]
}

export interface SetDeltaAction extends Action {
	type: FilesActions.SET_DELTA
	payload: { referenceFile: CCFile; comparisonFile: CCFile }
}

export interface SetDeltaByNameAction extends Action {
	type: FilesActions.SET_DELTA_BY_NAME
	payload: { referenceFileName: string; comparisonFileName: string }
}

export type FilesAction =
	| SetFilesAction
	| ResetFilesAction
	| ResetSelectionAction
	| AddFileAction
	| SetSingleAction
	| SetSingleByNameAction
	| SetMultipleAction
	| SetMultipleByNameAction
	| SetDeltaAction
	| SetDeltaByNameAction

export function setFiles(files: Files = defaultFiles): SetFilesAction {
	return {
		type: FilesActions.SET_FILES,
		payload: files
	}
}

export function resetFiles(): ResetFilesAction {
	return {
		type: FilesActions.RESET_FILES
	}
}

export function resetSelection(): ResetSelectionAction {
	return {
		type: FilesActions.RESET_SELECTION
	}
}

export function addFile(file: CCFile): AddFileAction {
	return {
		type: FilesActions.ADD_FILE,
		payload: file
	}
}

export function setSingle(file: CCFile): SetSingleAction {
	return {
		type: FilesActions.SET_SINGLE,
		payload: file
	}
}

export function setSingleByName(name: string): SetSingleByNameAction {
	return {
		type: FilesActions.SET_SINGLE_BY_NAME,
		payload: name
	}
}

export function setMultiple(files: CCFile[]): SetMultipleAction {
	return {
		type: FilesActions.SET_MULTIPLE,
		payload: files
	}
}

export function setMultipleByName(fileNames: string[]): SetMultipleByNameAction {
	return {
		type: FilesActions.SET_MULTIPLE_BY_NAME,
		payload: fileNames
	}
}

export function setDelta(referenceFile: CCFile, comparisonFile: CCFile): SetDeltaAction {
	return {
		type: FilesActions.SET_DELTA,
		payload: { referenceFile, comparisonFile }
	}
}

export function setDeltaByName(referenceFileName: string, comparisonFileName: string): SetDeltaByNameAction {
	return {
		type: FilesActions.SET_DELTA_BY_NAME,
		payload: { referenceFileName, comparisonFileName }
	}
}

export const defaultFiles: Files = new Files()
