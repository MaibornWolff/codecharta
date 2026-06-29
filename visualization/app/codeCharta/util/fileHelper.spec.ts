import { CCFile } from "../codeCharta.model"
import { getSelectedFilesSize } from "./fileHelper"
import { FileSelectionState, FileState } from "../model/files/files"
import packageJson from "../../../package.json"

describe("fileHelper", () => {
    describe("getSelectedFilesSize", () => {
        it("should sum up sizes of selected files", () => {
            const file1 = {
                fileMeta: {
                    fileName: "file1",
                    fileChecksum: "invalid-md5-checksum-1",
                    projectName: "Sample Project",
                    apiVersion: packageJson.codecharta.apiVersion,
                    exportedFileSize: 10
                }
            } as CCFile

            const file2 = {
                fileMeta: {
                    fileName: "file2",
                    fileChecksum: "invalid-md5-checksum-2",
                    projectName: "Sample Project",
                    apiVersion: packageJson.codecharta.apiVersion,
                    exportedFileSize: 10
                }
            } as CCFile

            const unselectedFile = {
                fileMeta: {
                    fileName: "unselectedFile",
                    fileChecksum: "invalid-md5-checksum-3",
                    projectName: "Sample Project",
                    apiVersion: packageJson.codecharta.apiVersion,
                    exportedFileSize: 10
                }
            } as CCFile

            const severalFiles: FileState[] = [
                {
                    file: file1,
                    selectedAs: FileSelectionState.Partial
                },
                {
                    file: file2,
                    selectedAs: FileSelectionState.Comparison
                },
                {
                    file: unselectedFile,
                    selectedAs: FileSelectionState.None
                }
            ]

            expect(getSelectedFilesSize(severalFiles)).toBe(20)
        })
    })
})
