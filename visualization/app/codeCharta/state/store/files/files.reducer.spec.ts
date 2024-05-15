import {
    addFile,
    invertStandard,
    removeFile,
    setAll,
    setDelta,
    setDeltaComparison,
    setDeltaReference,
    setFiles,
    setStandard,
    setStandardByNames,
    switchReferenceAndComparison
} from "./files.actions"
import { TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../../../util/dataMocks"
import { isDeltaState, isPartialState } from "../../../model/files/files.helper"
import { FileSelectionState, FileState } from "../../../model/files/files"
import { clone } from "../../../util/clone"
import { files } from "./files.reducer"

describe("files", () => {
    let state: FileState[] = []

    beforeEach(() => {
        state = files([], addFile({ file: TEST_DELTA_MAP_A }))
        state = files(state, addFile({ file: TEST_DELTA_MAP_B }))
    })

    describe("Action: SET_FILES", () => {
        it("should set new files", () => {
            const newFiles: FileState[] = [{ file: TEST_DELTA_MAP_A, selectedAs: FileSelectionState.Partial }]

            const result = files(state, setFiles({ value: newFiles }))

            expect(result).toEqual(newFiles)
        })
    })

    describe("Action: SET_DELTA", () => {
        it("should select a file as reference and another as comparison", () => {
            const result = files(state, setDelta({ referenceFile: TEST_DELTA_MAP_A, comparisonFile: TEST_DELTA_MAP_B }))

            expect(isDeltaState(result)).toBeTruthy()
        })
    })

    describe("Action: SET_STANDARD", () => {
        it("should select two files to view in multiple mode", () => {
            const result = files(state, setStandard({ files: [TEST_DELTA_MAP_A, TEST_DELTA_MAP_B] }))

            expect(isPartialState(result)).toBeTruthy()
        })
    })

    describe("Action: SET_STANDARD_BY_NAMES", () => {
        it("should select two files by name to view in multiple mode", () => {
            const result = files(
                state,
                setStandardByNames({ fileNames: [TEST_DELTA_MAP_A.fileMeta.fileName, TEST_DELTA_MAP_B.fileMeta.fileName] })
            )

            expect(isPartialState(result)).toBeTruthy()
        })
    })

    describe("Action: REMOVE_FILE", () => {
        it("should remove a file", () => {
            const result = files(state, removeFile({ fileName: TEST_DELTA_MAP_A.fileMeta.fileName }))

            expect(result[0].file).toEqual(TEST_DELTA_MAP_B)
            expect(result.length).toBe(1)
        })

        it("should select first file as partial when there is no other file selected", () => {
            state[1].selectedAs = FileSelectionState.None
            const result = files(state, removeFile({ fileName: state[0].file.fileMeta.fileName }))
            expect(result.length).toBe(1)
            expect(result[0].selectedAs).toBe(FileSelectionState.Partial)
        })
    })

    describe("Action: SET_ALL", () => {
        it("should select all", () => {
            state[0].selectedAs = FileSelectionState.None
            state[1].selectedAs = FileSelectionState.None
            const result = files(state, setAll())
            expect(result[0].selectedAs).toBe(FileSelectionState.Partial)
            expect(result[1].selectedAs).toBe(FileSelectionState.Partial)
        })
    })

    describe("Action: SET_DELTA_REFERENCE", () => {
        it("should set delta reference file", () => {
            state[0].selectedAs = FileSelectionState.Partial
            state[1].selectedAs = FileSelectionState.Partial
            const result = files(state, setDeltaReference({ file: state[0].file }))
            expect(result[0].selectedAs).toBe(FileSelectionState.Reference)
            expect(result[1].selectedAs).toBe(FileSelectionState.None)
        })

        it("should not overwrite comparison file", () => {
            state[0].selectedAs = FileSelectionState.Reference
            state[1].selectedAs = FileSelectionState.Comparison
            state[2] = { file: clone(state[1].file), selectedAs: FileSelectionState.None }
            state[2].file.fileMeta.fileChecksum += "1"
            const result = files(state, setDeltaReference({ file: state[2].file }))
            expect(result[0].selectedAs).toBe(FileSelectionState.None)
            expect(result[1].selectedAs).toBe(FileSelectionState.Comparison)
            expect(result[2].selectedAs).toBe(FileSelectionState.Reference)
        })
    })

    describe("Action: SET_DELTA_COMPARISON", () => {
        it("should set delta comparison file", () => {
            state[0].selectedAs = FileSelectionState.Partial
            state[1].selectedAs = FileSelectionState.Reference
            const result = files(state, setDeltaComparison({ file: state[0].file }))
            expect(result[0].selectedAs).toBe(FileSelectionState.Comparison)
            expect(result[1].selectedAs).toBe(FileSelectionState.Reference)
        })

        it("should not overwrite reference file", () => {
            state[0].selectedAs = FileSelectionState.Reference
            state[1].selectedAs = FileSelectionState.Comparison
            state[2] = { file: clone(state[1].file), selectedAs: FileSelectionState.None }
            state[2].file.fileMeta.fileChecksum += "1"
            const result = files(state, setDeltaComparison({ file: state[2].file }))
            expect(result[0].selectedAs).toBe(FileSelectionState.Reference)
            expect(result[1].selectedAs).toBe(FileSelectionState.None)
            expect(result[2].selectedAs).toBe(FileSelectionState.Comparison)
        })
    })

    describe("Action: SWITCH_REFERENCE_AND_COMPARISON", () => {
        it("should switch reference and comparison file", () => {
            state[0].selectedAs = FileSelectionState.Reference
            state[1].selectedAs = FileSelectionState.Comparison
            const result = files(state, switchReferenceAndComparison())
            expect(result[0].selectedAs).toBe(FileSelectionState.Comparison)
            expect(result[1].selectedAs).toBe(FileSelectionState.Reference)
        })
    })

    describe("Action: INVERT_STANDARD", () => {
        it("should invert selection", () => {
            state[0].selectedAs = FileSelectionState.Partial
            state[1].selectedAs = FileSelectionState.None
            const result = files(state, invertStandard())
            expect(result[0].selectedAs).toBe(FileSelectionState.None)
            expect(result[1].selectedAs).toBe(FileSelectionState.Partial)
        })
    })
})
