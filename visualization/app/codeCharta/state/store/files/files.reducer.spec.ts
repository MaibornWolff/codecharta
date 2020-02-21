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
import { Files } from "../../../model/files"
import { TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../../../util/dataMocks"
import files from "./files.reducer"

describe("files", () => {
	let state = new Files()

	beforeEach(() => {
		files(state, resetFiles())
		files(state, addFile(TEST_DELTA_MAP_A))
		files(state, addFile(TEST_DELTA_MAP_B))
	})

	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = files(undefined, {} as FilesAction)

			expect(result).toEqual(defaultFiles)
		})
	})

	describe("Action: SET_FILES", () => {
		it("should set new files", () => {
			const newFiles = new Files()
			newFiles.addFile(TEST_DELTA_MAP_A)

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

			expect(result.getFiles().length).toBe(0)
		})
	})

	describe("Action: RESET_SELECTION", () => {
		it("should unselect all files", () => {
			files(state, setSingle(TEST_DELTA_MAP_A))

			const result = files(state, resetSelection())

			expect(result.fileStatesAvailable()).toBeFalsy()
		})
	})

	describe("Action: SET_SINGLE", () => {
		it("should select a file to view in single mode", () => {
			const result = files(state, setSingle(TEST_DELTA_MAP_A))

			expect(result.isSingleState()).toBeTruthy()
		})
	})

	describe("Action: SET_SINGLE_BY_NAME", () => {
		it("should select a file by name to view in single mode", () => {
			const result = files(state, setSingleByName(TEST_DELTA_MAP_A.fileMeta.fileName))

			expect(result.isSingleState()).toBeTruthy()
		})
	})

	describe("Action: SET_DELTA", () => {
		it("should select a file as reference and another as comparison", () => {
			const result = files(state, setDelta(TEST_DELTA_MAP_A, TEST_DELTA_MAP_B))

			expect(result.isDeltaState()).toBeTruthy()
		})
	})

	describe("Action: SET_DELTA_BY_NAMES", () => {
		it("should select a file as reference and another as comparison by name", () => {
			const result = files(state, setDeltaByNames(TEST_DELTA_MAP_A.fileMeta.fileName, TEST_DELTA_MAP_B.fileMeta.fileName))

			expect(result.isDeltaState()).toBeTruthy()
		})
	})

	describe("Action: SET_MULTIPLE", () => {
		it("should select two files to view in multiple mode", () => {
			const result = files(state, setMultiple([TEST_DELTA_MAP_A, TEST_DELTA_MAP_B]))

			expect(result.isPartialState()).toBeTruthy()
		})
	})

	describe("Action: SET_MULTIPLE_BY_NAMES", () => {
		it("should select two files by name to view in multiple mode", () => {
			const result = files(state, setMultipleByNames([TEST_DELTA_MAP_A.fileMeta.fileName, TEST_DELTA_MAP_B.fileMeta.fileName]))

			expect(result.isPartialState()).toBeTruthy()
		})
	})
})
