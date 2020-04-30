import { CCFile, FileSelectionState, FileState } from "../../../codeCharta.model"

export function getCCFiles(fileStates: FileState[]): CCFile[] {
	return fileStates.map(x => x.file)
}

export function fileStatesAvailable(fileStates: FileState[]): boolean {
	return getVisibleFileStates(fileStates).length > 0
}

export function getFileByFileName(fileStates: FileState[], fileName: string): CCFile {
	const matchingFileState: FileState = fileStates.find(x => x.file.fileMeta.fileName == fileName)
	return matchingFileState ? matchingFileState.file : undefined
}

export function getVisibleFiles(fileStates: FileState[]): CCFile[] {
	return getVisibleFileStates(fileStates).map(x => x.file)
}

export function getVisibleFileStates(fileStates: FileState[]): FileState[] {
	return fileStates.filter(x => x.selectedAs !== FileSelectionState.None)
}

export function isSingleState(fileStates: FileState[]): boolean {
	return fileStates.some(x => x.selectedAs === FileSelectionState.Single)
}

export function isDeltaState(fileStates: FileState[]): boolean {
	return fileStates.some(x => x.selectedAs === FileSelectionState.Reference || x.selectedAs === FileSelectionState.Comparison)
}

export function isPartialState(fileStates: FileState[]): boolean {
	return fileStates.some(x => x.selectedAs === FileSelectionState.Partial)
}
