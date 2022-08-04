import {
	addFile,
	defaultFiles,
	FilesAction,
	FilesSelectionActions,
	invertStandard,
	removeFile,
	setAll,
	setDelta,
	setDeltaComparison,
	setDeltaReference,
	setFiles,
	setStandard,
	setStandardByNames
} from "./files.actions"
import { TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../../../util/dataMocks"
import files from "./files.reducer"
import { isDeltaState, isPartialState } from "../../../model/files/files.helper"
import { FileSelectionState, FileState } from "../../../model/files/files"
import { clone } from "../../../util/clone"
import { isActionOfType } from "../../../util/reduxHelper"

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

		it("should be a file selection action, as file selections changes when all files are set", () => {
			expect(isActionOfType(setFiles().type, FilesSelectionActions)).toBe(true)
		})
	})

	describe("Action: SET_DELTA", () => {
		it("should select a file as reference and another as comparison", () => {
			const result = files(state, setDelta(TEST_DELTA_MAP_A, TEST_DELTA_MAP_B))

			expect(isDeltaState(result)).toBeTruthy()
		})
	})

	describe("Action: SET_STANDARD", () => {
		it("should select two files to view in multiple mode", () => {
			const result = files(state, setStandard([TEST_DELTA_MAP_A, TEST_DELTA_MAP_B]))

			expect(isPartialState(result)).toBeTruthy()
		})
	})

	describe("Action: SET_STANDARD_BY_NAMES", () => {
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

	describe("Action: SET_DELTA_REFERENCE", () => {
		it("should set delta reference file", () => {
			state[0].selectedAs = FileSelectionState.Partial
			state[1].selectedAs = FileSelectionState.Partial
			const result = files(state, setDeltaReference(state[0].file))
			expect(result[0].selectedAs).toBe(FileSelectionState.Reference)
			expect(result[1].selectedAs).toBe(FileSelectionState.None)
		})

		it("should not overwrite comparison file", () => {
			state[0].selectedAs = FileSelectionState.Reference
			state[1].selectedAs = FileSelectionState.Comparison
			state[2] = { file: clone(state[1].file), selectedAs: FileSelectionState.None }
			state[2].file.fileMeta.fileChecksum += "1"
			const result = files(state, setDeltaReference(state[2].file))
			expect(result[0].selectedAs).toBe(FileSelectionState.None)
			expect(result[1].selectedAs).toBe(FileSelectionState.Comparison)
			expect(result[2].selectedAs).toBe(FileSelectionState.Reference)
		})
	})

	describe("Action: SET_DELTA_COMPARISON", () => {
		it("should set delta comparison file", () => {
			state[0].selectedAs = FileSelectionState.Partial
			state[1].selectedAs = FileSelectionState.Reference
			const result = files(state, setDeltaComparison(state[0].file))
			expect(result[0].selectedAs).toBe(FileSelectionState.Comparison)
			expect(result[1].selectedAs).toBe(FileSelectionState.Reference)
		})

		it("should not overwrite reference file", () => {
			state[0].selectedAs = FileSelectionState.Reference
			state[1].selectedAs = FileSelectionState.Comparison
			state[2] = { file: clone(state[1].file), selectedAs: FileSelectionState.None }
			state[2].file.fileMeta.fileChecksum += "1"
			const result = files(state, setDeltaComparison(state[2].file))
			expect(result[0].selectedAs).toBe(FileSelectionState.Reference)
			expect(result[1].selectedAs).toBe(FileSelectionState.None)
			expect(result[2].selectedAs).toBe(FileSelectionState.Comparison)
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
