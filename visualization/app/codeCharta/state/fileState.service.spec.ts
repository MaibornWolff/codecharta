import { FileStateService } from "./fileState.service"
import { instantiateModule, getService } from "../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { CCFile, FileSelectionState } from "../codeCharta.model"
import { TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../util/dataMocks"

describe("FileStateService", () => {
	let fileStateService: FileStateService
	let $rootScope: IRootScopeService
	let file1: CCFile
	let file2: CCFile

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods()
	})

	function restartSystem() {
		$rootScope = getService<IRootScopeService>("$rootScope")
		file1 = TEST_DELTA_MAP_A
		file2 = TEST_DELTA_MAP_B
	}

	function rebuildService() {
		fileStateService = new FileStateService($rootScope)
	}

	function withMockedEventMethods() {
		$rootScope.$broadcast = fileStateService["$rootScope"].$broadcast = jest.fn((event, data) => {})
	}

	describe("resetMaps", () => {
		it("should reset fileStates with an empty array", () => {
            fileStateService.resetMaps()
            const result = fileStateService.getFileStates()

			expect(result).toEqual([])
			expect(result.length).toBe(0)
        })
        
        it("should reset fileStates with an empty array, even if there were entries before", () => {
            fileStateService.addFile(file1)
            fileStateService.resetMaps()
            const result = fileStateService.getFileStates()

			expect(result).toEqual([])
			expect(result.length).toBe(0)
		})
	})

	describe("addFile", () => {
		it("should add a fileState to fileStates and trigger IMPORTED_FILES_CHANGED_EVENT", () => {
            fileStateService.addFile(file1)
            const result = fileStateService.getFileStates()

			expect(result).toEqual([{ file: file1, selectedAs: FileSelectionState.None }])
			expect(result.length).toBe(1)
			expect(fileStateService["$rootScope"].$broadcast).toBeCalledWith(
				FileStateService["IMPORTED_FILES_CHANGED_EVENT"],
				result
			)
		})
	})

	describe("getCCFiles", () => {
        it("should return all added files from fileStates", () => {
            fileStateService.addFile(file1)
            fileStateService.addFile(file2)

            const result = fileStateService.getCCFiles()
            const expected = [file1, file2]

            expect(result).toEqual(expected)
            expect(result.length).toBe(2)
        })
        
        it("should return an empty array if no files are added to fileStates", () => {
            const result = fileStateService.getCCFiles()
            const expected = []

            expect(result).toEqual(expected)
            expect(result.length).toBe(0)
		})
    })

	describe("getFileStates", () => {
        it("should return all files from fileStates", () => {
            fileStateService.addFile(file1)
            const result = fileStateService.getFileStates()
            const expected = fileStateService["fileStates"]

            expect(result).toEqual(expected)
            expect(result.length).toBe(1)
        })
        
        it("should return an empty array if there are no files added to fileStates", () => {
            const result = fileStateService.getFileStates()
            const expected = fileStateService["fileStates"]

            expect(result).toEqual(expected)
            expect(result.length).toBe(0)
		})
    })

	describe("setSingle", () => {})

	describe("setDelta", () => {})

	describe("setMultiple", () => {})
})
