import { FileNote } from "../ui/attributeSideBar/attributeSideBar.component"
import { FileSelectionState, FileState } from "../model/files/files"

export class NotesHelper {
	// private static readonly NOTES_LOCAL_STORAGE_VERSION = "1.0.0"
	private static readonly NOTES_LOCAL_STORAGE_ELEMENT = "notes"

	static getNotesFromLocalStorage(fileName: string, nodePath: string) {
		const fileNotes: FileNote[] = JSON.parse(localStorage.getItem(this.NOTES_LOCAL_STORAGE_ELEMENT))
		const fileNotesIndex = fileNotes?.findIndex(fileNote => fileNote.fileName === fileName)

		return fileNotes?.[fileNotesIndex].notes.filter(note => note.nodePath === nodePath) || []
	}

	static updateNote(fileName: string, nodePath: string, index: number, newText: string) {
		const fileNotes: FileNote[] = JSON.parse?.(localStorage.getItem(this.NOTES_LOCAL_STORAGE_ELEMENT))
		const fileNotesIndex = fileNotes?.findIndex(fileNote => fileNote.fileName === fileName)
		const note = fileNotes?.[fileNotesIndex].notes.filter(note => note.nodePath === nodePath)?.[index]
		note.text = newText
		localStorage.setItem(this.NOTES_LOCAL_STORAGE_ELEMENT, JSON.stringify(fileNotes))
	}

	static addNewNote(fileName: string, note) {
		let fileNotes: FileNote[] = JSON.parse?.(localStorage.getItem(this.NOTES_LOCAL_STORAGE_ELEMENT))

		if (fileNotes === null) {
			const notes = [note]
			fileNotes = [{ fileName, notes }]
		}

		const index = fileNotes?.findIndex(fileNote => fileNote.fileName === fileName)
		if (index !== -1) {
			fileNotes?.[index].notes.push(note)
		} else {
			const fileNote: FileNote = { fileName, notes: [note] }
			fileNotes.push(fileNote)
		}

		localStorage.setItem(this.NOTES_LOCAL_STORAGE_ELEMENT, JSON.stringify(fileNotes))
	}

	static noteExists(fileName: string, nodePath: string, index: number): boolean {
		const fileNotes: FileNote[] = JSON.parse(localStorage.getItem(this.NOTES_LOCAL_STORAGE_ELEMENT))
		const fileNoteIndex = fileNotes.findIndex(fileNote => fileNote.fileName === fileName)
		return fileNotes?.[fileNoteIndex]?.notes.filter(note => note.nodePath === nodePath)?.[index] !== undefined
	}

	static removeNote(fileName, nodePath, noteIndex) {
		const fileNotes: FileNote[] = JSON.parse(localStorage.getItem(this.NOTES_LOCAL_STORAGE_ELEMENT))
		const fileNoteIndex = fileNotes.findIndex(fileNote => fileNote.fileName === fileName)
		const fileNote: FileNote = fileNotes?.[fileNoteIndex]
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
		return localStorage.setItem(this.NOTES_LOCAL_STORAGE_ELEMENT, JSON.stringify(fileNotes))
	}

	static getNotesFromSelectedMaps(files: FileState[]): FileNote[] {
		const fileNotes: FileNote[] = JSON.parse(localStorage.getItem(this.NOTES_LOCAL_STORAGE_ELEMENT)) as FileNote[]
		const selectedFiles = files.filter(
			file => file.selectedAs === FileSelectionState.Single || file.selectedAs === FileSelectionState.Partial
		)
		const currentMapFileNotes: FileNote[] = fileNotes.filter(fileNote => this.isFromSelectedFile(fileNote.fileName, selectedFiles))
		return currentMapFileNotes.length > 0 ? currentMapFileNotes : []
	}

	static isFromSelectedFile(path: string, selectedFiles: FileState[]): boolean {
		return selectedFiles.some(file => path.startsWith(file.file.fileMeta.fileName))
	}

	static deleteNotes() {
		return localStorage.setItem(this.NOTES_LOCAL_STORAGE_ELEMENT, JSON.stringify([]))
	}
}
