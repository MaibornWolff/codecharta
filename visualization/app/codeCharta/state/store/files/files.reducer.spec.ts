import {
	addFile,
	defaultFiles,
	FilesAction,
	removeFile,
	setAll,
	setDelta,
	setFiles,
	setStandard,
	setStandardByNames
} from "./files.actions"
import { TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../../../util/dataMocks"
import files from "./files.reducer"
import { isDeltaState, isPartialState } from "../../../model/files/files.helper"
import { FileSelectionState, FileState } from "../../../model/files/files"

describe("files", () => {
	let state: FileState[] = []

	beforeEach(() => {
		state = []
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
			const newFiles: FileState[] = [{ file: TEST_DELTA_MAP_A, selectedAs: FileSelectionState.Partial }]

			const result = files(state, setFiles(newFiles))

			expect(result).toEqual(newFiles)
		})

		it("should set default files", () => {
			const result = files(state, setFiles())

			expect(result).toEqual(defaultFiles)
		})
	})

	describe("Action: SET_DELTA", () => {
		it("should select a file as reference and another as comparison", () => {
			const result = files(state, setDelta(TEST_DELTA_MAP_A, TEST_DELTA_MAP_B))

			expect(isDeltaState(result)).toBeTruthy()
		})
	})

	describe("Action: SET_MULTIPLE", () => {
		it("should select two files to view in multiple mode", () => {
			const result = files(state, setStandard([TEST_DELTA_MAP_A, TEST_DELTA_MAP_B]))

			expect(isPartialState(result)).toBeTruthy()
		})
	})

	describe("Action: SET_MULTIPLE_BY_NAMES", () => {
		it("should select two files by name to view in multiple mode", () => {
			const result = files(state, setStandardByNames([TEST_DELTA_MAP_A.fileMeta.fileName, TEST_DELTA_MAP_B.fileMeta.fileName]))

			expect(isPartialState(result)).toBeTruthy()
		})
	})

	describe("Action: REMOVE_FILE", () => {
		it("should remove a file", () => {
			const result = files(state, removeFile(TEST_DELTA_MAP_A.fileMeta.fileName))

			expect(result[0].file).toEqual(TEST_DELTA_MAP_B)
			expect(result.length).toBe(1)
		})

		it("should select first file as partial when there is no other file selected", () => {
			state[1].selectedAs = FileSelectionState.None
			const result = files(state, removeFile(state[0].file.fileMeta.fileName))
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
})
