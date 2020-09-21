import { FileSelectionState, FileState } from "./files"

export function getCCFiles(fileStates: FileState[]) {
	return fileStates.map(x => x.file)
}

export function fileStatesAvailable(fileStates: FileState[]) {
	return getVisibleFileStates(fileStates).length > 0
}

export function getFileByFileName(fileStates: FileState[], fileName: string) {
	const matchingFileState = fileStates.find(x => x.file.fileMeta.fileName === fileName)
	return matchingFileState ? matchingFileState.file : undefined
}

export function getVisibleFiles(fileStates: FileState[]) {
	return getVisibleFileStates(fileStates).map(x => x.file)
}

export function getVisibleFileStates(fileStates: FileState[]) {
	return fileStates.filter(x => x.selectedAs !== FileSelectionState.None)
}

export function isSingleState(fileStates: FileState[]) {
	return fileStates.some(x => x.selectedAs === FileSelectionState.Single)
}

export function isDeltaState(fileStates: FileState[]) {
	return fileStates.some(x => x.selectedAs === FileSelectionState.Reference || x.selectedAs === FileSelectionState.Comparison)
}

export function isPartialState(fileStates: FileState[]) {
	return fileStates.some(x => x.selectedAs === FileSelectionState.Partial)
}
