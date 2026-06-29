import { FileSelectionState, FileState } from "../model/files/files"

export function getSelectedFilesSize(files: FileState[]) {
    let totalFileSize = 0
    for (const file of files) {
        if (file.selectedAs !== FileSelectionState.None) {
            totalFileSize += file.file.fileMeta.exportedFileSize
        }
    }

    return totalFileSize
}
