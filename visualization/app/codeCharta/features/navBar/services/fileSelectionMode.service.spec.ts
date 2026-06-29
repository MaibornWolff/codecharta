import { TestBed } from "@angular/core/testing"
import { FileSelectionState } from "../../../model/files/files"
import { referenceFileSelector } from "../../../state/selectors/referenceFile/referenceFile.selector"
import { addFile, removeFiles, setDelta, setStandard } from "../../../state/store/files/files.actions"
import { TEST_FILE_DATA, TEST_FILE_DATA_JAVA } from "../../../mocks/dataMocks"
import { FileSelectionModeService } from "./fileSelectionMode.service"
import { State, Store, StoreModule } from "@ngrx/store"
import { appReducers, setStateMiddleware } from "../../../state/store/state.manager"
import { CcState } from "../../../codeCharta.model"
import { FilesSelectionStore } from "../stores/filesSelection.store"

describe("FileSelectionModeService", () => {
    let fileSelectionModeService: FileSelectionModeService
    let store: Store<CcState>
    let state: State<CcState>

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
        store = TestBed.inject(Store)
        state = TestBed.inject(State)
        store.dispatch(addFile({ file: TEST_FILE_DATA_JAVA })) //fileName: "fileB"
        store.dispatch(addFile({ file: TEST_FILE_DATA }))
        store.dispatch(setStandard({ files: [TEST_FILE_DATA] })) //fileName: "fileA"

        fileSelectionModeService = new FileSelectionModeService(TestBed.inject(FilesSelectionStore))
    })

    it("should set first selected file as reference, when there was no reference file before", () => {
        fileSelectionModeService.toggle()
        expect(referenceFileSelector(state.getValue())).toBe(TEST_FILE_DATA)
    })

    it("should restore previous files on toggle", () => {
        let fileStates = state.getValue().files
        expect(fileStates[0].selectedAs).toBe(FileSelectionState.Partial)
        expect(fileStates[1].selectedAs).toBe(FileSelectionState.None)

        fileSelectionModeService.toggle()
        store.dispatch(setDelta({ referenceFile: TEST_FILE_DATA_JAVA, comparisonFile: TEST_FILE_DATA }))
        fileSelectionModeService.toggle()

        fileStates = state.getValue().files
        expect(fileStates[0].selectedAs).toBe(FileSelectionState.Partial)
        expect(fileStates[1].selectedAs).toBe(FileSelectionState.None)
    })

    it("should not restore a removed file when toggling back to delta mode", () => {
        fileSelectionModeService.toggle()
        store.dispatch(setDelta({ referenceFile: TEST_FILE_DATA_JAVA, comparisonFile: TEST_FILE_DATA }))
        fileSelectionModeService.toggle()
        store.dispatch(removeFiles({ fileNames: [TEST_FILE_DATA_JAVA.fileMeta.fileName] }))
        fileSelectionModeService.toggle()
        expect(referenceFileSelector(state.getValue())).toBe(TEST_FILE_DATA)
    })

    it("should switch back to standard mode after a reload while in delta mode", () => {
        // Arrange — simulate the post-reload state: store is in delta mode but the service
        // has no remembered "previous standard" snapshot because it was just constructed.
        store.dispatch(setDelta({ referenceFile: TEST_FILE_DATA, comparisonFile: TEST_FILE_DATA_JAVA }))
        const freshService = new FileSelectionModeService(TestBed.inject(FilesSelectionStore))
        expect(freshService.lastSetFilesOfPreviousMode).toEqual([])

        // Act
        freshService.toggle()

        // Assert — we're now in standard mode with the former reference selected
        const fileStates = state.getValue().files
        expect(fileStates.find(f => f.file === TEST_FILE_DATA)?.selectedAs).toBe(FileSelectionState.Partial)
        expect(fileStates.find(f => f.file === TEST_FILE_DATA_JAVA)?.selectedAs).toBe(FileSelectionState.None)
    })

    it("should remain sorted after toggling", () => {
        const file1 = { ...TEST_FILE_DATA, fileMeta: { ...TEST_FILE_DATA.fileMeta, fileName: "bFile", fileChecksum: "2" } }
        const file2 = { ...TEST_FILE_DATA_JAVA, fileMeta: { ...TEST_FILE_DATA_JAVA.fileMeta, fileName: "aFile", fileChecksum: "1" } }
        const file3 = { ...TEST_FILE_DATA, fileMeta: { ...TEST_FILE_DATA.fileMeta, fileName: "aFile", fileChecksum: "2" } }

        store.dispatch(addFile({ file: file1 }))
        store.dispatch(addFile({ file: file2 }))
        store.dispatch(addFile({ file: file3 }))

        fileSelectionModeService.toggle()
        fileSelectionModeService.toggle()

        const fileStates = state.getValue().files
        expect(fileStates[0].file.fileMeta.fileName).toBe("aFile")
        expect(fileStates[0].file.fileMeta.fileChecksum).toBe("1")
        expect(fileStates[1].file.fileMeta.fileName).toBe("aFile")
        expect(fileStates[1].file.fileMeta.fileChecksum).toBe("2")
        expect(fileStates[2].file.fileMeta.fileName).toBe("bFile")
        expect(fileStates[3].file.fileMeta.fileName).toBe("fileA")
        expect(fileStates[4].file.fileMeta.fileName).toBe("fileB")
    })
})
