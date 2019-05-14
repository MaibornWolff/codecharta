import { CCFile, FileSelectionState, FileState } from "../codeCharta.model"

export class FileStateHelper {
	public static getVisibleFiles(fileStates: FileState[]): CCFile[] {
		return fileStates.filter(x => x.selectedAs !== FileSelectionState.None).map(x => x.file)
	}

	public static getVisibleFileStates(fileStates: FileState[]): FileState[] {
		return fileStates.filter(x => x.selectedAs !== FileSelectionState.None)
	}

	public static getFileByFileName(fileName: string, fileStates: FileState[]): CCFile {
		const matchingFileState: FileState = fileStates.find(x => x.file.fileMeta.fileName == fileName)
		return matchingFileState ? matchingFileState.file : undefined
	}

	public static isSingleState(fileStates: FileState[]): boolean {
		const firstFoundFileState: FileSelectionState = this.getFirstFoundFileState(fileStates)
		return firstFoundFileState === FileSelectionState.Single
	}

	public static isDeltaState(fileStates: FileState[]): boolean {
		const firstFoundFileState: FileSelectionState = this.getFirstFoundFileState(fileStates)
		return firstFoundFileState === FileSelectionState.Reference || firstFoundFileState === FileSelectionState.Comparison
	}

	public static isPartialState(fileStates: FileState[]): boolean {
		const firstFoundFileState: FileSelectionState = this.getFirstFoundFileState(fileStates)
		return firstFoundFileState === undefined || firstFoundFileState === FileSelectionState.Partial
	}

	private static getFirstFoundFileState(fileStates: FileState[]): FileSelectionState {
		return fileStates.map(x => x.selectedAs).find(state => state !== FileSelectionState.None)
	}
}
