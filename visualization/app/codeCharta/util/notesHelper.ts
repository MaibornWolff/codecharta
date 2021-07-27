import { FileNote, Note } from "../state/store/fileSettings/fileNotes/fileNotes.service"
import angular from "angular"

export class NotesHelper {
	private static readonly NOTES_LOCAL_STORAGE_VERSION = "1.0.0"
	private static readonly NOTES_LOCAL_STORAGE_ELEMENT = "notes"

	static deleteNotesFromLocalStorage() {
		this.saveFileNotesToLocalStorage([])
	}

	static getFileNotesFromLocalStorage(): FileNote[] {
		return JSON.parse(localStorage.getItem(this.NOTES_LOCAL_STORAGE_ELEMENT))[this.NOTES_LOCAL_STORAGE_ELEMENT]
	}

	static saveFileNotesToLocalStorage(fileNotes: FileNote[]) {
		localStorage.setItem(
			this.NOTES_LOCAL_STORAGE_ELEMENT,
			angular.toJson({ version: this.NOTES_LOCAL_STORAGE_VERSION, notes: fileNotes })
		)
	}

	static getFileNotesOf(fileName: string): FileNote[] {
		const fileNotes = this.getFileNotesFromLocalStorage()
		const fileNote: FileNote = fileNotes?.find(fileNote => fileNote.fileName === fileName)
		return fileNote ? [fileNote] : []
	}

	static getNotesOf(fileName: string): Note[] {
		const fileNotes = this.getFileNotesFromLocalStorage()
		const fileNote: FileNote = fileNotes?.find(fileNote => fileNote.fileName === fileName)
		return fileNote?.notes?.length > 0 ? fileNote.notes : []
	}
}
