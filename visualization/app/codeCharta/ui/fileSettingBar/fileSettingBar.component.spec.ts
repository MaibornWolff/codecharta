import "./fileSettingBar.module"
import { FileSettingBarController } from "./fileSettingBar.component"
import { FileStateService } from "../../state/fileState.service"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../../util/dataMocks"
import { FileState, FileSelectionState } from "../../codeCharta.model"
import { FileStateHelper } from "../../util/fileStateHelper"
import { DialogService } from "../dialog/dialog.service"

describe("FileSettingBarController", () => {
	let fileStateService: FileStateService
	let $rootScope: IRootScopeService
	let fileSettingBarController: FileSettingBarController
	let dialogService: DialogService
	let fileStates: FileState[]

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.fileSettingBar")
		fileStateService = getService<FileStateService>("fileStateService")
		dialogService = getService<DialogService>("dialogService")
		$rootScope = getService<IRootScopeService>("$rootScope")
		fileStates = [
			{ file: TEST_DELTA_MAP_A, selectedAs: FileSelectionState.Reference },
			{ file: TEST_DELTA_MAP_B, selectedAs: FileSelectionState.Comparison }
		]
	}

	function buildController() {
		fileSettingBarController = new FileSettingBarController(fileStateService, $rootScope, dialogService)
	}

	function withMockedFileStateService() {
		fileStateService = fileSettingBarController["fileStateService"] = jest.fn<FileStateService>(() => {
			return {
				getFileStates: jest.fn().mockReturnValue([]),
				setSingle: jest.fn(),
				setDelta: jest.fn(),
				setMultiple: jest.fn(),
				resetMaps: jest.fn(),
				addFile: jest.fn(),
				getCCFiles: jest.fn(),
				subscribe: jest.fn()
			}
		})()
	}

	function withMockedEventMethods() {
		$rootScope.$on = jest.fn()
		$rootScope.$broadcast = jest.fn()
	}

	beforeEach(() => {
		restartSystem()
		buildController()
		withMockedFileStateService()
		withMockedEventMethods()
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	it("should subscribe to FileStateService on construction", () => {
		FileStateService.subscribe = jest.fn()

		buildController()

		expect(FileStateService.subscribe).toHaveBeenCalledWith($rootScope, fileSettingBarController)
	})

	describe("onFileSelectionStatesChanged", () => {
		beforeEach(() => {
			FileStateHelper.isSingleState = jest.fn().mockReturnValue(true)
			FileStateHelper.isPartialState = jest.fn().mockReturnValue(true)
			FileStateHelper.isDeltaState = jest.fn().mockReturnValue(true)
			FileStateHelper.getVisibleFileStates = jest.fn().mockReturnValue(fileStates)
		})

		it("should set the viewmodel and lastRenderState correctly", () => {
			fileSettingBarController.onFileSelectionStatesChanged(fileStates, undefined)

			expect(FileStateHelper.isSingleState).toHaveBeenCalledWith(fileStates)
			expect(fileSettingBarController["_viewModel"].isSingleState).toBeTruthy()
			expect(FileStateHelper.isPartialState).toHaveBeenCalledWith(fileStates)
			expect(fileSettingBarController["_viewModel"].isPartialState).toBeTruthy()
			expect(FileStateHelper.isDeltaState).toHaveBeenCalledWith(fileStates)
			expect(fileSettingBarController["_viewModel"].isDeltaState).toBeTruthy()
			expect(fileSettingBarController["lastRenderState"]).toEqual(fileSettingBarController["_viewModel"].renderState)
		})

		it("should update selected filenames in viewmodel correctly if single mode is active", () => {
			fileSettingBarController.onFileSelectionStatesChanged(fileStates, undefined)

			expect(FileStateHelper.getVisibleFileStates).toHaveBeenCalledWith(fileStates)
			expect(fileSettingBarController["_viewModel"].renderState).toEqual(FileSelectionState.Single)
			expect(fileSettingBarController["_viewModel"].selectedFileNames.single).toEqual(fileStates[0].file.fileMeta.fileName)
		})

		it("should update selected filenames in viewmodel correctly if partial mode is active", () => {
			FileStateHelper.isSingleState = jest.fn().mockReturnValue(false)

			fileSettingBarController.onFileSelectionStatesChanged(fileStates, undefined)

			expect(FileStateHelper.getVisibleFileStates).toHaveBeenCalledWith(fileStates)
			expect(fileSettingBarController["_viewModel"].renderState).toEqual(FileSelectionState.Partial)
			expect(fileSettingBarController["_viewModel"].selectedFileNames.partial).toEqual([
				TEST_DELTA_MAP_A.fileMeta.fileName,
				TEST_DELTA_MAP_B.fileMeta.fileName
			])
		})

		it("should update selected filenames in viewmodel correctly if delta mode is active with two files", () => {
			FileStateHelper.isSingleState = jest.fn().mockReturnValue(false)
			FileStateHelper.isPartialState = jest.fn().mockReturnValue(false)

			fileSettingBarController.onFileSelectionStatesChanged(fileStates, undefined)

			expect(FileStateHelper.getVisibleFileStates).toHaveBeenCalledWith(fileStates)
			expect(fileSettingBarController["_viewModel"].renderState).toEqual(FileSelectionState.Comparison)
			expect(fileSettingBarController["_viewModel"].selectedFileNames.delta.reference).toEqual(fileStates[0].file.fileMeta.fileName)
			expect(fileSettingBarController["_viewModel"].selectedFileNames.delta.comparison).toEqual(fileStates[1].file.fileMeta.fileName)
		})

		it("should update selected filenames in viewmodel correctly if delta mode is active with only one file", () => {
			FileStateHelper.isSingleState = jest.fn().mockReturnValue(false)
			FileStateHelper.isPartialState = jest.fn().mockReturnValue(false)

			fileStates.pop()

			fileSettingBarController.onFileSelectionStatesChanged(fileStates, undefined)

			expect(FileStateHelper.getVisibleFileStates).toHaveBeenCalledWith(fileStates)
			expect(fileSettingBarController["_viewModel"].renderState).toEqual(FileSelectionState.Comparison)
			expect(fileSettingBarController["_viewModel"].selectedFileNames.delta.reference).toEqual(fileStates[0].file.fileMeta.fileName)
			expect(fileSettingBarController["_viewModel"].selectedFileNames.delta.comparison).toEqual(fileStates[0].file.fileMeta.fileName)
		})

		it("should not set anything if no mode is active", () => {
			FileStateHelper.isSingleState = jest.fn().mockReturnValue(false)
			FileStateHelper.isPartialState = jest.fn().mockReturnValue(false)
			FileStateHelper.isDeltaState = jest.fn().mockReturnValue(false)

			fileSettingBarController.onFileSelectionStatesChanged(fileStates, undefined)

			expect(FileStateHelper.getVisibleFileStates).toHaveBeenCalledWith(fileStates)
			expect(fileSettingBarController["_viewModel"].renderState).toBeNull()
			expect(fileSettingBarController["_viewModel"].selectedFileNames.delta.reference).toBeNull()
			expect(fileSettingBarController["_viewModel"].selectedFileNames.delta.comparison).toBeNull()
			expect(fileSettingBarController["_viewModel"].selectedFileNames.partial).toBeNull()
			expect(fileSettingBarController["_viewModel"].selectedFileNames.single).toBeNull()
		})
	})

	describe("onImportedFileChange", () => {
		it("should update viewmodel with new filestates", () => {
			fileSettingBarController.onImportedFilesChanged(fileStates, undefined)

			expect(fileSettingBarController["_viewModel"].fileStates).toEqual(fileStates)
		})
	})

	describe("onSingleFileChange", () => {
		it("should set singleFile in fileStateService correctly", () => {
			FileStateHelper.getFileByFileName = jest.fn().mockReturnValue(TEST_DELTA_MAP_A)
			fileSettingBarController.onSingleFileChange("fileA")

			expect(fileStateService.getFileStates).toHaveBeenCalled()
			expect(FileStateHelper.getFileByFileName).toHaveBeenCalledWith("fileA", [])
			expect(fileStateService.setSingle).toHaveBeenCalledWith(TEST_DELTA_MAP_A)
		})
	})

	describe("onDeltaReferenceFileChange", () => {
		it("should set referenceFile in fileStateService correctly", () => {
			FileStateHelper.getFileByFileName = jest.fn().mockReturnValue(TEST_DELTA_MAP_A)

			fileSettingBarController["_viewModel"].selectedFileNames.delta.comparison = "fileB"

			fileSettingBarController.onDeltaReferenceFileChange("fileA")

			expect(fileStateService.getFileStates).toHaveBeenCalledTimes(2)
			expect(FileStateHelper.getFileByFileName).toHaveBeenCalledTimes(2)
			expect(FileStateHelper.getFileByFileName).toHaveBeenCalledWith("fileA", [])
			expect(FileStateHelper.getFileByFileName).toHaveBeenCalledWith("fileB", [])
			expect(fileStateService.setDelta).toHaveBeenCalledWith(TEST_DELTA_MAP_A, TEST_DELTA_MAP_A)
		})
	})

	describe("onDeltaComparisonFileChange", () => {
		it("should set comparisonFile in fileStateService correctly", () => {
			FileStateHelper.getFileByFileName = jest.fn().mockReturnValue(TEST_DELTA_MAP_A)

			fileSettingBarController["_viewModel"].selectedFileNames.delta.reference = "fileB"

			fileSettingBarController.onDeltaComparisonFileChange("fileA")

			expect(fileStateService.getFileStates).toHaveBeenCalledTimes(2)
			expect(FileStateHelper.getFileByFileName).toHaveBeenCalledTimes(2)
			expect(FileStateHelper.getFileByFileName).toHaveBeenCalledWith("fileA", [])
			expect(FileStateHelper.getFileByFileName).toHaveBeenCalledWith("fileB", [])
			expect(fileStateService.setDelta).toHaveBeenCalledWith(TEST_DELTA_MAP_A, TEST_DELTA_MAP_A)
		})
	})

	describe("onPartialFileChange", () => {
		it("should set fileStates in fileStateService correctly for multiple mode when filenames are given", () => {
			FileStateHelper.getFileByFileName = jest.fn().mockReturnValue(TEST_DELTA_MAP_A)

			fileSettingBarController.onPartialFilesChange(["fileA"])

			expect(fileStateService.getFileStates).toHaveBeenCalledTimes(1)
			expect(FileStateHelper.getFileByFileName).toHaveBeenCalledTimes(1)
			expect(FileStateHelper.getFileByFileName).toHaveBeenCalledWith("fileA", [])
			expect(fileStateService.setMultiple).toHaveBeenCalledWith([TEST_DELTA_MAP_A])
		})

		it("should set fileStates in fileStateService to empty array for multiple mode when no filenames are given", () => {
			fileSettingBarController.onPartialFilesChange([])

			expect(fileStateService.setMultiple).toHaveBeenCalledWith([])
		})
	})

	describe("onRenderStateChange", () => {
		it("should update the viewmodel with the last visible filename and call onSingleFileChange if single mode is active", () => {
			fileSettingBarController.onSingleFileChange = jest.fn()

			fileSettingBarController["lastRenderState"] = FileSelectionState.Single
			fileSettingBarController["_viewModel"].selectedFileNames.single = "fileA"

			fileSettingBarController.onRenderStateChange(FileSelectionState.Single)

			expect(fileSettingBarController["_viewModel"].selectedFileNames.single).toEqual("fileA")
			expect(fileSettingBarController.onSingleFileChange).toHaveBeenCalledWith("fileA")
		})

		it("should update the viewmodel with the last visible filename and call selectAllPartialFiles if partial mode is active", () => {
			fileSettingBarController.selectAllPartialFiles = jest.fn()

			fileSettingBarController.onRenderStateChange(FileSelectionState.Partial)

			expect(fileSettingBarController.selectAllPartialFiles).toHaveBeenCalled()
		})

		it("should update the viewmodel with the last visible filename and call onDeltaComparisonFileChange with null if comparison mode is active", () => {
			fileSettingBarController.onDeltaComparisonFileChange = jest.fn()

			fileSettingBarController["lastRenderState"] = FileSelectionState.Comparison
			fileSettingBarController["_viewModel"].selectedFileNames.delta.reference = "fileA"

			fileSettingBarController.onRenderStateChange(FileSelectionState.Comparison)

			expect(fileSettingBarController["_viewModel"].selectedFileNames.delta.reference).toEqual("fileA")
			expect(fileSettingBarController.onDeltaComparisonFileChange).toHaveBeenCalledWith(null)
		})

		it("should not do anything if renderState is reference", () => {
			fileSettingBarController.onDeltaComparisonFileChange = jest.fn()
			fileSettingBarController.selectAllPartialFiles = jest.fn()
			fileSettingBarController.onSingleFileChange = jest.fn()

			fileSettingBarController.onRenderStateChange(FileSelectionState.Reference)

			expect(fileSettingBarController.onDeltaComparisonFileChange).not.toHaveBeenCalled()
			expect(fileSettingBarController.selectAllPartialFiles).not.toHaveBeenCalled()
			expect(fileSettingBarController.onSingleFileChange).not.toHaveBeenCalled()
		})
	})

	describe("selectAllPartialFiles", () => {
		it("should call onPartialFilesChange with an array of fileNames", () => {
			fileSettingBarController.onPartialFilesChange = jest.fn()
			fileStateService.getFileStates = jest.fn().mockReturnValue(fileStates)

			const expected = [TEST_DELTA_MAP_A.fileMeta.fileName, TEST_DELTA_MAP_B.fileMeta.fileName]

			fileSettingBarController.selectAllPartialFiles()

			expect(fileSettingBarController.onPartialFilesChange).toHaveBeenCalledWith(expected)
		})
	})

	describe("selectZeroPartialFiles", () => {
		it("should call onPartialFilesChange with an empty array", () => {
			fileSettingBarController.onPartialFilesChange = jest.fn()

			fileSettingBarController.selectZeroPartialFiles()

			expect(fileSettingBarController.onPartialFilesChange).toHaveBeenCalledWith([])
		})
	})

	describe("invertPartialFileSelection", () => {
		it("should call onPartialFilesChange with an array of fileNames", () => {
			fileSettingBarController.onPartialFilesChange = jest.fn()
			fileStates[0].selectedAs = FileSelectionState.None
			fileStateService.getFileStates = jest.fn().mockReturnValue(fileStates)

			const expected = [fileStates[0].file.fileMeta.fileName]
			fileSettingBarController.invertPartialFileSelection()

			expect(fileSettingBarController.onPartialFilesChange).toHaveBeenCalledWith(expected)
		})
	})
})
