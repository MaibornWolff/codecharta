import { FileNote } from "../ui/attributeSideBar/attributeSideBar.component"

export class NotesHelper {
	// private static readonly NOTES_LOCAL_STORAGE_VERSION = "1.0.0"
	private static readonly NOTES_LOCAL_STORAGE_ELEMENT = "notes"

	static getNotesFromLocalStorage(key: string) {
		const fileNotes: FileNote[] = JSON.parse(localStorage.getItem(this.NOTES_LOCAL_STORAGE_ELEMENT))
		return fileNotes.filter(file => file.path === key)
	}

	static updateNote(index: number, payload: FileNote) {
		const fileNotes: FileNote[] = JSON.parse?.(localStorage.getItem(this.NOTES_LOCAL_STORAGE_ELEMENT))
		const fileNote = fileNotes.filter(fileNote => fileNote.path === payload.path)?.[index]
		fileNote.text = payload.text
		localStorage.setItem(this.NOTES_LOCAL_STORAGE_ELEMENT, JSON.stringify(fileNotes))
	}

	static addNewNote(payload: FileNote) {
		const fileNotes: FileNote[] = JSON.parse?.(localStorage.getItem(this.NOTES_LOCAL_STORAGE_ELEMENT)) || []
		fileNotes.push(payload)
		localStorage.setItem(this.NOTES_LOCAL_STORAGE_ELEMENT, JSON.stringify(fileNotes))
	}

	static noteExists(path: string, index: number): boolean {
		const fileNotes: FileNote[] = JSON.parse(localStorage.getItem(this.NOTES_LOCAL_STORAGE_ELEMENT))
		return fileNotes?.filter(file => file.path === path)?.[index] !== undefined
	}
}
