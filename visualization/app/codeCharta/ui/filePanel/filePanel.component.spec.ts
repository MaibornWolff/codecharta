import "./filePanel.module"
import { FilePanelController } from "./filePanel.component"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { TEST_DELTA_MAP_A, TEST_DELTA_MAP_B, TEST_DELTA_MAP_C, TEST_DELTA_MAP_D } from "../../util/dataMocks"
import { StoreService } from "../../state/store.service"
import { addFile, resetFiles, resetSelection, setDelta, setMultiple, setSingle } from "../../state/store/files/files.actions"
import { FilesService } from "../../state/store/files/files.service"
import { getVisibleFileStates, isDeltaState, isPartialState } from "../../model/files/files.helper"
import { FileSelectionState } from "../../model/files/files"
import { CodeChartaService } from "../../codeCharta.service"
import { MapColorsService } from "../../state/store/appSettings/mapColors/mapColors.service"

describe("filePanelController", () => {
	let filePanelController: FilePanelController
	let $rootScope: IRootScopeService
	let storeService: StoreService

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.filePanel")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function buildController() {
		filePanelController = new FilePanelController($rootScope, storeService)
	}

	beforeEach(() => {
		restartSystem()
		buildController()
		initFiles()
	})

	function initFiles() {
		storeService.dispatch(resetFiles())
		storeService.dispatch(addFile(TEST_DELTA_MAP_A))
		storeService.dispatch(addFile(TEST_DELTA_MAP_B))
		storeService.dispatch(addFile(TEST_DELTA_MAP_C))
		storeService.dispatch(addFile(TEST_DELTA_MAP_D))
	}

	describe("constructor", () => {
		it("should subscribe to FilesService", () => {
			FilesService.subscribe = jest.fn()

			buildController()

			expect(FilesService.subscribe).toHaveBeenCalledWith($rootScope, filePanelController)
		})

		it("should subscribe to MapColorService", () => {
			MapColorsService.subscribe = jest.fn()

			buildController()

			expect(MapColorsService.subscribe).toHaveBeenCalledWith($rootScope, filePanelController)
		})
	})

	describe("onFilesSelectionChanged", () => {
		it("should update viewModel with new fileStates", () => {
			filePanelController.onFilesSelectionChanged(storeService.getState().files)

			expect(filePanelController["_viewModel"].files).toEqual(storeService.getState().files)
		})

		it("should set the viewModel and lastRenderState correctly", () => {
			storeService.dispatch(setDelta(TEST_DELTA_MAP_A, TEST_DELTA_MAP_B))

			filePanelController.onFilesSelectionChanged(storeService.getState().files)

			expect(filePanelController["_viewModel"].isPartialState).toBeFalsy()
			expect(filePanelController["_viewModel"].isDeltaState).toBeTruthy()
			expect(filePanelController["lastRenderState"]).toEqual(filePanelController["_viewModel"].renderState)
		})

		it("should update selected filenames in viewModel correctly if multiple mode is active", () => {
			storeService.dispatch(setMultiple([TEST_DELTA_MAP_A]))

			filePanelController.onFilesSelectionChanged(storeService.getState().files)

			expect(filePanelController["_viewModel"].renderState).toEqual(FileSelectionState.Partial)
			expect(filePanelController["_viewModel"].selectedFileNames.partial).toEqual([TEST_DELTA_MAP_A.fileMeta.fileName])
		})

		it("should update selected filenames in viewModel correctly if partial mode is active", () => {
			storeService.dispatch(setMultiple([TEST_DELTA_MAP_A, TEST_DELTA_MAP_B]))

			filePanelController.onFilesSelectionChanged(storeService.getState().files)

			expect(filePanelController["_viewModel"].renderState).toEqual(FileSelectionState.Partial)
			expect(filePanelController["_viewModel"].selectedFileNames.partial).toEqual([
				TEST_DELTA_MAP_A.fileMeta.fileName,
				TEST_DELTA_MAP_B.fileMeta.fileName
			])
		})

		it("should update selected filenames in viewModel correctly if delta mode is active with two files", () => {
			storeService.dispatch(setDelta(TEST_DELTA_MAP_A, TEST_DELTA_MAP_B))

			filePanelController.onFilesSelectionChanged(storeService.getState().files)

			expect(filePanelController["_viewModel"].renderState).toEqual(FileSelectionState.Comparison)
			expect(filePanelController["_viewModel"].selectedFileNames.delta.reference).toEqual(TEST_DELTA_MAP_A.fileMeta.fileName)
			expect(filePanelController["_viewModel"].selectedFileNames.delta.comparison).toEqual(TEST_DELTA_MAP_B.fileMeta.fileName)
		})

		it("should update selected filenames in viewModel correctly if delta mode is active with only one file", () => {
			storeService.dispatch(resetFiles())
			storeService.dispatch(addFile(TEST_DELTA_MAP_A))
			storeService.dispatch(setDelta(TEST_DELTA_MAP_A, TEST_DELTA_MAP_A))

			filePanelController.onFilesSelectionChanged(storeService.getState().files)

			expect(filePanelController["_viewModel"].renderState).toEqual(FileSelectionState.Comparison)
			expect(filePanelController["_viewModel"].selectedFileNames.delta.reference).toEqual(TEST_DELTA_MAP_A.fileMeta.fileName)
			expect(filePanelController["_viewModel"].selectedFileNames.delta.comparison).toEqual(TEST_DELTA_MAP_A.fileMeta.fileName)
		})

		it("should assume that mode is partial, when no mode is active", () => {
			storeService.dispatch(resetSelection())

			filePanelController.onFilesSelectionChanged(storeService.getState().files)

			expect(filePanelController["_viewModel"].renderState).toBe(FileSelectionState.Partial)
			expect(filePanelController["_viewModel"].selectedFileNames.delta.reference).toBeNull()
			expect(filePanelController["_viewModel"].selectedFileNames.delta.comparison).toBeNull()
			expect(filePanelController["_viewModel"].selectedFileNames.partial).toEqual([])
		})
	})

	describe("onMapColorsChanged", () => {
		it("should set default colors of delta mode in view model for pictogram", () => {
			filePanelController.onMapColorsChanged(storeService.getState().appSettings.mapColors)

			expect(filePanelController["_viewModel"].pictogramLowerColor).toBe(storeService.getState().appSettings.mapColors.negativeDelta)
			expect(filePanelController["_viewModel"].pictogramUpperColor).toBe(storeService.getState().appSettings.mapColors.positiveDelta)
		})

		it("should update colors of delta mode in view model for pictogram when colors had changed", () => {
			filePanelController["_viewModel"].pictogramLowerColor = storeService.getState().appSettings.mapColors.negativeDelta
			filePanelController["_viewModel"].pictogramUpperColor = storeService.getState().appSettings.mapColors.positiveDelta
			const testMapColors = { ...storeService.getState().appSettings.mapColors, negativeDelta: "#FFFFFF", positiveDelta: "#000000" }

			filePanelController.onMapColorsChanged(testMapColors)

			expect(filePanelController["_viewModel"].pictogramLowerColor).toBe(testMapColors.negativeDelta)
			expect(filePanelController["_viewModel"].pictogramUpperColor).toBe(testMapColors.positiveDelta)
		})
	})

	describe("onPartialSelectionClosed", () => {
		it("should set the filenames of the maps that are visible again", () => {
			storeService.dispatch(setMultiple([TEST_DELTA_MAP_A, TEST_DELTA_MAP_B]))
			filePanelController.onFilesSelectionChanged(storeService.getState().files)
			filePanelController["_viewModel"].selectedFileNames.partial = []

			filePanelController.onPartialSelectionClosed()

			expect(filePanelController["_viewModel"].selectedFileNames.partial).toEqual([
				TEST_DELTA_MAP_A.fileMeta.fileName,
				TEST_DELTA_MAP_B.fileMeta.fileName
			])
		})
	})

	describe("onDeltaReferenceFileChange", () => {
		it("should set referenceFile in delta mode and update root data", () => {
			filePanelController["_viewModel"].files = [
				{
					file: TEST_DELTA_MAP_A,
					selectedAs: FileSelectionState.None
				},
				{
					file: TEST_DELTA_MAP_B,
					selectedAs: FileSelectionState.Reference
				}
			]
			filePanelController["_viewModel"].selectedFileNames.delta.comparison = TEST_DELTA_MAP_A.fileMeta.fileName

			filePanelController.onDeltaReferenceFileChange(TEST_DELTA_MAP_B.fileMeta.fileName)

			expect(isDeltaState(storeService.getState().files)).toBeTruthy()
			expect(getVisibleFileStates(storeService.getState().files)[1].selectedAs).toEqual(FileSelectionState.Reference)

			expect(CodeChartaService.ROOT_NAME).toEqual(TEST_DELTA_MAP_B.map.name)
			expect(CodeChartaService.ROOT_PATH).toEqual(`/${TEST_DELTA_MAP_B.map.name}`)
		})
	})

	describe("onDeltaComparisonFileChange", () => {
		it("should set comparisonFile in delta mode and update root data", () => {
			filePanelController["_viewModel"].files = [
				{
					file: TEST_DELTA_MAP_A,
					selectedAs: FileSelectionState.Reference
				},
				{
					file: TEST_DELTA_MAP_B,
					selectedAs: FileSelectionState.Comparison
				}
			]
			filePanelController["_viewModel"].selectedFileNames.delta.reference = TEST_DELTA_MAP_A.fileMeta.fileName

			filePanelController.onDeltaComparisonFileChange(TEST_DELTA_MAP_B.fileMeta.fileName)

			expect(isDeltaState(storeService.getState().files)).toBeTruthy()
			expect(getVisibleFileStates(storeService.getState().files)[1].selectedAs).toEqual(FileSelectionState.Comparison)

			expect(CodeChartaService.ROOT_NAME).toEqual(TEST_DELTA_MAP_A.map.name)
			expect(CodeChartaService.ROOT_PATH).toEqual(`/${TEST_DELTA_MAP_A.map.name}`)
		})
	})

	describe("onPartialFilesChange", () => {
		it("should set multiple files in multiple mode when at least one is selected", () => {
			filePanelController.onPartialFilesChange([TEST_DELTA_MAP_A.fileMeta.fileName, TEST_DELTA_MAP_B.fileMeta.fileName])

			expect(isPartialState(storeService.getState().files)).toBeTruthy()
			expect(getVisibleFileStates(storeService.getState().files)[0].selectedAs).toEqual(FileSelectionState.Partial)
			expect(getVisibleFileStates(storeService.getState().files)[1].selectedAs).toEqual(FileSelectionState.Partial)
		})
	})

	describe("onRenderStateChange", () => {
		it("should update the viewModel with the last visible filename and call onDeltaComparisonFileChange with null if comparison mode is active", () => {
			filePanelController.onDeltaComparisonFileChange = jest.fn()

			filePanelController["lastRenderState"] = FileSelectionState.Comparison
			filePanelController["_viewModel"].selectedFileNames.delta.reference = "fileA"

			filePanelController.onDeltaStateSelected()

			expect(filePanelController["_viewModel"].selectedFileNames.delta.reference).toEqual("fileA")
			expect(filePanelController.onDeltaComparisonFileChange).toHaveBeenCalledWith(null)
		})
	})

	describe("onRemoveFile in single state", () => {
		beforeEach(() => {
			filePanelController["_viewModel"].files = [
				{
					file: TEST_DELTA_MAP_A,
					selectedAs: FileSelectionState.None
				},
				{
					file: TEST_DELTA_MAP_B,
					selectedAs: FileSelectionState.Single
				},
				{
					file: TEST_DELTA_MAP_C,
					selectedAs: FileSelectionState.None
				},
				{
					file: TEST_DELTA_MAP_D,
					selectedAs: FileSelectionState.None
				}
			]
		})

		it("should call onPartialFilesChange when partial state", () => {
			filePanelController.onPartialFilesChange = jest.fn()

			filePanelController.onRemoveFile("fileA", new Event("mouseEvent"))

			expect(filePanelController.onPartialFilesChange).toHaveBeenCalled()
		})

		it("should keep selection when a non-selected file is removed", () => {
			storeService.dispatch(setMultiple([TEST_DELTA_MAP_B]))
			filePanelController.onRemoveFile("fileA", new Event("mouseEvent"))

			const remainingFiles = storeService.getState().files
			expect(remainingFiles[0].selectedAs).toEqual(FileSelectionState.Partial)
			expect(remainingFiles[1].selectedAs).toEqual(FileSelectionState.None)
		})

		it("should select most recent file when a selected file is removed", () => {
			storeService.dispatch(setSingle(TEST_DELTA_MAP_B))
			filePanelController.onRemoveFile("fileB", new Event("mouseEvent"))

			const remainingFiles = storeService.getState().files
			const fileA = remainingFiles[0]
			const fileD = remainingFiles[2]
			expect(fileA.selectedAs).toEqual(FileSelectionState.None)
			expect(fileD.selectedAs).toEqual(FileSelectionState.Partial)
		})
	})

	describe("onRemoveFile in partial state", () => {
		beforeEach(() => {
			filePanelController["_viewModel"].files = [
				{
					file: TEST_DELTA_MAP_A,
					selectedAs: FileSelectionState.None
				},
				{
					file: TEST_DELTA_MAP_B,
					selectedAs: FileSelectionState.Partial
				},
				{
					file: TEST_DELTA_MAP_C,
					selectedAs: FileSelectionState.Partial
				},
				{
					file: TEST_DELTA_MAP_D,
					selectedAs: FileSelectionState.None
				}
			]
		})

		it("should delete file", () => {
			filePanelController.onRemoveFile("fileA", new Event("mouseEvent"))

			const remainingFiles = storeService.getState().files
			expect(remainingFiles.length).toEqual(3)
		})

		it("should not change selection when partially selected files still exist", () => {
			storeService.dispatch(setMultiple([TEST_DELTA_MAP_B, TEST_DELTA_MAP_C]))

			filePanelController.onRemoveFile("fileB", new Event("mouseEvent"))

			const remainingFiles = storeService.getState().files
			const fileA = remainingFiles[0]
			const fileC = remainingFiles[1]
			const fileD = remainingFiles[2]
			expect(fileA.selectedAs).toEqual(FileSelectionState.None)
			expect(fileC.selectedAs).toEqual(FileSelectionState.Partial)
			expect(fileD.selectedAs).toEqual(FileSelectionState.None)
		})

		it("should select most recent file when no partially selected file exists", () => {
			storeService.dispatch(setMultiple([TEST_DELTA_MAP_B, TEST_DELTA_MAP_C]))

			filePanelController.onRemoveFile("fileB", new Event("mouseEvent"))
			filePanelController.onRemoveFile("fileC", new Event("mouseEvent"))

			const remainingFiles = storeService.getState().files
			const fileA = remainingFiles[0]
			const fileD = remainingFiles[1]
			expect(fileA.selectedAs).toEqual(FileSelectionState.None)
			expect(fileD.selectedAs).toEqual(FileSelectionState.Partial)
		})

		it("should not change selection when non-selected file is removed", () => {
			storeService.dispatch(setMultiple([TEST_DELTA_MAP_B, TEST_DELTA_MAP_C]))

			filePanelController.onRemoveFile("fileA", new Event("mouseEvent"))

			const remainingFiles = storeService.getState().files
			const fileB = remainingFiles[0]
			const fileC = remainingFiles[1]
			const fileD = remainingFiles[2]
			expect(fileB.selectedAs).toEqual(FileSelectionState.Partial)
			expect(fileC.selectedAs).toEqual(FileSelectionState.Partial)
			expect(fileD.selectedAs).toEqual(FileSelectionState.None)
		})
	})

	describe("selectAllPartialFiles", () => {
		it("should select all files and enable multiple mode", () => {
			storeService.dispatch(setMultiple([TEST_DELTA_MAP_A]))
			filePanelController.onFilesSelectionChanged(storeService.getState().files)

			filePanelController.selectAllPartialFiles()

			expect(getVisibleFileStates(storeService.getState().files)[0].selectedAs).toEqual(FileSelectionState.Partial)
			expect(getVisibleFileStates(storeService.getState().files)[1].selectedAs).toEqual(FileSelectionState.Partial)
		})
	})

	describe("selectZeroPartialFiles", () => {
		it("should only set the viewModel to prevent rendering of an empty map when nothing is selected", () => {
			storeService.dispatch(setMultiple([TEST_DELTA_MAP_A, TEST_DELTA_MAP_B]))
			filePanelController.onFilesSelectionChanged(storeService.getState().files)

			filePanelController.selectZeroPartialFiles()

			expect(isPartialState(storeService.getState().files)).toBeTruthy()
			expect(getVisibleFileStates(storeService.getState().files)[0].selectedAs).toEqual(FileSelectionState.Partial)
			expect(getVisibleFileStates(storeService.getState().files)[1].selectedAs).toEqual(FileSelectionState.Partial)
			expect(filePanelController["_viewModel"].selectedFileNames.partial).toHaveLength(0)
		})
	})

	describe("invertPartialFileSelection", () => {
		it("should invert the partially selected files", () => {
			storeService.dispatch(setMultiple([TEST_DELTA_MAP_B]))
			filePanelController.onFilesSelectionChanged(storeService.getState().files)

			filePanelController.invertPartialFileSelection()

			expect(storeService.getState().files[0].selectedAs).toEqual(FileSelectionState.Partial)
			expect(storeService.getState().files[1].selectedAs).toEqual(FileSelectionState.None)
		})
	})
})
