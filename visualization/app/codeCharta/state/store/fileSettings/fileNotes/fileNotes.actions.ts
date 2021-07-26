import { FileNote } from "./fileNotes.service"
import { CCAction } from "../../../../codeCharta.model"

export enum FileNotesActions {
	SET_FILE_NOTES = "SET_FILE_NOTES",
	ADD_FILE_NOTE = "ADD_FILE_NOTE",
	REMOVE_FILE_NOTE = "REMOVE_FILE_NOTE",
	ADD_NOTES_TO_FILE_NOTES = "ADD_NOTES_TO_FILE_NOTES",
	REMOVE_NOTE_BY_INDEX = "REMOVE_NOTE_BY_INDEX",
	UPDATE_NOTE_BY_INDEX = "UPDATE_NOTE_BY_INDEX"
}

export interface SetFileNotesAction extends CCAction {
	type: FileNotesActions.SET_FILE_NOTES
	payload: FileNote[]
}

export interface AddFileNoteAction extends CCAction {
	type: FileNotesActions.ADD_FILE_NOTE
	payload: FileNote
}

export interface RemoveFileNoteAction extends CCAction {
	type: FileNotesActions.REMOVE_FILE_NOTE
	payload: FileNote
}

export interface AddNotesToFileNotesAction extends CCAction {
	type: FileNotesActions.ADD_NOTES_TO_FILE_NOTES
	payload: FileNote
}

export interface RemoveNoteByIndexAction extends CCAction {
	type: FileNotesActions.REMOVE_NOTE_BY_INDEX
	payload: { fileName: string; nodePath: string; index: number }
}

export interface UpdateNoteByIndexAction extends CCAction {
	type: FileNotesActions.UPDATE_NOTE_BY_INDEX
	payload: { fileName: string; nodePath: string; index: number; text: string }
}

export type FileNotesAction =
	| SetFileNotesAction
	| AddFileNoteAction
	| RemoveFileNoteAction
	| AddNotesToFileNotesAction
	| RemoveNoteByIndexAction
	| UpdateNoteByIndexAction

export function setFileNotes(fileNotes: FileNote[] = defaultFileNotes): SetFileNotesAction {
	return {
		type: FileNotesActions.SET_FILE_NOTES,
		payload: fileNotes
	}
}

export function addFileNote(fileNote: FileNote): AddFileNoteAction {
	return {
		type: FileNotesActions.ADD_FILE_NOTE,
		payload: fileNote
	}
}

export function addNotesToFileNotes(fileNote: FileNote): AddNotesToFileNotesAction {
	return {
		type: FileNotesActions.ADD_NOTES_TO_FILE_NOTES,
		payload: fileNote
	}
}

export function removeFileNote(fileNote: FileNote): RemoveFileNoteAction {
	return {
		type: FileNotesActions.REMOVE_FILE_NOTE,
		payload: fileNote
	}
}

export function removeNoteByIndex(fileName: string, nodePath: string, index: number): RemoveNoteByIndexAction {
	return {
		type: FileNotesActions.REMOVE_NOTE_BY_INDEX,
		payload: { fileName, nodePath, index }
	}
}

export function updateNoteByIndex(fileName: string, nodePath: string, index: number, text: string) {
	return {
		type: FileNotesActions.UPDATE_NOTE_BY_INDEX,
		payload: { fileName, nodePath, index, text }
	}
}

export const defaultFileNotes: FileNote[] = []
