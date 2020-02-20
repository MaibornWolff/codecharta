import { CCFile, FileSelectionState, FileState } from "../codeCharta.model"
const clone = require("rfdc")()

export class Files {
	constructor(private files: FileState[] = []) {}

	public getFiles(): FileState[] {
		return this.files
	}

	public reset() {
		this.files = []
	}

	public resetSelection() {
		this.files = this.files.map(file => {
			return { ...file, selectedAs: FileSelectionState.None }
		})
	}

	public getCCFiles(): CCFile[] {
		return this.files.map(x => x.file)
	}

	public addFile(file: CCFile) {
		this.files = [...this.files, { file: clone(file), selectedAs: FileSelectionState.None }]
	}

	public setFiles(files: Files) {
		this.files = clone(files.getFiles())
	}

	public setSingleByName(fileName: string) {
		this.files = this.files.map(file => {
			if (file.file.fileMeta.fileName === fileName) {
				return { ...file, selectedAs: FileSelectionState.Single }
			} else {
				return { ...file, selectedAs: FileSelectionState.None }
			}
		})
	}

	public setSingle(file: CCFile) {
		this.setSingleByName(file.fileMeta.fileName)
	}

	public setDeltaByNames(referenceFileName: string, comparisonFileName: string) {
		this.files = this.files.map(elem => {
			if (elem.file.fileMeta.fileName === referenceFileName) {
				return { ...elem, selectedAs: FileSelectionState.Reference }
			} else if (elem.file.fileMeta.fileName === comparisonFileName) {
				return { ...elem, selectedAs: FileSelectionState.Comparison }
			} else {
				return { ...elem, selectedAs: FileSelectionState.None }
			}
		})
	}

	public setDelta(reference: CCFile, comparison: CCFile) {
		this.setDeltaByNames(reference.fileMeta.fileName, comparison.fileMeta.fileName)
	}

	public setMultipleByNames(partialFileNames: string[]) {
		this.files = this.files.map(elem => {
			if (partialFileNames.indexOf(elem.file.fileMeta.fileName) !== -1) {
				return { ...elem, selectedAs: FileSelectionState.Partial }
			} else {
				return { ...elem, selectedAs: FileSelectionState.None }
			}
		})
	}

	public setMultiple(multipleFiles: CCFile[]) {
		this.setMultipleByNames(multipleFiles.map(file => file.fileMeta.fileName))
	}

	public fileStatesAvailable(): boolean {
		return this.getVisibleFileStates().length > 0
	}

	public getFileByFileName(fileName: string): CCFile {
		const matchingFileState: FileState = this.files.find(x => x.file.fileMeta.fileName == fileName)
		return matchingFileState ? matchingFileState.file : undefined
	}

	public getVisibleFiles(): CCFile[] {
		return this.files.filter(x => x.selectedAs !== FileSelectionState.None).map(x => x.file)
	}

	public getVisibleFileStates(): FileState[] {
		return this.files.filter(x => x.selectedAs !== FileSelectionState.None)
	}

	public isSingleState(): boolean {
		return !!this.files.find(x => x.selectedAs === FileSelectionState.Single)
	}

	public isDeltaState(): boolean {
		return !!this.files.find(x => x.selectedAs === FileSelectionState.Reference || x.selectedAs === FileSelectionState.Comparison)
	}

	public isPartialState(): boolean {
		return !!this.files.find(x => x.selectedAs === FileSelectionState.Partial)
	}
}
