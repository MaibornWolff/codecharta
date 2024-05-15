import { _getVisibleFilesBySelectionMode } from "./visibleFilesBySelectionMode.selector"
import { FileSelectionState, FileState } from "../../model/files/files"
import { expect } from "@jest/globals"
import { CustomConfigMapSelectionMode } from "../../model/customConfig/customConfig.api.model"

describe("visibleFilesBySelectionModeSelector", function () {
    const file1 = { fileMeta: { fileName: "file1", fileChecksum: "fileCheckSum1" } }
    const file2 = { fileMeta: { fileName: "file2", fileChecksum: "fileCheckSum2" } }

    it("should return CustomConfig MULTIPLE Mode and collect file checksums and names in a map when selected files are in partial mode", function () {
        const visibleFileStates = [
            { file: file1, selectedAs: FileSelectionState.Partial },
            { file: file2, selectedAs: FileSelectionState.Partial }
        ] as FileState[]

        const { mapSelectionMode, assignedMaps } = _getVisibleFilesBySelectionMode(visibleFileStates)

        expect(mapSelectionMode).toEqual(CustomConfigMapSelectionMode.MULTIPLE)
        expect(assignedMaps).toEqual(
            new Map([
                ["fileCheckSum1", "file1"],
                ["fileCheckSum2", "file2"]
            ])
        )
    })

    it("should return CustomConfig DELTA Mode and collect file checksums and names in a map when files selected as reference and comparison", function () {
        const visibleFileStates = [
            { file: file1, selectedAs: FileSelectionState.Reference },
            { file: file2, selectedAs: FileSelectionState.Comparison }
        ] as FileState[]

        const { mapSelectionMode, assignedMaps } = _getVisibleFilesBySelectionMode(visibleFileStates)

        expect(mapSelectionMode).toEqual(CustomConfigMapSelectionMode.DELTA)
        expect(assignedMaps).toEqual(
            new Map([
                ["fileCheckSum1", "file1"],
                ["fileCheckSum2", "file2"]
            ])
        )
    })
})
