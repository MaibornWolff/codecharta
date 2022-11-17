import { TestBed } from "@angular/core/testing"
import { FileSelectionState } from "../../model/files/files"
import { State } from "../../state/angular-redux/state"
import { Store } from "../../state/angular-redux/store"
import { referenceFileSelector } from "../../state/selectors/referenceFile/referenceFile.selector"
import { addFile, removeFile, setDelta, setStandard } from "../../state/store/files/files.actions"
import { Store as PlainStore } from "../../state/store/store"
import { TEST_FILE_DATA, TEST_FILE_DATA_JAVA } from "../../util/dataMocks"
import { FileSelectionModeService } from "./fileSelectionMode.service"

describe("FileSelectionModeService", () => {
	let fileSelectionModeService: FileSelectionModeService

	beforeEach(() => {
		PlainStore["initialize"]()
		PlainStore.dispatch(addFile(TEST_FILE_DATA))
		PlainStore.dispatch(addFile(TEST_FILE_DATA_JAVA))
		PlainStore.dispatch(setStandard([TEST_FILE_DATA]))

		const store = TestBed.inject(Store)
		const state = TestBed.inject(State)
		fileSelectionModeService = new FileSelectionModeService(store, state)
	})

	it("should set first selected file as reference, when there was no reference file before", () => {
		fileSelectionModeService.toggle()
		expect(referenceFileSelector(PlainStore.store.getState())).toBe(TEST_FILE_DATA)
	})

	it("should restore previous files on toggle", () => {
		let fileStates = PlainStore.store.getState().files
		expect(fileStates[0].selectedAs).toBe(FileSelectionState.Partial)
		expect(fileStates[1].selectedAs).toBe(FileSelectionState.None)

		fileSelectionModeService.toggle()
		PlainStore.dispatch(setDelta(TEST_FILE_DATA_JAVA, TEST_FILE_DATA))

		fileSelectionModeService.toggle()
		fileStates = PlainStore.store.getState().files
		expect(fileStates[0].selectedAs).toBe(FileSelectionState.Partial)
		expect(fileStates[1].selectedAs).toBe(FileSelectionState.None)
	})

	it("should not restore a removed file when toggling back to delta mode", () => {
		fileSelectionModeService.toggle()
		PlainStore.dispatch(setDelta(TEST_FILE_DATA_JAVA, TEST_FILE_DATA))
		fileSelectionModeService.toggle()
		PlainStore.dispatch(removeFile(TEST_FILE_DATA_JAVA.fileMeta.fileName))
		fileSelectionModeService.toggle()
		expect(referenceFileSelector(PlainStore.store.getState())).toBe(TEST_FILE_DATA)
	})
})
