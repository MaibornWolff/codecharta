import { FileSelectionState } from "./codeCharta.model"
import { TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../util/dataMocks"
import { Files } from "./files"

describe("files", () => {
	let files: Files

	beforeEach(() => {
		files = new Files()

		files.addFile(TEST_DELTA_MAP_A)
		files.addFile(TEST_DELTA_MAP_B)
	})

	describe("getVisibleFiles", () => {
		it("should return an empty array when no files are selected", () => {
			const result = files.getVisibleFiles()

			expect(result).toEqual([])
			expect(result.length).toBe(0)
		})

		it("should return an array when all files are selected", () => {
			files.getFiles()[0].selectedAs = FileSelectionState.Partial
			files.getFiles()[1].selectedAs = FileSelectionState.Single

			const result = files.getVisibleFiles()

			expect(result[0]).toEqual(TEST_DELTA_MAP_A)
			expect(result[1]).toEqual(TEST_DELTA_MAP_B)
			expect(result.length).toBe(2)
		})

		it("should return an array when only some files are selected", () => {
			files.getFiles()[0].selectedAs = FileSelectionState.Partial

			const result = files.getVisibleFiles()

			expect(result[0]).toEqual(TEST_DELTA_MAP_A)
			expect(result.length).toBe(1)
		})
	})

	describe("getVisibleFileStates", () => {
		it("should return an empty array when no files are selected", () => {
			const result = files.getVisibleFileStates()

			expect(result).toEqual([])
			expect(result.length).toBe(0)
		})

		it("should return an array when all files are selected", () => {
			files.getFiles()[0].selectedAs = FileSelectionState.Partial
			files.getFiles()[1].selectedAs = FileSelectionState.Single

			const result = files.getVisibleFileStates()

			expect(result[0]).toEqual(files.getFiles()[0])
			expect(result[1]).toEqual(files.getFiles()[1])
			expect(result.length).toBe(2)
		})

		it("should return an array when only some files are selected", () => {
			files.getFiles()[0].selectedAs = FileSelectionState.Partial

			const result = files.getVisibleFileStates()

			expect(result[0]).toEqual(files.getFiles()[0])
			expect(result.length).toBe(1)
		})
	})

	describe("getFileByFileName", () => {
		it("should return undefined if no files match the fileName", () => {
			const result = files.getFileByFileName("fileC")

			expect(result).not.toBeDefined()
		})

		it("should return the fileState if a file matches the fileName", () => {
			const result = files.getFileByFileName("fileA")

			expect(result).toEqual(TEST_DELTA_MAP_A)
		})

		it("should return the first fileState found if multiple files match the fileName", () => {
			files.addFile(TEST_DELTA_MAP_A)

			const result = files.getFileByFileName("fileA")

			expect(result).toEqual(TEST_DELTA_MAP_A)
		})
	})

	describe("isSingleState", () => {
		it("should return true if fileStates contains SINGLE", () => {
			files.setSingle(TEST_DELTA_MAP_A)

			const result = files.isSingleState()

			expect(result).toBeTruthy()
		})

		it("should return false if fileStates does not contain SINGLE", () => {
			const result = files.isSingleState()

			expect(result).toBeFalsy()
		})

		it("should reset the previous selection", () => {
			files.setDelta(TEST_DELTA_MAP_A, TEST_DELTA_MAP_B)
			files.setSingle(TEST_DELTA_MAP_A)

			expect(files.isSingleState()).toBeTruthy()
			expect(files.isDeltaState()).toBeFalsy()
		})
	})

	describe("isDeltaState", () => {
		it("should return true if fileStates contains COMPARISON and REFERENCE", () => {
			files.setDelta(TEST_DELTA_MAP_A, TEST_DELTA_MAP_B)

			const result = files.isDeltaState()

			expect(result).toBeTruthy()
		})

		it("should return false if the filerStates does not contain COMPARISON or REFERENCE", () => {
			const result = files.isDeltaState()

			expect(result).toBeFalsy()
		})

		it("should reset the previous selection", () => {
			files.setSingle(TEST_DELTA_MAP_A)
			files.setDelta(TEST_DELTA_MAP_A, TEST_DELTA_MAP_B)

			expect(files.isDeltaState()).toBeTruthy()
			expect(files.isSingleState()).toBeFalsy()
		})
	})

	describe("isPartialState", () => {
		it("should return true if fileStates contains PARTIAL", () => {
			files.setMultiple([TEST_DELTA_MAP_A, TEST_DELTA_MAP_B])

			const result = files.isPartialState()

			expect(result).toBeTruthy()
		})

		it("should return false if the first fileSelectionState is not PARTIAL or undefined", () => {
			const result = files.isPartialState()

			expect(result).toBeFalsy()
		})

		it("should reset the previous selection", () => {
			files.setSingle(TEST_DELTA_MAP_A)
			files.setMultiple([TEST_DELTA_MAP_A, TEST_DELTA_MAP_B])

			expect(files.isPartialState()).toBeTruthy()
			expect(files.isSingleState()).toBeFalsy()
		})
	})

	describe("getCCFiles", () => {
		it("should return all added files from fileStates", () => {
			const expected = [TEST_DELTA_MAP_A, TEST_DELTA_MAP_B]

			const result = files.getCCFiles()

			expect(result).toEqual(expected)
			expect(result.length).toBe(2)
		})

		it("should return an empty array if no files are added to fileStates", () => {
			files.reset()

			const result = files.getCCFiles()

			expect(result).toEqual([])
			expect(result.length).toBe(0)
		})
	})

	describe("setSingleByName", () => {
		it("should set FileSelectionStates correctly", () => {
			files.setSingleByName("fileA")

			expect(files.isSingleState()).toBeTruthy()
		})
	})

	describe("setDeltaByNames", () => {
		it("should set FileSelectionStates correctly", () => {
			files.setDeltaByNames("fileA", "fileB")

			expect(files.isDeltaState()).toBeTruthy()
		})
	})

	describe("setMultipleByNames", () => {
		it("should set FileSelectionStates correctly", () => {
			files.setMultipleByNames(["fileA", "fileB"])

			expect(files.isPartialState()).toBeTruthy()
		})
	})

	describe("fileStatesAvailable", () => {
		it("should be false if no file states available", () => {
			files.reset()

			expect(files.fileStatesAvailable()).toBeFalsy()
		})

		it("should be true if file states are available", () => {
			expect(files.fileStatesAvailable()).toBeTruthy()
		})
	})
})
