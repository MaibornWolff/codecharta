import { FileNotesAction, setFileNotes } from "./fileNotes.actions"
import { FileNote } from "./fileNotes.service"

export function splitFileNotesAction(payload: FileNote[]): FileNotesAction {
	return setFileNotes(payload)
}
