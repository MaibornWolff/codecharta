import { NodeType } from "../../../codeCharta.model"
import { FileSelectionState, FileState } from "../../../model/files/files"
import packageJson from "../../../../../package.json"
import { _getUndecoratedAccumulatedData } from "./accumulatedData.selector"

describe("accumulatedDataSelector", () => {
    describe("_getUndecoratedAccumulatedData", () => {
        const fileState1 = {
            file: {
                fileMeta: {
                    fileName: "file1",
                    fileChecksum: "md5-file1",
                    projectName: "Sample Project",
                    apiVersion: packageJson.codecharta.apiVersion,
                    exportedFileSize: 300_000
                },
                map: {
                    name: "root1",
                    type: NodeType.FOLDER,
                    path: "/root1",
                    attributes: { rloc: 170, functions: 1010, mcc: 11 },
                    children: []
                }
            }
        } as unknown as FileState
        const fileState2 = {
            file: {
                fileMeta: {
                    fileName: "file2",
                    fileChecksum: "md5-file2",
                    projectName: "Sample Project2",
                    apiVersion: packageJson.codecharta.apiVersion,
                    exportedFileSize: 300_000
                },
                map: {
                    name: "root2",
                    type: NodeType.FOLDER,
                    path: "/root2",
                    attributes: { rloc: 170, functions: 1010, mcc: 11 },
                    children: []
                }
            }
        } as unknown as FileState

        beforeEach(() => {
            fileState1.selectedAs = FileSelectionState.None
            fileState2.selectedAs = FileSelectionState.None
        })

        it("should wrap multiple selected files in a root path", () => {
            fileState1.selectedAs = FileSelectionState.Partial
            fileState2.selectedAs = FileSelectionState.Partial
            const accumulatedData = _getUndecoratedAccumulatedData([fileState1, fileState2])
            expect(accumulatedData.map.path).toBe("/root")
        })

        it("should not wrap a single selected file in a root path", () => {
            fileState1.selectedAs = FileSelectionState.Partial
            const accumulatedData = _getUndecoratedAccumulatedData([fileState1])
            expect(accumulatedData.map.path).toBe("/root1")
        })

        it("should wrap a root path for delta mode", () => {
            fileState1.selectedAs = FileSelectionState.Reference
            fileState2.selectedAs = FileSelectionState.Comparison
            const accumulatedData = _getUndecoratedAccumulatedData([fileState1, fileState2])
            expect(accumulatedData.map.path).toBe("/root")
        })

        it("should not wrap a root path, when there is no comparison file in delta mode", () => {
            fileState1.selectedAs = FileSelectionState.Reference
            const accumulatedData = _getUndecoratedAccumulatedData([fileState1])
            expect(accumulatedData.map.path).toBe("/root1")
        })
    })
})
