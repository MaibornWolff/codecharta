import "./revisionChooser.module"
import { RevisionChooserController } from "./revisionChooser.component"
import { FileStateService } from "../../state/fileState.service"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../../util/dataMocks"
import { FileState, FileSelectionState } from "../../codeCharta.model"
import { FileStateHelper } from "../../util/fileStateHelper"

describe("RevisionChooserController", () => {
	let fileStateService: FileStateService
	let $rootScope: IRootScopeService
	let revisionChooserController: RevisionChooserController
	let fileStates: FileState[]

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.revisionChooser")
		fileStateService = getService<FileStateService>("fileStateService")
		$rootScope = getService<IRootScopeService>("$rootScope")
		fileStates = [
			{ file: TEST_DELTA_MAP_A, selectedAs: FileSelectionState.Reference },
			{ file: TEST_DELTA_MAP_B, selectedAs: FileSelectionState.Comparison }
		]
	}

	function buildController() {
		revisionChooserController = new RevisionChooserController(fileStateService, $rootScope)
	}

	function withMockedFileStateService() {
		fileStateService = revisionChooserController["fileStateService"] = jest.fn<FileStateService>(() => {
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

		expect(FileStateService.subscribe).toHaveBeenCalledWith($rootScope, revisionChooserController)
	})

	describe("onFileSelectionStatesChanged", () => {
		beforeEach(() => {
			FileStateHelper.isSingleState = jest.fn().mockReturnValue(true)
			FileStateHelper.isPartialState = jest.fn().mockReturnValue(true)
			FileStateHelper.isDeltaState = jest.fn().mockReturnValue(true)
			FileStateHelper.getVisibleFileStates = jest.fn().mockReturnValue(fileStates)
		})

		it("should set the viewmodel and lastRenderState correctly", () => {
			revisionChooserController.onFileSelectionStatesChanged(fileStates, undefined)

			expect(FileStateHelper.isSingleState).toHaveBeenCalledWith(fileStates)
			expect(revisionChooserController["_viewModel"].isSingleState).toBeTruthy()
			expect(FileStateHelper.isPartialState).toHaveBeenCalledWith(fileStates)
			expect(revisionChooserController["_viewModel"].isPartialState).toBeTruthy()
			expect(FileStateHelper.isDeltaState).toHaveBeenCalledWith(fileStates)
			expect(revisionChooserController["_viewModel"].isDeltaState).toBeTruthy()
			expect(revisionChooserController["lastRenderState"]).toEqual(revisionChooserController["_viewModel"].renderState)
		})

		it("should update selected filenames in viewmodel correctly if single mode is active", () => {
			revisionChooserController.onFileSelectionStatesChanged(fileStates, undefined)

			expect(FileStateHelper.getVisibleFileStates).toHaveBeenCalledWith(fileStates)
			expect(revisionChooserController["_viewModel"].renderState).toEqual(FileSelectionState.Single)
			expect(revisionChooserController["_viewModel"].selectedFileNames.single).toEqual(fileStates[0].file.fileMeta.fileName)
		})

		it("should update selected filenames in viewmodel correctly if partial mode is active", () => {
			FileStateHelper.isSingleState = jest.fn().mockReturnValue(false)

			revisionChooserController.onFileSelectionStatesChanged(fileStates, undefined)

			expect(FileStateHelper.getVisibleFileStates).toHaveBeenCalledWith(fileStates)
			expect(revisionChooserController["_viewModel"].renderState).toEqual(FileSelectionState.Partial)
			expect(revisionChooserController["_viewModel"].selectedFileNames.partial).toEqual([
				TEST_DELTA_MAP_A.fileMeta.fileName,
				TEST_DELTA_MAP_B.fileMeta.fileName
			])
		})

		it("should update selected filenames in viewmodel correctly if delta mode is active with two files", () => {
			FileStateHelper.isSingleState = jest.fn().mockReturnValue(false)
			FileStateHelper.isPartialState = jest.fn().mockReturnValue(false)

			revisionChooserController.onFileSelectionStatesChanged(fileStates, undefined)

			expect(FileStateHelper.getVisibleFileStates).toHaveBeenCalledWith(fileStates)
			expect(revisionChooserController["_viewModel"].renderState).toEqual(FileSelectionState.Comparison)
			expect(revisionChooserController["_viewModel"].selectedFileNames.delta.reference).toEqual(fileStates[0].file.fileMeta.fileName)
			expect(revisionChooserController["_viewModel"].selectedFileNames.delta.comparison).toEqual(fileStates[1].file.fileMeta.fileName)
		})

		it("should update selected filenames in viewmodel correctly if delta mode is active with only one file", () => {
			FileStateHelper.isSingleState = jest.fn().mockReturnValue(false)
			FileStateHelper.isPartialState = jest.fn().mockReturnValue(false)

			fileStates.pop()

			revisionChooserController.onFileSelectionStatesChanged(fileStates, undefined)

			expect(FileStateHelper.getVisibleFileStates).toHaveBeenCalledWith(fileStates)
			expect(revisionChooserController["_viewModel"].renderState).toEqual(FileSelectionState.Comparison)
			expect(revisionChooserController["_viewModel"].selectedFileNames.delta.reference).toEqual(fileStates[0].file.fileMeta.fileName)
			expect(revisionChooserController["_viewModel"].selectedFileNames.delta.comparison).toEqual(fileStates[0].file.fileMeta.fileName)
		})

		it("should not set anything if no mode is active", () => {
			FileStateHelper.isSingleState = jest.fn().mockReturnValue(false)
			FileStateHelper.isPartialState = jest.fn().mockReturnValue(false)
			FileStateHelper.isDeltaState = jest.fn().mockReturnValue(false)

			revisionChooserController.onFileSelectionStatesChanged(fileStates, undefined)

			expect(FileStateHelper.getVisibleFileStates).toHaveBeenCalledWith(fileStates)
			expect(revisionChooserController["_viewModel"].renderState).toBeNull()
			expect(revisionChooserController["_viewModel"].selectedFileNames.delta.reference).toBeNull()
			expect(revisionChooserController["_viewModel"].selectedFileNames.delta.comparison).toBeNull()
			expect(revisionChooserController["_viewModel"].selectedFileNames.partial).toBeNull()
			expect(revisionChooserController["_viewModel"].selectedFileNames.single).toBeNull()
		})
	})

	describe("onImportedFileChange", () => {
		it("should update viewmodel with new filestates", () => {
			revisionChooserController.onImportedFilesChanged(fileStates, undefined)

			expect(revisionChooserController["_viewModel"].fileStates).toEqual(fileStates)
		})
	})

	describe("onSingleFileChange", () => {
		it("should set singleFile in fileStateService correctly", () => {
			FileStateHelper.getFileByFileName = jest.fn().mockReturnValue(TEST_DELTA_MAP_A)
			revisionChooserController.onSingleFileChange("fileA")

			expect(fileStateService.getFileStates).toHaveBeenCalled()
			expect(FileStateHelper.getFileByFileName).toHaveBeenCalledWith("fileA", [])
			expect(fileStateService.setSingle).toHaveBeenCalledWith(TEST_DELTA_MAP_A)
		})
	})

	describe("onDeltaReferenceFileChange", () => {
		it("should set referenceFile in fileStateService correctly", () => {
			FileStateHelper.getFileByFileName = jest.fn().mockReturnValue(TEST_DELTA_MAP_A)

			revisionChooserController["_viewModel"].selectedFileNames.delta.comparison = "fileB"

			revisionChooserController.onDeltaReferenceFileChange("fileA")

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

			revisionChooserController["_viewModel"].selectedFileNames.delta.reference = "fileB"

			revisionChooserController.onDeltaComparisonFileChange("fileA")

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

			revisionChooserController.onPartialFilesChange(["fileA"])

			expect(fileStateService.getFileStates).toHaveBeenCalledTimes(1)
			expect(FileStateHelper.getFileByFileName).toHaveBeenCalledTimes(1)
			expect(FileStateHelper.getFileByFileName).toHaveBeenCalledWith("fileA", [])
			expect(fileStateService.setMultiple).toHaveBeenCalledWith([TEST_DELTA_MAP_A])
		})

		it("should set fileStates in fileStateService to empty array for multiple mode when no filenames are given", () => {
			revisionChooserController.onPartialFilesChange([])

			expect(fileStateService.setMultiple).toHaveBeenCalledWith([])
		})
	})

	describe("onRenderStateChange", () => {
		it("should update the viewmodel with the last visible filename and call onSingleFileChange if single mode is active", () => {
			revisionChooserController.onSingleFileChange = jest.fn()

			revisionChooserController["lastRenderState"] = FileSelectionState.Single
			revisionChooserController["_viewModel"].selectedFileNames.single = "fileA"

			revisionChooserController.onRenderStateChange(FileSelectionState.Single)

			expect(revisionChooserController["_viewModel"].selectedFileNames.single).toEqual("fileA")
			expect(revisionChooserController.onSingleFileChange).toHaveBeenCalledWith("fileA")
		})

		it("should update the viewmodel with the last visible filename and call selectAllPartialFiles if partial mode is active", () => {
			revisionChooserController.selectAllPartialFiles = jest.fn()

			revisionChooserController.onRenderStateChange(FileSelectionState.Partial)

			expect(revisionChooserController.selectAllPartialFiles).toHaveBeenCalled()
		})

		it("should update the viewmodel with the last visible filename and call onDeltaComparisonFileChange with null if comparison mode is active", () => {
			revisionChooserController.onDeltaComparisonFileChange = jest.fn()

			revisionChooserController["lastRenderState"] = FileSelectionState.Comparison
			revisionChooserController["_viewModel"].selectedFileNames.delta.reference = "fileA"

			revisionChooserController.onRenderStateChange(FileSelectionState.Comparison)

			expect(revisionChooserController["_viewModel"].selectedFileNames.delta.reference).toEqual("fileA")
			expect(revisionChooserController.onDeltaComparisonFileChange).toHaveBeenCalledWith(null)
		})

		it("should not do anything if renderState is reference", () => {
			revisionChooserController.onDeltaComparisonFileChange = jest.fn()
			revisionChooserController.selectAllPartialFiles = jest.fn()
			revisionChooserController.onSingleFileChange = jest.fn()

			revisionChooserController.onRenderStateChange(FileSelectionState.Reference)

			expect(revisionChooserController.onDeltaComparisonFileChange).not.toHaveBeenCalled()
			expect(revisionChooserController.selectAllPartialFiles).not.toHaveBeenCalled()
			expect(revisionChooserController.onSingleFileChange).not.toHaveBeenCalled()
		})
	})

	describe("selectAllPartialFiles", () => {
		it("should call onPartialFilesChange with an array of fileNames", () => {
			revisionChooserController.onPartialFilesChange = jest.fn()
			fileStateService.getFileStates = jest.fn().mockReturnValue(fileStates)

			const expected = [TEST_DELTA_MAP_A.fileMeta.fileName, TEST_DELTA_MAP_B.fileMeta.fileName]

			revisionChooserController.selectAllPartialFiles()

			expect(revisionChooserController.onPartialFilesChange).toHaveBeenCalledWith(expected)
		})
	})

	describe("selectZeroPartialFiles", () => {
		it("should call onPartialFilesChange with an empty array", () => {
			revisionChooserController.onPartialFilesChange = jest.fn()

			revisionChooserController.selectZeroPartialFiles()

			expect(revisionChooserController.onPartialFilesChange).toHaveBeenCalledWith([])
		})
	})

	describe("invertPartialFileSelection", () => {
		it("should call onPartialFilesChange with an array of fileNames", () => {
			revisionChooserController.onPartialFilesChange = jest.fn()
			fileStates[0].selectedAs = FileSelectionState.None
			fileStateService.getFileStates = jest.fn().mockReturnValue(fileStates)

			const expected = [fileStates[0].file.fileMeta.fileName]
			revisionChooserController.invertPartialFileSelection()

			expect(revisionChooserController.onPartialFilesChange).toHaveBeenCalledWith(expected)
		})
	})
})
