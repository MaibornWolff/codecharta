import "./filePanel.module"
import { FilePanelController } from "./filePanel.component"
import { FileStateService } from "../../state/fileState.service"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { SETTINGS, TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../../util/dataMocks"
import { FileState, FileSelectionState } from "../../codeCharta.model"
import { FileStateHelper } from "../../util/fileStateHelper"
import { SettingsService } from "../../state/settings.service"

describe("filePanelController", () => {
	let fileStateService: FileStateService
	let settingsService: SettingsService
	let $rootScope: IRootScopeService
	let filePanelController: FilePanelController
	let fileStates: FileState[]

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.filePanel")
		fileStateService = getService<FileStateService>("fileStateService")
		$rootScope = getService<IRootScopeService>("$rootScope")
		settingsService = getService<SettingsService>("settingsService")
		fileStates = [
			{ file: TEST_DELTA_MAP_A, selectedAs: FileSelectionState.Reference },
			{ file: TEST_DELTA_MAP_B, selectedAs: FileSelectionState.Comparison }
		]
	}

	function buildController() {
		filePanelController = new FilePanelController($rootScope, settingsService, fileStateService)
	}

	function withMockedFileStateService() {
		fileStateService = filePanelController["fileStateService"] = jest.fn<FileStateService>(() => {
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

	beforeEach(() => {
		restartSystem()
		buildController()
		withMockedFileStateService()
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	it("should subscribe to FileStateService on construction", () => {
		FileStateService.subscribe = jest.fn()

		buildController()

		expect(FileStateService.subscribe).toHaveBeenCalledWith($rootScope, filePanelController)
	})

	describe("onFileSelectionStatesChanged", () => {
		beforeEach(() => {
			FileStateHelper.isSingleState = jest.fn().mockReturnValue(true)
			FileStateHelper.isPartialState = jest.fn().mockReturnValue(true)
			FileStateHelper.isDeltaState = jest.fn().mockReturnValue(true)
			FileStateHelper.getVisibleFileStates = jest.fn().mockReturnValue(fileStates)
		})

		it("should set the viewmodel and lastRenderState correctly", () => {
			filePanelController.onFileSelectionStatesChanged(fileStates)

			expect(FileStateHelper.isSingleState).toHaveBeenCalledWith(fileStates)
			expect(filePanelController["_viewModel"].isSingleState).toBeTruthy()
			expect(FileStateHelper.isPartialState).toHaveBeenCalledWith(fileStates)
			expect(filePanelController["_viewModel"].isPartialState).toBeTruthy()
			expect(FileStateHelper.isDeltaState).toHaveBeenCalledWith(fileStates)
			expect(filePanelController["_viewModel"].isDeltaState).toBeTruthy()
			expect(filePanelController["lastRenderState"]).toEqual(filePanelController["_viewModel"].renderState)
		})

		it("should update selected filenames in viewmodel correctly if single mode is active", () => {
			filePanelController.onFileSelectionStatesChanged(fileStates)

			expect(FileStateHelper.getVisibleFileStates).toHaveBeenCalledWith(fileStates)
			expect(filePanelController["_viewModel"].renderState).toEqual(FileSelectionState.Single)
			expect(filePanelController["_viewModel"].selectedFileNames.single).toEqual(fileStates[0].file.fileMeta.fileName)
		})

		it("should update selected filenames in viewmodel correctly if partial mode is active", () => {
			FileStateHelper.isSingleState = jest.fn().mockReturnValue(false)

			filePanelController.onFileSelectionStatesChanged(fileStates)

			expect(FileStateHelper.getVisibleFileStates).toHaveBeenCalledWith(fileStates)
			expect(filePanelController["_viewModel"].renderState).toEqual(FileSelectionState.Partial)
			expect(filePanelController["_viewModel"].selectedFileNames.partial).toEqual([
				TEST_DELTA_MAP_A.fileMeta.fileName,
				TEST_DELTA_MAP_B.fileMeta.fileName
			])
		})

		it("should update selected filenames in viewmodel correctly if delta mode is active with two files", () => {
			FileStateHelper.isSingleState = jest.fn().mockReturnValue(false)
			FileStateHelper.isPartialState = jest.fn().mockReturnValue(false)

			filePanelController.onFileSelectionStatesChanged(fileStates)

			expect(FileStateHelper.getVisibleFileStates).toHaveBeenCalledWith(fileStates)
			expect(filePanelController["_viewModel"].renderState).toEqual(FileSelectionState.Comparison)
			expect(filePanelController["_viewModel"].selectedFileNames.delta.reference).toEqual(fileStates[0].file.fileMeta.fileName)
			expect(filePanelController["_viewModel"].selectedFileNames.delta.comparison).toEqual(fileStates[1].file.fileMeta.fileName)
		})

		it("should update selected filenames in viewmodel correctly if delta mode is active with only one file", () => {
			FileStateHelper.isSingleState = jest.fn().mockReturnValue(false)
			FileStateHelper.isPartialState = jest.fn().mockReturnValue(false)

			fileStates.pop()

			filePanelController.onFileSelectionStatesChanged(fileStates)

			expect(FileStateHelper.getVisibleFileStates).toHaveBeenCalledWith(fileStates)
			expect(filePanelController["_viewModel"].renderState).toEqual(FileSelectionState.Comparison)
			expect(filePanelController["_viewModel"].selectedFileNames.delta.reference).toEqual(fileStates[0].file.fileMeta.fileName)
			expect(filePanelController["_viewModel"].selectedFileNames.delta.comparison).toEqual(fileStates[0].file.fileMeta.fileName)
		})

		it("should not set anything if no mode is active", () => {
			FileStateHelper.isSingleState = jest.fn().mockReturnValue(false)
			FileStateHelper.isPartialState = jest.fn().mockReturnValue(false)
			FileStateHelper.isDeltaState = jest.fn().mockReturnValue(false)

			filePanelController.onFileSelectionStatesChanged(fileStates)

			expect(FileStateHelper.getVisibleFileStates).toHaveBeenCalledWith(fileStates)
			expect(filePanelController["_viewModel"].renderState).toBeNull()
			expect(filePanelController["_viewModel"].selectedFileNames.delta.reference).toBeNull()
			expect(filePanelController["_viewModel"].selectedFileNames.delta.comparison).toBeNull()
			expect(filePanelController["_viewModel"].selectedFileNames.partial).toBeNull()
			expect(filePanelController["_viewModel"].selectedFileNames.single).toBeNull()
		})

		it("should set the pictogram colors in view model", () => {
			filePanelController.onFileSelectionStatesChanged(fileStates)

			expect(filePanelController["_viewModel"].pictogramFirstFileColor).toBe("#808080")
			expect(filePanelController["_viewModel"].pictogramLowerColor).toBe(SETTINGS.appSettings.mapColors.negativeDelta)
			expect(filePanelController["_viewModel"].pictogramUpperColor).toBe(SETTINGS.appSettings.mapColors.positiveDelta)
		})
	})

	describe("onImportedFileChange", () => {
		it("should update viewmodel with new filestates", () => {
			filePanelController.onImportedFilesChanged(fileStates)

			expect(filePanelController["_viewModel"].fileStates).toEqual(fileStates)
		})
	})

	describe("onSingleFileChange", () => {
		it("should set singleFile in fileStateService correctly", () => {
			FileStateHelper.getFileByFileName = jest.fn().mockReturnValue(TEST_DELTA_MAP_A)
			filePanelController.onSingleFileChange("fileA")

			expect(fileStateService.getFileStates).toHaveBeenCalled()
			expect(FileStateHelper.getFileByFileName).toHaveBeenCalledWith("fileA", [])
			expect(fileStateService.setSingle).toHaveBeenCalledWith(TEST_DELTA_MAP_A)
		})
	})

	describe("onDeltaReferenceFileChange", () => {
		it("should set referenceFile in fileStateService correctly", () => {
			FileStateHelper.getFileByFileName = jest.fn().mockReturnValue(TEST_DELTA_MAP_A)

			filePanelController["_viewModel"].selectedFileNames.delta.comparison = "fileB"

			filePanelController.onDeltaReferenceFileChange("fileA")

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

			filePanelController["_viewModel"].selectedFileNames.delta.reference = "fileB"

			filePanelController.onDeltaComparisonFileChange("fileA")

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

			filePanelController.onPartialFilesChange(["fileA"])

			expect(fileStateService.getFileStates).toHaveBeenCalledTimes(1)
			expect(FileStateHelper.getFileByFileName).toHaveBeenCalledTimes(1)
			expect(FileStateHelper.getFileByFileName).toHaveBeenCalledWith("fileA", [])
			expect(fileStateService.setMultiple).toHaveBeenCalledWith([TEST_DELTA_MAP_A])
		})

		it("should set fileStates in fileStateService to empty array for multiple mode when no filenames are given", () => {
			filePanelController.onPartialFilesChange([])

			expect(fileStateService.setMultiple).toHaveBeenCalledWith([])
		})
	})

	describe("onRenderStateChange", () => {
		it("should update the viewmodel with the last visible filename and call onSingleFileChange if single mode is active", () => {
			filePanelController.onSingleFileChange = jest.fn()

			filePanelController["lastRenderState"] = FileSelectionState.Single
			filePanelController["_viewModel"].selectedFileNames.single = "fileA"

			filePanelController.onSingleStateSelected()

			expect(filePanelController["_viewModel"].selectedFileNames.single).toEqual("fileA")
			expect(filePanelController.onSingleFileChange).toHaveBeenCalledWith("fileA")
		})

		it("should update the viewmodel with the last visible filename and call selectAllPartialFiles if partial mode is active", () => {
			filePanelController.selectAllPartialFiles = jest.fn()

			filePanelController.onPartialStateSelected()

			expect(filePanelController.selectAllPartialFiles).toHaveBeenCalled()
		})

		it("should update the viewmodel with the last visible filename and call onDeltaComparisonFileChange with null if comparison mode is active", () => {
			filePanelController.onDeltaComparisonFileChange = jest.fn()

			filePanelController["lastRenderState"] = FileSelectionState.Comparison
			filePanelController["_viewModel"].selectedFileNames.delta.reference = "fileA"

			filePanelController.onDeltaStateSelected()

			expect(filePanelController["_viewModel"].selectedFileNames.delta.reference).toEqual("fileA")
			expect(filePanelController.onDeltaComparisonFileChange).toHaveBeenCalledWith(null)
		})
	})

	describe("selectAllPartialFiles", () => {
		it("should call onPartialFilesChange with an array of fileNames", () => {
			filePanelController.onPartialFilesChange = jest.fn()
			fileStateService.getFileStates = jest.fn().mockReturnValue(fileStates)

			const expected = [TEST_DELTA_MAP_A.fileMeta.fileName, TEST_DELTA_MAP_B.fileMeta.fileName]

			filePanelController.selectAllPartialFiles()

			expect(filePanelController.onPartialFilesChange).toHaveBeenCalledWith(expected)
		})
	})

	describe("selectZeroPartialFiles", () => {
		it("should call onPartialFilesChange with an empty array", () => {
			filePanelController.onPartialFilesChange = jest.fn()

			filePanelController.selectZeroPartialFiles()

			expect(filePanelController.onPartialFilesChange).toHaveBeenCalledWith([])
		})
	})

	describe("invertPartialFileSelection", () => {
		it("should call onPartialFilesChange with an array of fileNames", () => {
			filePanelController.onPartialFilesChange = jest.fn()
			fileStates[0].selectedAs = FileSelectionState.None
			fileStateService.getFileStates = jest.fn().mockReturnValue(fileStates)

			const expected = [fileStates[0].file.fileMeta.fileName]
			filePanelController.invertPartialFileSelection()

			expect(filePanelController.onPartialFilesChange).toHaveBeenCalledWith(expected)
		})
	})
})
