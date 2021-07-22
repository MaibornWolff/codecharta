import { FileNotesAction, FileNotesActions, setFileNotes } from "./fileNotes.actions"

export function fileNotes(state = setFileNotes().payload, action: FileNotesAction) {
	switch (action.type) {
		case FileNotesActions.SET_FILE_NOTES:
			return action.payload
		default:
			return state
	}
}
