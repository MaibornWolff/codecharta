import { FileNotesAction, setFileNotes } from "./fileNotes.actions"
import { FileNote } from "../../../../ui/attributeSideBar/attributeSideBar.component"

export function splitFileNotesAction(payload: FileNote[]): FileNotesAction {
	return setFileNotes(payload)
}
