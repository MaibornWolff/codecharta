import { FileSelectionState, FileState } from "../../../model/files/files"
import { FILE_META, TEST_FILE_DATA, TEST_FILE_DATA_JAVA, TEST_FILE_DATA_TWO } from "../../../util/dataMocks"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { TestBed } from "@angular/core/testing"
import { _onlyVisibleFilesMatterComparer, visibleFileStatesSelector } from "./visibleFileStates.selector"

describe("_onlyVisibleFilesMatterComparer with standard state", () => {
    const fileStatePartial1 = { selectedAs: FileSelectionState.Partial, file: TEST_FILE_DATA }
    const fileStatePartial2 = { selectedAs: FileSelectionState.Partial, file: TEST_FILE_DATA_TWO }
    const fileStateNone = { selectedAs: FileSelectionState.None, file: TEST_FILE_DATA_JAVA }

    it("should return true for two empty file states", () => {
        expect(_onlyVisibleFilesMatterComparer([], [])).toBe(true)
    })

    it("should return true for the same file states", () => {
        const fileStates = [fileStatePartial1, fileStateNone]
        expect(_onlyVisibleFilesMatterComparer(fileStates, fileStates)).toBe(true)
    })

    it("should return false for file states with different number of visible files", () => {
        const fileStates1 = [fileStatePartial1, fileStatePartial2]
        const fileStates2 = [fileStatePartial1, fileStateNone]
        expect(_onlyVisibleFilesMatterComparer(fileStates1, fileStates2)).toBe(false)
    })

    it("should return false for file states with different visible files", () => {
        const fileStates1 = [fileStatePartial1]
        const fileStates2 = [fileStatePartial2]
        expect(_onlyVisibleFilesMatterComparer(fileStates1, fileStates2)).toBe(false)
    })

    it("should return true for file states with same visible files in different order", () => {
        const fileStates1 = [fileStatePartial1, fileStatePartial2]
        const fileStates2 = [fileStatePartial2, fileStatePartial1]
        expect(_onlyVisibleFilesMatterComparer(fileStates1, fileStates2)).toBe(true)
    })
})

describe("_onlyVisibleFilesMatterComparer with delta state", () => {
    const fileStateReference = { selectedAs: FileSelectionState.Reference, file: TEST_FILE_DATA }
    const fileStateComparison = { selectedAs: FileSelectionState.Comparison, file: TEST_FILE_DATA_TWO }
    const fileStateNone = { selectedAs: FileSelectionState.None, file: TEST_FILE_DATA_JAVA }

    it("should return false for states of different lengths", () => {
        const fileStates1 = [fileStateReference]
        const fileStates2 = []
        expect(_onlyVisibleFilesMatterComparer(fileStates1, fileStates2)).toBe(false)
    })

    it("should return true for states with the same visible files", () => {
        const fileStates1: FileState[] = [fileStateReference, fileStateNone]
        const fileStates2 = [fileStateReference]

        expect(_onlyVisibleFilesMatterComparer(fileStates1, fileStates2)).toBe(true)
    })

    it("should return false for states with no reference file", () => {
        const fileStates1: FileState[] = [fileStateReference, fileStateNone]
        const fileStates2 = [fileStateNone]

        expect(_onlyVisibleFilesMatterComparer(fileStates1, fileStates2)).toBe(false)
    })

    it("should return false for states with no comparison file", () => {
        const fileStates1: FileState[] = [fileStateReference, fileStateComparison]
        const fileStates2 = [fileStateReference, fileStateNone]

        expect(_onlyVisibleFilesMatterComparer(fileStates1, fileStates2)).toBe(false)
    })

    it("should return true for states with the same visible files in different orders", () => {
        const fileStates1: FileState[] = [fileStateReference, fileStateNone]
        const fileStates2 = [fileStateNone, fileStateReference]
        expect(_onlyVisibleFilesMatterComparer(fileStates1, fileStates2)).toBe(true)
    })

    it("should return false for states with different visible files", () => {
        const fileStates1: FileState[] = [fileStateReference]
        const fileStates2 = [fileStateNone]

        expect(_onlyVisibleFilesMatterComparer(fileStates1, fileStates2)).toBe(false)
    })

    it("should return false for states of different file selection states", () => {
        const fileStates1: FileState[] = [fileStateReference]
        const fileStates2 = [{ ...fileStateReference, selectedAs: FileSelectionState.Comparison }]
        expect(_onlyVisibleFilesMatterComparer(fileStates1, fileStates2)).toBe(false)
    })

    it("should return true when both states have the same reference and comparison files correctly set", () => {
        const referenceFile: FileState = fileStateReference
        const comparisonFile: FileState = { ...fileStateNone, selectedAs: FileSelectionState.Comparison }

        const fileStates1 = [referenceFile, comparisonFile]
        const fileStates2 = [referenceFile, comparisonFile]

        expect(_onlyVisibleFilesMatterComparer(fileStates1, fileStates2)).toBe(true)
    })

    it("should return false for different comparison files", () => {
        const referenceFile1: FileState = fileStateReference
        const referenceFile2: FileState = fileStateReference
        const comparisonFile1: FileState = {
            file: { ...TEST_FILE_DATA, fileMeta: { ...FILE_META, fileChecksum: "checksum3" } },
            selectedAs: FileSelectionState.Comparison
        }
        const comparisonFile2: FileState = {
            file: { ...TEST_FILE_DATA, fileMeta: { ...FILE_META, fileChecksum: "checksum4" } },
            selectedAs: FileSelectionState.Comparison
        }

        const fileStates1 = [referenceFile1, comparisonFile1]
        const fileStates2 = [referenceFile2, comparisonFile2]

        expect(_onlyVisibleFilesMatterComparer(fileStates1, fileStates2)).toBe(false)
    })

    it("should return false for different reference files", () => {
        const referenceFile1: FileState = fileStateReference
        const referenceFile2: FileState = {
            file: { ...TEST_FILE_DATA, fileMeta: { ...FILE_META, fileChecksum: "checksum2" } },
            selectedAs: FileSelectionState.Reference
        }
        const comparisonFile1: FileState = { ...fileStateNone, selectedAs: FileSelectionState.Comparison }
        const comparisonFile2: FileState = { ...fileStateNone, selectedAs: FileSelectionState.Comparison }

        const fileStates1 = [referenceFile1, comparisonFile1]
        const fileStates2 = [referenceFile2, comparisonFile2]

        expect(_onlyVisibleFilesMatterComparer(fileStates1, fileStates2)).toBe(false)
    })
})

describe("visibleFileStatesSelector", () => {
    it("should select only visible files", done => {
        TestBed.configureTestingModule({
            providers: [
                provideMockStore({
                    initialState: {
                        files: [
                            { selectedAs: FileSelectionState.Reference, file: TEST_FILE_DATA },
                            { selectedAs: FileSelectionState.None, file: TEST_FILE_DATA }
                        ]
                    }
                })
            ]
        })

        const store: MockStore = TestBed.inject(MockStore)
        store.select(visibleFileStatesSelector).subscribe(result => {
            expect(result).toEqual([{ selectedAs: FileSelectionState.Reference, file: TEST_FILE_DATA }])
            done()
        })
    })

    it("should not select any files when all files are marked as None", done => {
        TestBed.configureTestingModule({
            providers: [
                provideMockStore({
                    initialState: {
                        files: [
                            { selectedAs: FileSelectionState.None, file: TEST_FILE_DATA },
                            { selectedAs: FileSelectionState.None, file: TEST_FILE_DATA }
                        ]
                    }
                })
            ]
        })

        const store: MockStore = TestBed.inject(MockStore)
        store.select(visibleFileStatesSelector).subscribe(result => {
            expect(result).toEqual([])
            done()
        })
    })
})
