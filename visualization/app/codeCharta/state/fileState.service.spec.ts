import { FileStateService } from "./fileState.service"
import { getService } from "../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { CCFile, FileSelectionState } from "../codeCharta.model"
import { TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../util/dataMocks"

describe("FileStateService", () => {
	let fileStateService: FileStateService
	let $rootScope: IRootScopeService
	let file1: CCFile
	let file2: CCFile
	let file3: CCFile
	let file4: CCFile

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods()
	})

	function restartSystem() {
		$rootScope = getService<IRootScopeService>("$rootScope")

		file1 = JSON.parse(JSON.stringify(TEST_DELTA_MAP_A))
		file2 = JSON.parse((JSON.stringify(TEST_DELTA_MAP_B)))
		file3 = {...file1, fileMeta : {...file1.fileMeta, fileName: "another file"}}
		file4 = {...file1, fileMeta : {...file1.fileMeta, fileName: "another file"}}
	}

	function rebuildService() {
		fileStateService = new FileStateService($rootScope)
	}

	function withMockedEventMethods() {
		$rootScope.$broadcast = fileStateService["$rootScope"].$broadcast = jest.fn()
		$rootScope.$on = fileStateService["$rootScope"].$on = jest.fn()
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

	describe("setSingle", () => {
		it("should set FileSelectionState of the first found file to Single", () => {
			fileStateService["fileStates"] = [{file: file1, selectedAs: FileSelectionState.Single}]

			fileStateService.setSingle(file1)

			expect(fileStateService.getFileStates()[0].selectedAs).toEqual(FileSelectionState.Single)
		})

		it("should reset FileSelectionState of all files to None", () => {
			fileStateService["fileStates"] = [{file: file2, selectedAs: FileSelectionState.Partial}]

			fileStateService.setSingle(file1)

			expect(fileStateService.getFileStates()[0].selectedAs).toEqual(FileSelectionState.None)
		})

		it("should broadcast a FILE_STATE_CHANGED_EVENT", () => {
			fileStateService.setSingle(file1)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("file-selection-states-changed", fileStateService.getFileStates())
		})
	})

	describe("setDelta", () => {
		it("should set FileSelectionState of the first found file to Reference", () => {
			fileStateService["fileStates"] = [{file: file1, selectedAs: FileSelectionState.Partial},
				{file: file2 , selectedAs: FileSelectionState.Single}]

			fileStateService.setDelta(file1, file2)

			expect(fileStateService.getFileStates()[0].selectedAs).toEqual(FileSelectionState.Reference)
		})

		it("should set FileSelectionState of the first found file to Comparison", () => {
			fileStateService["fileStates"] = [{file: file1, selectedAs: FileSelectionState.Partial},
				{file: file2 , selectedAs: FileSelectionState.Single}]

			fileStateService.setDelta(file1, file2)

			expect(fileStateService.getFileStates()[1].selectedAs).toEqual(FileSelectionState.Comparison)
		})

		it("should reset FileSelectionState of all files to None", () => {
			fileStateService["fileStates"] = [{file: file3, selectedAs: FileSelectionState.Partial},
				{file: file4 , selectedAs: FileSelectionState.Single}]

			fileStateService.setDelta(file1, file2)

			expect(fileStateService.getFileStates()[0].selectedAs).toEqual(FileSelectionState.None)
			expect(fileStateService.getFileStates()[1].selectedAs).toEqual(FileSelectionState.None)
		})

		it("should broadcast a FILE_STATE_CHANGED_EVENT", () => {
			fileStateService.setDelta(file1, file2)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("file-selection-states-changed", fileStateService.getFileStates())
		})
	})

	describe("setMultiple", () => {
		it("should set FileSelectionState of the first found file to Partial", () => {
			fileStateService["fileStates"] = [{file: file1, selectedAs: FileSelectionState.Comparison},
				{file: file2 , selectedAs: FileSelectionState.Single}]

			fileStateService.setMultiple([file1])

			expect(fileStateService.getFileStates()[0].selectedAs).toEqual(FileSelectionState.Partial)
			expect(fileStateService.getFileStates()[1].selectedAs).toEqual(FileSelectionState.None)
		})

		it("should reset FileSelectionState of all files to None", () => {
			fileStateService["fileStates"] = [{file: file3, selectedAs: FileSelectionState.Partial},
				{file: file4 , selectedAs: FileSelectionState.Single}]

			fileStateService.setMultiple([file1, file2])

			expect(fileStateService.getFileStates()[0].selectedAs).toEqual(FileSelectionState.None)
			expect(fileStateService.getFileStates()[1].selectedAs).toEqual(FileSelectionState.None)
		})

		it("should broadcast a FILE_STATE_CHANGED_EVENT", () => {
			fileStateService.setMultiple([file1, file2])

			expect($rootScope.$broadcast).toHaveBeenCalledWith("file-selection-states-changed", fileStateService.getFileStates())
		})
	})

	describe("subscribe", () => {
		it("should setup two event listeners", () => {
			FileStateService.subscribe($rootScope, undefined)

			expect($rootScope.$on).toHaveBeenCalledTimes(2)
		})
	})
})
