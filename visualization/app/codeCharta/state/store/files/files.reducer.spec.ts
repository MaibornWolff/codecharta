import {
	addFile,
	defaultFiles,
	FilesAction,
	resetFiles,
	resetSelection,
	setDelta,
	setDeltaByNames,
	setFiles,
	setMultiple,
	setMultipleByNames,
	setSingle,
	setSingleByName
} from "./files.actions"
import { TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../../../util/dataMocks"
import files from "./files.reducer"
import { FileSelectionState, FileState } from "../../../codeCharta.model"
import { fileStatesAvailable, isDeltaState, isPartialState, isSingleState } from "./files.helper"

describe("files", () => {
	let state = []

	beforeEach(() => {
		state = files(state, resetFiles())
		state = files(state, addFile(TEST_DELTA_MAP_A))
		state = files(state, addFile(TEST_DELTA_MAP_B))
	})

	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = files(undefined, {} as FilesAction)

			expect(result).toEqual(defaultFiles)
		})
	})

	describe("Action: SET_FILES", () => {
		it("should set new files", () => {
			const newFiles: FileState[] = [{ file: TEST_DELTA_MAP_A, selectedAs: FileSelectionState.Single }]

			const result = files(state, setFiles(newFiles))

			expect(result).toEqual(newFiles)
		})

		it("should set default files", () => {
			const result = files(state, setFiles())

			expect(result).toEqual(defaultFiles)
		})
	})

	describe("Action: RESET_FILES", () => {
		it("should clear and reset the state", () => {
			const result = files(state, resetFiles())

			expect(result.length).toBe(0)
		})
	})

	describe("Action: RESET_SELECTION", () => {
		it("should unselect all files", () => {
			files(state, setSingle(TEST_DELTA_MAP_A))

			const result = files(state, resetSelection())

			expect(fileStatesAvailable(result)).toBeFalsy()
		})
	})

	describe("Action: SET_SINGLE", () => {
		it("should select a file to view in single mode", () => {
			const result = files(state, setSingle(TEST_DELTA_MAP_A))

			expect(isSingleState(result)).toBeTruthy()
		})
	})

	describe("Action: SET_SINGLE_BY_NAME", () => {
		it("should select a file by name to view in single mode", () => {
			const result = files(state, setSingleByName(TEST_DELTA_MAP_A.fileMeta.fileName))

			expect(isSingleState(result)).toBeTruthy()
		})
	})

	describe("Action: SET_DELTA", () => {
		it("should select a file as reference and another as comparison", () => {
			const result = files(state, setDelta(TEST_DELTA_MAP_A, TEST_DELTA_MAP_B))

			expect(isDeltaState(result)).toBeTruthy()
		})
	})

	describe("Action: SET_DELTA_BY_NAMES", () => {
		it("should select a file as reference and another as comparison by name", () => {
			const result = files(state, setDeltaByNames(TEST_DELTA_MAP_A.fileMeta.fileName, TEST_DELTA_MAP_B.fileMeta.fileName))

			expect(isDeltaState(result)).toBeTruthy()
		})
	})

	describe("Action: SET_MULTIPLE", () => {
		it("should select two files to view in multiple mode", () => {
			const result = files(state, setMultiple([TEST_DELTA_MAP_A, TEST_DELTA_MAP_B]))

			expect(isPartialState(result)).toBeTruthy()
		})
	})

	describe("Action: SET_MULTIPLE_BY_NAMES", () => {
		it("should select two files by name to view in multiple mode", () => {
			const result = files(state, setMultipleByNames([TEST_DELTA_MAP_A.fileMeta.fileName, TEST_DELTA_MAP_B.fileMeta.fileName]))

			expect(isPartialState(result)).toBeTruthy()
		})
	})
})
