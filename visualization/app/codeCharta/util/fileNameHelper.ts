import { LoadFileService } from "../services/loadFile/loadFile.service"

const dateRegex = /_\d{4}(?:-\d{1,2}){2}_\d{1,2}-\d{1,2}\./

export class FileNameHelper {
    private static JSON_EXTENSION = ".json"

    static getNewFileName(fileName: string, isDeltaState: boolean) {
        return `${this.getFileNameWithoutTimestamp(fileName, isDeltaState)}_${this.getNewTimestamp()}`
    }

    static getNewTimestamp() {
        const date = new Date()
        return FileNameHelper.getFormattedTimestamp(date)
    }

    static getFormattedTimestamp(date: Date) {
        return date.toISOString().slice(0, 16).replace("T", "_").replace(":", "-")
    }

    private static getFileNameWithoutTimestamp(fileName: string, isDeltaState: boolean) {
        if (!isDeltaState) {
            const dateMatch = dateRegex.exec(fileName)
            if (dateMatch) {
                return fileName.slice(0, dateMatch.index)
            }
            if (fileName.endsWith(LoadFileService.CC_FILE_EXTENSION)) {
                return fileName.slice(0, -LoadFileService.CC_FILE_EXTENSION.length)
            }
            if (fileName.endsWith(FileNameHelper.JSON_EXTENSION)) {
                return fileName.slice(0, -FileNameHelper.JSON_EXTENSION.length)
            }
        }
        return fileName
    }

    static withoutCCExtension(fileName: string) {
        return fileName.replace(/(\.cc)?(\.json)?(\.gz)?$/, "")
    }
}
