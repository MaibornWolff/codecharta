import { FileStateHelper } from "./fileStateHelper"
import { FileState, FileSelectionState } from "../codeCharta.model"
import { TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "./dataMocks"

describe("fileStateHelper", () => {
	let fileStates: FileState[]

	beforeEach(() => {
		fileStates = []
		fileStates.push({ file: TEST_DELTA_MAP_A, selectedAs: FileSelectionState.None })
		fileStates.push({ file: TEST_DELTA_MAP_B, selectedAs: FileSelectionState.None })
	})

	describe("getVisibleFiles", () => {
		it("should return an empty array when no files are selected", () => {
			const result = FileStateHelper.getVisibleFiles(fileStates)

			expect(result).toEqual([])
			expect(result.length).toBe(0)
		})

		it("should return an array when all files are selected", () => {
			fileStates[0].selectedAs = FileSelectionState.Partial
			fileStates[1].selectedAs = FileSelectionState.Single

			const result = FileStateHelper.getVisibleFiles(fileStates)

			expect(result[0]).toEqual(TEST_DELTA_MAP_A)
			expect(result[1]).toEqual(TEST_DELTA_MAP_B)
			expect(result.length).toBe(2)
		})

		it("should return an array when only some files are selected", () => {
			fileStates[0].selectedAs = FileSelectionState.Partial

			const result = FileStateHelper.getVisibleFiles(fileStates)

			expect(result[0]).toEqual(TEST_DELTA_MAP_A)
			expect(result.length).toBe(1)
		})
	})

	describe("getVisibleFileStates", () => {
		it("should return an empty array when no files are selected", () => {
			const result = FileStateHelper.getVisibleFileStates(fileStates)

			expect(result).toEqual([])
			expect(result.length).toBe(0)
		})

		it("should return an array when all files are selected", () => {
			fileStates[0].selectedAs = FileSelectionState.Partial
			fileStates[1].selectedAs = FileSelectionState.Single

			const result = FileStateHelper.getVisibleFileStates(fileStates)

			expect(result[0]).toEqual(fileStates[0])
			expect(result[1]).toEqual(fileStates[1])
			expect(result.length).toBe(2)
		})

		it("should return an array when only some files are selected", () => {
			fileStates[0].selectedAs = FileSelectionState.Partial

			const result = FileStateHelper.getVisibleFileStates(fileStates)

			expect(result[0]).toEqual(fileStates[0])
			expect(result.length).toBe(1)
		})
	})

	describe("getFileByFileName", () => {
		it("should return undefined if no files match the fileName", () => {
			const result = FileStateHelper.getFileByFileName("fileC", fileStates)

			expect(result).not.toBeDefined()
		})

		it("should return the fileState if a file matches the fileName", () => {
			const result = FileStateHelper.getFileByFileName("fileA", fileStates)

			expect(result).toEqual(TEST_DELTA_MAP_A)
		})

		it("should return the first fileState found if multiple files match the fileName", () => {
			const otherMap = { ...TEST_DELTA_MAP_A, fileMeta: { ...TEST_DELTA_MAP_A.fileMeta, projectName: "Not a Sample Project" } }
			fileStates.push({ file: otherMap, selectedAs: FileSelectionState.Partial })

			const result = FileStateHelper.getFileByFileName("fileA", fileStates)

			expect(result).toEqual(TEST_DELTA_MAP_A)
		})
	})

	describe("isSingleState", () => {
		it("should return true if fileStates contains SINGLE", () => {
			fileStates.unshift({ file: TEST_DELTA_MAP_A, selectedAs: FileSelectionState.Single })

			const result = FileStateHelper.isSingleState(fileStates)

			expect(result).toBeTruthy()
		})

		it("should return false if fileStates does not contain SINGLE", () => {
			const result = FileStateHelper.isSingleState(fileStates)

			expect(result).toBeFalsy()
		})
	})

	describe("isDeltaState", () => {
		it("should return true if fileStates contains COMPARISON", () => {
			fileStates.unshift({ file: TEST_DELTA_MAP_A, selectedAs: FileSelectionState.Comparison })

			const result = FileStateHelper.isDeltaState(fileStates)

			expect(result).toBeTruthy()
		})

		it("should return true if fileStates contains REFERENCE", () => {
			fileStates.unshift({ file: TEST_DELTA_MAP_A, selectedAs: FileSelectionState.Reference })

			const result = FileStateHelper.isDeltaState(fileStates)

			expect(result).toBeTruthy()
		})

		it("should return false if the filerStates does not contain COMPARISON or REFERENCE", () => {
			const result = FileStateHelper.isDeltaState(fileStates)

			expect(result).toBeFalsy()
		})
	})

	describe("isPartialState", () => {
		it("should return true if fileStates contains PARTIAL", () => {
			fileStates.unshift({ file: TEST_DELTA_MAP_A, selectedAs: FileSelectionState.Partial })

			const result = FileStateHelper.isPartialState(fileStates)

			expect(result).toBeTruthy()
		})

		it("should return true if fileStates do not contain any state", () => {
			const result = FileStateHelper.isPartialState(fileStates)

			expect(result).toBeTruthy()
		})

		it("should return false if the first fileSelectionState is not PARTIAL or undefined", () => {
			fileStates.unshift({ file: TEST_DELTA_MAP_B, selectedAs: FileSelectionState.Single })

			const result = FileStateHelper.isPartialState(fileStates)

			expect(result).toBeFalsy()
		})
	})
})
