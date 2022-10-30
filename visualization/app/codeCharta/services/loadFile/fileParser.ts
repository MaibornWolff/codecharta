import { NameDataPair } from "../../codeCharta.model"
import { FileSelectionState, FileState } from "../../model/files/files"
import { getCCFile } from "../../util/fileHelper"
import { CCFileValidationResult, checkErrors, checkWarnings } from "../../util/fileValidator"
import { NodeDecorator } from "../../util/nodeDecorator"

export function enrichFileStatesAndRecentFilesWithValidationResults(
	fileStates: FileState[],
	recentFiles: string[],
	nameDataPairs: NameDataPair[],
	fileValidationResults: CCFileValidationResult[]
) {
	for (const nameDataPair of nameDataPairs) {
		const fileValidationResult: CCFileValidationResult = {
			fileName: nameDataPair?.fileName,
			errors: [],
			warnings: []
		}
		fileValidationResult.errors.push(...checkErrors(nameDataPair?.content))

		if (fileValidationResult.errors.length === 0) {
			fileValidationResult.warnings.push(...checkWarnings(nameDataPair?.content))
			addFile(fileStates, recentFiles, nameDataPair)
		}

		if (fileValidationResult.errors.length > 0 || fileValidationResult.warnings.length > 0) {
			fileValidationResults.push(fileValidationResult)
		}
	}
}

function addFile(fileStates: FileState[], recentFiles: string[], file: NameDataPair) {
	const ccFile = getCCFile(file)
	NodeDecorator.decorateMapWithPathAttribute(ccFile)
	const currentFileChecksum = ccFile.fileMeta.fileChecksum
	let currentFileName = ccFile.fileMeta.fileName
	const storedFileNames = new Map(fileStates.map(fileState => [fileState.file.fileMeta.fileName, fileState.file.fileMeta.fileChecksum]))
	const storedFileChecksums = new Map(
		fileStates.map((fileState, index) => [fileState.file.fileMeta.fileChecksum, index] as [string, number])
	)
	const isDuplicate = storedFileChecksums.has(currentFileChecksum)

	if (storedFileNames.has(currentFileName)) {
		currentFileName = getFileName(currentFileName, storedFileNames, currentFileChecksum)
		ccFile.fileMeta.fileName = currentFileName
	}
	if (isDuplicate) {
		fileStates[storedFileChecksums.get(currentFileChecksum)].file.fileMeta.fileName = currentFileName
		recentFiles[0] = currentFileName
		recentFiles.push(currentFileName)
		return
	}

	fileStates.push({ file: ccFile, selectedAs: FileSelectionState.None })
	recentFiles.push(currentFileName)
}

function getFileName(currentFileName: string, storedFileNames: Map<string, string>, currentFileChecksum: string) {
	if (storedFileNames.get(currentFileName) === currentFileChecksum) {
		return currentFileName
	}

	let nameFound = false
	let fileNameOccurrence = 1
	let newFileName = currentFileName

	while (!nameFound) {
		const endOfNameIndex = currentFileName.indexOf(".")
		newFileName =
			endOfNameIndex >= 0
				? [currentFileName.slice(0, endOfNameIndex), "_", fileNameOccurrence, currentFileName.slice(endOfNameIndex)].join("")
				: `${currentFileName}_${fileNameOccurrence}`
		// resolve if uploaded file has identical checksum and different already occurring name
		if (storedFileNames.get(newFileName) === currentFileChecksum || !storedFileNames.has(newFileName)) {
			nameFound = true
		}
		fileNameOccurrence++
	}
	return newFileName
}
