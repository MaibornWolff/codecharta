import { FileNote, Note } from "../state/store/fileSettings/fileNotes/fileNotes.service"

export class NotesHelper {
	// private static readonly NOTES_LOCAL_STORAGE_VERSION = "1.0.0"
	private static readonly NOTES_LOCAL_STORAGE_ELEMENT = "notes"

	static getNotesFromLocalStorage(fileName: string, nodePath: string) {
		const fileNotes: FileNote[] = this.getFileNotesFromLocalStorage()
		const fileNotesIndex = fileNotes?.findIndex(fileNote => fileNote.fileName === fileName)
		return fileNotesIndex !== -1 ? fileNotes?.[fileNotesIndex].notes.filter(note => note.nodePath === nodePath) : []
	}

	static updateNote(fileName: string, nodePath: string, index: number, newText: string) {
		const fileNotes = this.getFileNotesFromLocalStorage()
		const fileNote = this.getFileNote(fileName, fileNotes)
		const note = fileNote.notes.filter(note => note.nodePath === nodePath)?.[index]
		note.text = newText

		this.saveFileNotesToLocalStorage(fileNotes)
	}

	static addNewNote(fileName: string, note) {
		let fileNotes: FileNote[] = this.getFileNotesFromLocalStorage()
		if (fileNotes === null) {
			fileNotes = this.createNewFileNotes(note, fileName)
		}
		this.addFileNote(fileNotes, fileName, note)
		this.saveFileNotesToLocalStorage(fileNotes)
	}

	private static addFileNote(fileNotes: FileNote[], fileName: string, note) {
		const index = fileNotes?.findIndex(fileNote => fileNote.fileName === fileName)
		if (index !== -1) {
			fileNotes?.[index].notes.push(note)
		} else {
			const fileNote: FileNote = { fileName, notes: [note] }
			fileNotes.push(fileNote)
		}
	}

	private static createNewFileNotes(note, fileName: string) {
		return [{ fileName, notes: [note] }]
	}

	static noteExists(fileName: string, nodePath: string, index: number): boolean {
		const notes = this.getNotesOf(fileName)
		return notes?.filter(note => note.nodePath === nodePath)?.[index] !== undefined
	}

	private static getNotesOf(fileName: string) {
		const fileNotes: FileNote[] = this.getFileNotesFromLocalStorage()
		const fileNoteIndex = this.getFileNoteIndex(fileNotes, fileName)
		return fileNotes?.[fileNoteIndex]?.notes
	}

	static deleteNote(fileName, nodePath, noteIndex) {
		const fileNotes: FileNote[] = this.getFileNotesFromLocalStorage()
		const fileNote = this.getFileNote(fileName, fileNotes)
		const notes = fileNote?.notes

		let counter = -1
		for (let index = 0; index < notes?.length; index++) {
			if (notes?.[index]?.nodePath === nodePath) {
				counter = counter + 1
				if (counter === noteIndex) {
					notes.splice(index, 1)
					break
				}
			}
		}

		this.saveFileNotesToLocalStorage(fileNotes)
	}

	static deleteNotesFromLocalStorage() {
		return localStorage.setItem(this.NOTES_LOCAL_STORAGE_ELEMENT, JSON.stringify([]))
	}

	static getFileNotesFromLocalStorage() {
		return JSON.parse(localStorage.getItem(this.NOTES_LOCAL_STORAGE_ELEMENT))
	}

	static getNotesFromFileName(fileName: string): Note[] {
		const fileNotes = this.getFileNotesFromLocalStorage()
		const fileNote: FileNote = fileNotes?.find(fileNote => fileNote.fileName === fileName)
		return fileNote?.notes?.length > 0 ? fileNote.notes : []
	}

	static getFileNotesFromFileName(fileName: string): FileNote[] {
		const fileNotes = this.getFileNotesFromLocalStorage()
		const fileNote: FileNote = fileNotes?.find(fileNote => fileNote.fileName === fileName)
		return fileNote ? [fileNote] : []
	}

	private static saveFileNotesToLocalStorage(fileNotes: FileNote[]) {
		localStorage.setItem(this.NOTES_LOCAL_STORAGE_ELEMENT, JSON.stringify(fileNotes))
	}

	private static getFileNote(fileName, fileNotes) {
		const fileNoteIndex = this.getFileNoteIndex(fileNotes, fileName)
		return fileNotes?.[fileNoteIndex]
	}

	private static getFileNoteIndex(fileNotes: FileNote[], fileName) {
		return fileNotes.findIndex(fileNote => fileNote.fileName === fileName)
	}
}
