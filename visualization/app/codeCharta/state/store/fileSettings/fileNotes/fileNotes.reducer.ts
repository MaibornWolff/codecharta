import { FileNotesAction, FileNotesActions, setFileNotes } from "./fileNotes.actions"
import { addItemToArray, removeItemFromArray } from "../../../../util/reduxHelper"
import { FileNote } from "./fileNotes.service"

export function fileNotes(state = setFileNotes().payload, action: FileNotesAction) {
	switch (action.type) {
		case FileNotesActions.SET_FILE_NOTES:
			return action.payload
		case FileNotesActions.ADD_FILE_NOTE:
			return addItemToArray(state, action.payload)
		case FileNotesActions.REMOVE_FILE_NOTE:
			return removeItemFromArray(state, action.payload)
		case FileNotesActions.ADD_NOTES_TO_FILE_NOTES:
			return addNotesToFileNotes(state, action.payload)
		case FileNotesActions.REMOVE_NOTE_BY_INDEX:
			return removeNoteByIndex(state, action.payload)
		default:
			return state
	}

	function addNotesToFileNotes(state: FileNote[], newFileNote: FileNote) {
		const fileNoteIndex = state.findIndex(fileNote => fileNote.fileName === newFileNote.fileName)
		state[fileNoteIndex].notes = [...state[fileNoteIndex].notes, ...newFileNote.notes]
		return state
	}

	function removeNoteByIndex(state: FileNote[], payload) {
		const fileNoteIndex = state.findIndex(fileNote => fileNote.fileName === payload.fileName)
		state[fileNoteIndex].notes = state[fileNoteIndex].notes.filter(note => note.nodePath === payload.nodePath).splice(payload.index)
		return state
	}
}
