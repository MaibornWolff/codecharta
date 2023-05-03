import { TestBed } from "@angular/core/testing"
import { FileSelectionState } from "../../model/files/files"
import { referenceFileSelector } from "../../state/selectors/referenceFile/referenceFile.selector"
import { addFile, removeFile, setDelta, setStandard } from "../../state/store/files/files.actions"
import { TEST_FILE_DATA, TEST_FILE_DATA_JAVA } from "../../util/dataMocks"
import { FileSelectionModeService } from "./fileSelectionMode.service"
import { State, Store, StoreModule } from "@ngrx/store"
import { appReducers, setStateMiddleware } from "../../state/store/state.manager"
import { CcState } from "../../codeCharta.model"

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
		store.dispatch(addFile({ file: TEST_FILE_DATA }))
		store.dispatch(addFile({ file: TEST_FILE_DATA_JAVA }))
		store.dispatch(setStandard({ files: [TEST_FILE_DATA] }))

		fileSelectionModeService = new FileSelectionModeService(store, state)
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
		store.dispatch(removeFile({ fileName: TEST_FILE_DATA_JAVA.fileMeta.fileName }))
		fileSelectionModeService.toggle()
		expect(referenceFileSelector(state.getValue())).toBe(TEST_FILE_DATA)
	})
})
