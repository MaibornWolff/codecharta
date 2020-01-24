import { CCFile, FileSelectionState, FileState } from "../model/codeCharta.model"

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
		return !!fileStates.find(x => x.selectedAs === FileSelectionState.Single)
	}

	public static isDeltaState(fileStates: FileState[]): boolean {
		return !!fileStates.find(x => x.selectedAs === FileSelectionState.Reference || x.selectedAs === FileSelectionState.Comparison)
	}

	public static isPartialState(fileStates: FileState[]): boolean {
		return (
			!!fileStates.find(x => x.selectedAs === FileSelectionState.Partial) ||
			fileStates.find(x => x.selectedAs !== FileSelectionState.None) === undefined
		)
	}
}
