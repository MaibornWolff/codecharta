import { FileSelectionState, FileState } from "../../../model/files/files"
import { FILE_META, TEST_FILE_DATA } from "../../../util/dataMocks"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { TestBed } from "@angular/core/testing"
import { _onlyVisibleFilesMatterComparer, visibleFileStatesSelector } from "./visibleFileStates.selector"

describe("_onlyVisibleFilesMatterComparer", () => {
    it("should return true for two empty file state arrays", () => {
        expect(_onlyVisibleFilesMatterComparer([], [])).toBe(true)
    })

    it("should return false for arrays of different lengths", () => {
        const fileStates1 = [{ selectedAs: FileSelectionState.Reference, file: TEST_FILE_DATA }]
        const fileStates2 = []
        expect(_onlyVisibleFilesMatterComparer(fileStates1, fileStates2)).toBe(false)
    })

    it("should return true for arrays with the same visible file checksums, in the same order", () => {
        const file1 = { selectedAs: FileSelectionState.Reference, file: TEST_FILE_DATA }

        const fileStates1: FileState[] = [
            file1,
            {
                selectedAs: FileSelectionState.None,
                file: {
                    ...TEST_FILE_DATA,
                    fileMeta: { ...FILE_META, fileName: "second-file" }
                }
            }
        ]
        const fileStates2 = [file1]
        expect(_onlyVisibleFilesMatterComparer(fileStates1, fileStates2)).toBe(true)
    })

    it("should return true for arrays with the same visible files in different orders", () => {
        const fileStates1: FileState[] = [
            { selectedAs: FileSelectionState.Reference, file: TEST_FILE_DATA },
            {
                selectedAs: FileSelectionState.None,
                file: {
                    ...TEST_FILE_DATA,
                    fileMeta: { ...FILE_META, fileName: "second-file" }
                }
            }
        ]
        const fileStates2 = [
            {
                selectedAs: FileSelectionState.None,
                file: {
                    ...TEST_FILE_DATA,
                    fileMeta: { ...FILE_META, fileName: "second-file" }
                }
            },
            { selectedAs: FileSelectionState.Reference, file: TEST_FILE_DATA }
        ]
        expect(_onlyVisibleFilesMatterComparer(fileStates1, fileStates2)).toBe(true)
    })

    it("should return false for arrays with different visible file checksums", () => {
        const fileStates1: FileState[] = [{ selectedAs: FileSelectionState.Reference, file: TEST_FILE_DATA }]
        const fileStates2 = [
            {
                selectedAs: FileSelectionState.Reference,
                file: {
                    ...TEST_FILE_DATA,
                    fileMeta: { ...FILE_META, fileName: "second-file" }
                }
            }
        ]
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
