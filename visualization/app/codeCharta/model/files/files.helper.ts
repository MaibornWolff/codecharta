import { CCFile } from "../../codeCharta.model"
import { FileSelectionState, FileState } from "./files"

export function getCCFiles(fileStates: FileState[]) {
	return fileStates.map(x => x.file)
}

export function fileStatesAvailable(fileStates: FileState[]) {
	return fileStates.some(x => x.selectedAs !== FileSelectionState.None)
}

export function getFileByFileName(fileStates: FileState[], fileName: string) {
	const matchingFileState = fileStates.find(x => x.file.fileMeta.fileName === fileName)
	return matchingFileState ? matchingFileState.file : undefined
}

export function getFileNameOf(fileState: FileState) {
	return fileState.file.fileMeta.fileName
}

export function getVisibleFiles(fileStates: FileState[]) {
	return getVisibleFileStates(fileStates).map(x => x.file)
}

export function getVisibleFileStates(fileStates: FileState[]) {
	return fileStates.filter(x => x.selectedAs !== FileSelectionState.None)
}

export function isDeltaState(fileStates: FileState[]) {
	return fileStates.some(x => x.selectedAs === FileSelectionState.Reference)
}

export function isPartialState(fileStates: FileState[]) {
	return fileStates.some(x => x.selectedAs === FileSelectionState.Partial)
}

export function isEqual(file1: CCFile, file2: CCFile) {
	return file1.fileMeta.fileChecksum === file2.fileMeta.fileChecksum
}

export function createPNGFileName(files: FileState[], pngFileNameSuffix: PngFileNameSuffix) {
	const jsonFileNames = getVisibleFileStates(files)
	const state = isPartialState(files) ? "partial" : isDeltaState(files) ? "delta" : ""
	const pngFileName = jsonFileNames
		.map(fileState => {
			const fileName = fileState.file.fileMeta.fileName
			return fileName.slice(0, fileName.lastIndexOf(".json"))
		})
		.join("_")
	return `${state}_${pngFileName}_${pngFileNameSuffix}.png`
}

type PngFileNameSuffix = "legend" | "map"
