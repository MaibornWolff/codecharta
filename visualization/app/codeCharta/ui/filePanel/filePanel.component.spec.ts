import "./filePanel.module"
import { FilePanelController } from "./filePanel.component"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../../util/dataMocks"
import { FileSelectionState } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { addFile, resetFiles, resetSelection, setDelta, setMultiple, setSingle } from "../../state/store/files/files.actions"
import { FilesService } from "../../state/store/files/files.service"

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
		storeService.dispatch(setSingle(TEST_DELTA_MAP_A))
	}

	describe("constructor", () => {
		it("should subscribe to FilesService", () => {
			FilesService.subscribe = jest.fn()

			buildController()

			expect(FilesService.subscribe).toHaveBeenCalledWith($rootScope, filePanelController)
		})
	})

	describe("onFilesSelectionChanged", () => {
		it("should update viewModel with new fileStates", () => {
			filePanelController.onFilesSelectionChanged(storeService.getState().files)

			expect(filePanelController["_viewModel"].files.getFiles()).toEqual(storeService.getState().files.getFiles())
		})

		it("should set the viewModel and lastRenderState correctly", () => {
			storeService.dispatch(setDelta(TEST_DELTA_MAP_A, TEST_DELTA_MAP_B))

			filePanelController.onFilesSelectionChanged(storeService.getState().files)

			expect(filePanelController["_viewModel"].isSingleState).toBeFalsy()
			expect(filePanelController["_viewModel"].isPartialState).toBeFalsy()
			expect(filePanelController["_viewModel"].isDeltaState).toBeTruthy()
			expect(filePanelController["lastRenderState"]).toEqual(filePanelController["_viewModel"].renderState)
		})

		it("should update selected filenames in viewModel correctly if single mode is active", () => {
			storeService.dispatch(setSingle(TEST_DELTA_MAP_A))

			filePanelController.onFilesSelectionChanged(storeService.getState().files)

			expect(filePanelController["_viewModel"].renderState).toEqual(FileSelectionState.Single)
			expect(filePanelController["_viewModel"].selectedFileNames.single).toEqual(TEST_DELTA_MAP_A.fileMeta.fileName)
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
			expect(filePanelController["_viewModel"].selectedFileNames.single).toBeNull()
		})

		it("should set the pictogram colors in view model", () => {
			filePanelController.onFilesSelectionChanged(storeService.getState().files)

			expect(filePanelController["_viewModel"].pictogramFirstFileColor).toBe("#808080")
			expect(filePanelController["_viewModel"].pictogramLowerColor).toBe(storeService.getState().appSettings.mapColors.negativeDelta)
			expect(filePanelController["_viewModel"].pictogramUpperColor).toBe(storeService.getState().appSettings.mapColors.positiveDelta)
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

	describe("onSingleFileChange", () => {
		it("should set a single file in state", () => {
			filePanelController.onSingleFileChange(TEST_DELTA_MAP_B.fileMeta.fileName)

			expect(storeService.getState().files.isSingleState()).toBeTruthy()
			expect(storeService.getState().files.getVisibleFileStates()[0].selectedAs).toEqual(FileSelectionState.Single)
		})
	})

	describe("onDeltaReferenceFileChange", () => {
		it("should set referenceFile in delta mode", () => {
			filePanelController["_viewModel"].selectedFileNames.delta.comparison = TEST_DELTA_MAP_A.fileMeta.fileName

			filePanelController.onDeltaReferenceFileChange(TEST_DELTA_MAP_B.fileMeta.fileName)

			expect(storeService.getState().files.isDeltaState()).toBeTruthy()
			expect(storeService.getState().files.getVisibleFileStates()[1].selectedAs).toEqual(FileSelectionState.Reference)
		})
	})

	describe("onDeltaComparisonFileChange", () => {
		it("should set comparisonFile in delta mode", () => {
			filePanelController["_viewModel"].selectedFileNames.delta.reference = TEST_DELTA_MAP_A.fileMeta.fileName

			filePanelController.onDeltaComparisonFileChange(TEST_DELTA_MAP_B.fileMeta.fileName)

			expect(storeService.getState().files.isDeltaState()).toBeTruthy()
			expect(storeService.getState().files.getVisibleFileStates()[1].selectedAs).toEqual(FileSelectionState.Comparison)
		})
	})

	describe("onPartialFilesChange", () => {
		it("should set multiple files in multiple mode when at least one is selected", () => {
			filePanelController.onPartialFilesChange([TEST_DELTA_MAP_A.fileMeta.fileName, TEST_DELTA_MAP_B.fileMeta.fileName])

			expect(storeService.getState().files.isPartialState()).toBeTruthy()
			expect(storeService.getState().files.getVisibleFileStates()[0].selectedAs).toEqual(FileSelectionState.Partial)
			expect(storeService.getState().files.getVisibleFileStates()[1].selectedAs).toEqual(FileSelectionState.Partial)
		})
	})

	describe("onRenderStateChange", () => {
		it("should update the viewModel with the last visible filename and call onSingleFileChange if single mode is active", () => {
			filePanelController.onSingleFileChange = jest.fn()

			filePanelController["lastRenderState"] = FileSelectionState.Single
			filePanelController["_viewModel"].selectedFileNames.single = "fileA"

			filePanelController.onSingleStateSelected()

			expect(filePanelController["_viewModel"].selectedFileNames.single).toEqual("fileA")
			expect(filePanelController.onSingleFileChange).toHaveBeenCalledWith("fileA")
		})

		it("should update the viewModel with the last visible filename and call Files if partial mode is active", () => {
			filePanelController.selectAllPartialFiles = jest.fn()

			filePanelController.onPartialStateSelected()

			expect(filePanelController.selectAllPartialFiles).toHaveBeenCalled()
		})

		it("should update the viewModel with the last visible filename and call onDeltaComparisonFileChange with null if comparison mode is active", () => {
			filePanelController.onDeltaComparisonFileChange = jest.fn()

			filePanelController["lastRenderState"] = FileSelectionState.Comparison
			filePanelController["_viewModel"].selectedFileNames.delta.reference = "fileA"

			filePanelController.onDeltaStateSelected()

			expect(filePanelController["_viewModel"].selectedFileNames.delta.reference).toEqual("fileA")
			expect(filePanelController.onDeltaComparisonFileChange).toHaveBeenCalledWith(null)
		})
	})

	describe("selectAllPartialFiles", () => {
		it("should select all files and enable multiple mode", () => {
			storeService.dispatch(setMultiple([TEST_DELTA_MAP_A]))
			filePanelController.onFilesSelectionChanged(storeService.getState().files)

			filePanelController.selectAllPartialFiles()

			expect(storeService.getState().files.getVisibleFileStates()[0].selectedAs).toEqual(FileSelectionState.Partial)
			expect(storeService.getState().files.getVisibleFileStates()[1].selectedAs).toEqual(FileSelectionState.Partial)
		})
	})

	describe("selectZeroPartialFiles", () => {
		it("should only set the viewModel to prevent rendering of an empty map when nothing is selected", () => {
			storeService.dispatch(setMultiple([TEST_DELTA_MAP_A, TEST_DELTA_MAP_B]))
			filePanelController.onFilesSelectionChanged(storeService.getState().files)

			filePanelController.selectZeroPartialFiles()

			expect(storeService.getState().files.isPartialState()).toBeTruthy()
			expect(storeService.getState().files.getVisibleFileStates()[0].selectedAs).toEqual(FileSelectionState.Partial)
			expect(storeService.getState().files.getVisibleFileStates()[1].selectedAs).toEqual(FileSelectionState.Partial)
			expect(filePanelController["_viewModel"].selectedFileNames.partial).toHaveLength(0)
		})
	})

	describe("invertPartialFileSelection", () => {
		it("should invert the partially selected files", () => {
			storeService.dispatch(setMultiple([TEST_DELTA_MAP_B]))
			filePanelController.onFilesSelectionChanged(storeService.getState().files)

			filePanelController.invertPartialFileSelection()

			expect(storeService.getState().files.getFiles()[0].selectedAs).toEqual(FileSelectionState.Partial)
			expect(storeService.getState().files.getFiles()[1].selectedAs).toEqual(FileSelectionState.None)
		})
	})
})
