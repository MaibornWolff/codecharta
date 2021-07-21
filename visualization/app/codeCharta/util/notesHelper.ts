import { FileNote } from "../ui/attributeSideBar/attributeSideBar.component"
import { FileSelectionState, FileState } from "../model/files/files"

export class NotesHelper {
	// private static readonly NOTES_LOCAL_STORAGE_VERSION = "1.0.0"
	private static readonly NOTES_LOCAL_STORAGE_ELEMENT = "notes"

	static getNotesFromLocalStorage(key: string) {
		const fileNotes: FileNote[] = JSON.parse(localStorage.getItem(this.NOTES_LOCAL_STORAGE_ELEMENT))
		return fileNotes?.filter(file => file.path === key) || []
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

	static removeNote(path, noteIndex) {
		const fileNotes: FileNote[] = JSON.parse(localStorage.getItem(this.NOTES_LOCAL_STORAGE_ELEMENT))
		let counter = -1
		for (let index = 0; index < fileNotes.length; index++) {
			if (fileNotes[index].path === path) {
				counter = counter + 1
				if (counter === noteIndex) {
					fileNotes.splice(index, 1)
					break
				}
			}
		}
		return localStorage.setItem(this.NOTES_LOCAL_STORAGE_ELEMENT, JSON.stringify(fileNotes))
	}

	static getNotesFromSelectedMaps(files: FileState[]): FileNote[] {
		const fileNotes = JSON.parse(localStorage.getItem(this.NOTES_LOCAL_STORAGE_ELEMENT)) as FileNote[]
		const selectedFiles = files.filter(
			file => file.selectedAs === FileSelectionState.Single || file.selectedAs === FileSelectionState.Partial
		)
		const currentMapFileNotes = fileNotes.filter(fileNote => this.isFromSelectedFile(fileNote.path, selectedFiles))
		return currentMapFileNotes.length > 0 ? currentMapFileNotes : []
	}

	static isFromSelectedFile(path: string, selectedFiles: FileState[]): boolean {
		return selectedFiles.some(file => path.startsWith(file.file.fileMeta.fileName))
	}

	static deleteNotes() {
		return localStorage.setItem(this.NOTES_LOCAL_STORAGE_ELEMENT, JSON.stringify([]))
	}
}
