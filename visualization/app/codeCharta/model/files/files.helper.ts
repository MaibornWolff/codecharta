import { CCFile } from "../../codeCharta.model"
import { FileSelectionState, FileState } from "./files"

const FILE_EXTENSION_PNG = ".png"
const SCREENSHOT_FILE_NAME_LENGTH_LIMIT = 255
const SCREENSHOT_FILE_NAME_SHORTENER = "~"
const SCREENSHOT_FILE_NAME_LINK = "_"

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

export function createPNGFileName(files: FileState[], screenshotFileNameSuffix: FileNameSuffixScreenshot) {
    const state = isDeltaState(files) ? "delta" : ""
    const fileNames = getVisibleFileStates(files)
    const fileNamesStripped = fileNames.map(fileStates => createStrippedFileName(fileStates))
    const fileNameCombined = createCombinedFileName(fileNamesStripped)
    const fileNameCapped = createCappedFileName(fileNameCombined, state, screenshotFileNameSuffix)
    return fileNameCapped
}

function createStrippedFileName(fileState: FileState) {
    return fileState.file.fileMeta.fileName.replace(/(.cc)?.json$/, "")
}

function createCombinedFileName(fileNamesStripped: string[]) {
    return fileNamesStripped.length <= 3
        ? fileNamesStripped.join(SCREENSHOT_FILE_NAME_LINK)
        : [fileNamesStripped.at(0), SCREENSHOT_FILE_NAME_SHORTENER, fileNamesStripped.at(-1)].join(SCREENSHOT_FILE_NAME_LINK)
}

function createCappedFileName(fileNameCombined: string, state: string, screenshotFileNameSuffix: string) {
    const fileName = [state, fileNameCombined].filter(fileNameElement => fileNameElement.length > 0).join(SCREENSHOT_FILE_NAME_LINK)

    const maxLength = SCREENSHOT_FILE_NAME_LENGTH_LIMIT - screenshotFileNameSuffix.length - FILE_EXTENSION_PNG.length

    return fileName.length <= maxLength
        ? [fileName, SCREENSHOT_FILE_NAME_LINK, screenshotFileNameSuffix, FILE_EXTENSION_PNG].join("")
        : [fileName.slice(0, maxLength - 1), SCREENSHOT_FILE_NAME_SHORTENER, screenshotFileNameSuffix, FILE_EXTENSION_PNG].join("")
}

type FileNameSuffixScreenshot = "legend" | "map"
