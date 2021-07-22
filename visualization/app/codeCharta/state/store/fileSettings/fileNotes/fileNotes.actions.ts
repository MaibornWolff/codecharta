import { Action } from "redux"
import { FileNote } from "./fileNotes.service"

export enum FileNotesActions {
	SET_FILE_NOTES = "SET_FILE_NOTES"
}

export interface SetFileNotesAction extends Action {
	type: FileNotesActions.SET_FILE_NOTES
	payload: FileNote[]
}

export type FileNotesAction = SetFileNotesAction

export function setFileNotes(fileNotes: FileNote[] = defaultFileNotes): SetFileNotesAction {
	return {
		type: FileNotesActions.SET_FILE_NOTES,
		payload: fileNotes
	}
}

export const defaultFileNotes: FileNote[] = []
