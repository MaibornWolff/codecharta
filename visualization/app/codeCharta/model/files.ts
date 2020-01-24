import { CCFile, FileSelectionState, FileState } from "./codeCharta.model"

export class Files {
	private files: FileState[] = []

	public getFiles(): FileState[] {
		return this.files
	}

	public reset() {
		this.files = []
	}

	public resetSelection() {
		this.files.map(file => {
			file.selectedAs = FileSelectionState.None
		})
	}

	public getCCFiles(): CCFile[] {
		return this.files.map(x => x.file)
	}

	public addFile(file: CCFile) {
		this.files.push({ file: file, selectedAs: FileSelectionState.None })
	}

	public setSingleByName(fileName: string) {
		const singleFile: CCFile = this.getFileByFileName(fileName)
		this.setSingle(singleFile)
	}

	public setSingle(file: CCFile) {
		this.resetSelection()
		const matchedFile = this.files.find(x => x.file === file)
		if (matchedFile) {
			matchedFile.selectedAs = FileSelectionState.Single
		}
	}

	public setDeltaByNames(referenceFileName: string, comparisonFileName: string) {
		const referenceFile: CCFile = this.getFileByFileName(referenceFileName)
		const comparisonFile: CCFile = this.getFileByFileName(comparisonFileName)
		this.setDelta(referenceFile, comparisonFile)
	}

	public setDelta(reference: CCFile, comparison: CCFile) {
		this.resetSelection()
		const matchedReferenceFile = this.files.find(x => x.file === reference)
		const matchedComparisonFile = this.files.find(x => x.file === comparison)

		if (matchedReferenceFile) {
			matchedReferenceFile.selectedAs = FileSelectionState.Reference
		}

		if (matchedComparisonFile) {
			matchedComparisonFile.selectedAs = FileSelectionState.Comparison
		}
	}

	public setMultipleByNames(partialFileNames: string[]) {
		const partialFiles: CCFile[] = []
		partialFileNames.forEach(fileName => partialFiles.push(this.getFileByFileName(fileName)))
		this.setMultiple(partialFiles)
	}

	public setMultiple(multipleFiles: CCFile[]) {
		this.resetSelection()
		this.files.filter(x => multipleFiles.indexOf(x.file) !== -1).forEach(x => (x.selectedAs = FileSelectionState.Partial))
	}

	public fileStatesAvailable(): boolean {
		return this.files.length > 0
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
