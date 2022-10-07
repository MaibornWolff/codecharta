import "./codeCharta.module"
import { TestBed } from "@angular/core/testing"
import { IHttpService, ILocationService } from "angular"
import { CodeChartaService } from "./codeCharta.service"
import { CodeChartaController } from "./codeCharta.component"
import { getService, instantiateModule } from "../../mocks/ng.mockhelper"
import { InjectorService } from "./state/injector.service"
import { StoreService } from "./state/store.service"
import { setAppSettings } from "./state/store/appSettings/appSettings.actions"
import { ThreeCameraService } from "./ui/codeMap/threeViewer/threeCamera.service"
import sample1 from "./assets/sample1.cc.json"
import sample2 from "./assets/sample2.cc.json"
import { CCFile, LayoutAlgorithm } from "./codeCharta.model"
import { GlobalSettingsHelper } from "./util/globalSettingsHelper"
import { GLOBAL_SETTINGS } from "./util/dataMocks"
import { setIsWhiteBackground } from "./state/store/appSettings/isWhiteBackground/isWhiteBackground.actions"
import { setResetCameraIfNewFileIsLoaded } from "./state/store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"
import { setHideFlatBuildings } from "./state/store/appSettings/hideFlatBuildings/hideFlatBuildings.actions"
import { setExperimentalFeaturesEnabled } from "./state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import { setLayoutAlgorithm } from "./state/store/appSettings/layoutAlgorithm/layoutAlgorithm.actions"
import { setMaxTreeMapFiles } from "./state/store/appSettings/maxTreeMapFiles/maxTreeMapFiles.actions"
import { FileSelectionState, FileState } from "./model/files/files"
import { setFiles } from "./state/store/files/files.actions"
import { MatDialog } from "@angular/material/dialog"
import { ErrorDialogComponent } from "./ui/dialogs/errorDialog/errorDialog.component"

describe("codeChartaController", () => {
	let codeChartaController: CodeChartaController
	let threeCameraService: ThreeCameraService
	let $location: ILocationService
	let $http: IHttpService
	let storeService: StoreService
	let dialog: MatDialog
	let codeChartaService: CodeChartaService
	let injectorService: InjectorService

	function restartSystem() {
		instantiateModule("app.codeCharta")

		$location = getService<ILocationService>("$location")
		$http = getService<IHttpService>("$http")
		storeService = getService<StoreService>("storeService")
		threeCameraService = TestBed.inject(ThreeCameraService)
		dialog = { open: jest.fn() } as unknown as MatDialog
		codeChartaService = { loadFiles: jest.fn() } as unknown as CodeChartaService
	}

	function rebuildController() {
		codeChartaController = new CodeChartaController($location, $http, storeService, dialog, codeChartaService, injectorService)
	}

	function withMockedUrlUtils() {
		codeChartaController["urlUtils"] = jest.fn().mockReturnValue({
			getFileDataFromQueryParam: jest.fn().mockReturnValue(Promise.resolve([])),
			getParameterByName: jest.fn().mockReturnValue(true)
		})()
	}

	function initThreeCameraService() {
		// Has to be called, to initialize the camera
		threeCameraService.init(1536, 754)
	}

	function initialize() {
		restartSystem()
		rebuildController()
		initThreeCameraService()
		withMockedUrlUtils()
		localStorage.clear()
	}

	describe("constructor", () => {
		beforeEach(() => {
			initialize()
		})
		it("should set urlUtils", () => {
			rebuildController()

			expect(codeChartaController["urlUtils"]).toBeDefined()
		})

		it("should show loading file gif", () => {
			rebuildController()

			expect(storeService.getState().appSettings.isLoadingFile).toBeTruthy()
		})
	})

	describe("loadFileOrSample", () => {
		beforeEach(() => {
			initialize()
			codeChartaController.tryLoadingSampleFiles = jest.fn()
		})

		it("should call tryLoadingSampleFiles when data is an empty array", async () => {
			// hot fix for issue #2294
			rebuildController()
			codeChartaController.tryLoadingSampleFiles = jest.fn()

			await codeChartaController.loadFileOrSample()

			expect(codeChartaController.tryLoadingSampleFiles).toHaveBeenCalledWith(new Error("Filename is missing"))
		})

		it("should call loadFiles when data is not an empty array", async () => {
			codeChartaController["urlUtils"].getFileDataFromQueryParam = jest.fn().mockReturnValue(Promise.resolve([{}]))

			await codeChartaController.loadFileOrSample()

			expect(codeChartaService.loadFiles).toHaveBeenCalledWith([{}])
		})

		it("should call storeService.dispatch if loadFiles-Promise resolves", async () => {
			codeChartaController["urlUtils"].getFileDataFromQueryParam = jest.fn().mockReturnValue(Promise.resolve([{}]))
			storeService.dispatch = jest.fn()

			await codeChartaController.loadFileOrSample()

			expect(storeService.dispatch).toHaveBeenCalledWith(setAppSettings())
		})

		it("should set the default global settings if localStorage does not exist", async () => {
			codeChartaController["urlUtils"].getFileDataFromQueryParam = jest.fn().mockReturnValue(Promise.resolve([{}]))

			await codeChartaController.loadFileOrSample()

			expect(storeService.getState().appSettings.hideFlatBuildings).toBeFalsy()
			expect(storeService.getState().appSettings.isWhiteBackground).toBeFalsy()
			expect(storeService.getState().appSettings.resetCameraIfNewFileIsLoaded).toBeTruthy()
			expect(storeService.getState().appSettings.experimentalFeaturesEnabled).toBeFalsy()
			expect(storeService.getState().appSettings.layoutAlgorithm).toEqual(LayoutAlgorithm.SquarifiedTreeMap)
			expect(storeService.getState().appSettings.maxTreeMapFiles).toEqual(100)
		})

		it("should set the global settings from localStorage", async () => {
			GlobalSettingsHelper.setGlobalSettingsInLocalStorage(GLOBAL_SETTINGS)
			codeChartaController["urlUtils"].getFileDataFromQueryParam = jest.fn().mockReturnValue(Promise.resolve([{}]))

			await codeChartaController.loadFileOrSample()

			expect(storeService.getState().appSettings.hideFlatBuildings).toBeTruthy()
			expect(storeService.getState().appSettings.isWhiteBackground).toBeTruthy()
			expect(storeService.getState().appSettings.resetCameraIfNewFileIsLoaded).toBeTruthy()
			expect(storeService.getState().appSettings.experimentalFeaturesEnabled).toBeTruthy()
			expect(storeService.getState().appSettings.layoutAlgorithm).toEqual(LayoutAlgorithm.SquarifiedTreeMap)
			expect(storeService.getState().appSettings.maxTreeMapFiles).toEqual(50)
		})
	})

	describe("tryLoadingSampleFiles", () => {
		beforeEach(() => {
			initialize()
			localStorage.clear()
		})
		it("should call getParameterByName with 'file'", () => {
			codeChartaController.tryLoadingSampleFiles(new Error("Ignored"))

			expect(codeChartaController["urlUtils"].getParameterByName).toHaveBeenCalledWith("file")
		})

		it("should call showErrorDialog when no file is found", () => {
			codeChartaController.tryLoadingSampleFiles(new Error("Actual error message"))
			expect(dialog.open).toHaveBeenCalledWith(ErrorDialogComponent, {
				data: {
					title: "Error (Actual error message)",
					message: "One or more files from the given file URL parameter could not be loaded. Loading sample files instead."
				}
			})
		})

		it("should call loadFiles with sample files", () => {
			const expected = [
				{ fileName: "sample1.cc.json", content: sample1, fileSize: 3072 },
				{ fileName: "sample2.cc.json", content: sample2, fileSize: 2048 }
			]

			codeChartaController.tryLoadingSampleFiles(new Error("Ignored"))

			expect(codeChartaService.loadFiles).toHaveBeenCalledWith(expected)
		})
		it("should set the default global settings for the sample files if localStorage does not exist", () => {
			codeChartaController.tryLoadingSampleFiles(new Error("Ignored"))

			expect(storeService.getState().appSettings.hideFlatBuildings).toBeFalsy()
			expect(storeService.getState().appSettings.isWhiteBackground).toBeFalsy()
			expect(storeService.getState().appSettings.resetCameraIfNewFileIsLoaded).toBeTruthy()
			expect(storeService.getState().appSettings.experimentalFeaturesEnabled).toBeFalsy()
			expect(storeService.getState().appSettings.layoutAlgorithm).toEqual(LayoutAlgorithm.SquarifiedTreeMap)
			expect(storeService.getState().appSettings.maxTreeMapFiles).toEqual(100)
		})

		it("should set the global settings from localStorage for sample files", () => {
			GlobalSettingsHelper.setGlobalSettingsInLocalStorage(GLOBAL_SETTINGS)

			codeChartaController.tryLoadingSampleFiles(new Error("Ignored"))

			expect(storeService.getState().appSettings.hideFlatBuildings).toBeTruthy()
			expect(storeService.getState().appSettings.isWhiteBackground).toBeTruthy()
			expect(storeService.getState().appSettings.resetCameraIfNewFileIsLoaded).toBeTruthy()
			expect(storeService.getState().appSettings.experimentalFeaturesEnabled).toBeTruthy()
			expect(storeService.getState().appSettings.layoutAlgorithm).toEqual(LayoutAlgorithm.SquarifiedTreeMap)
			expect(storeService.getState().appSettings.maxTreeMapFiles).toEqual(50)
		})

		it("should not dispatch a global setting from localStorage if the setting is currently the same", () => {
			storeService.dispatch(setHideFlatBuildings(true))
			storeService.dispatch(setIsWhiteBackground(true))
			storeService.dispatch(setResetCameraIfNewFileIsLoaded(true))
			storeService.dispatch(setExperimentalFeaturesEnabled(true))
			storeService.dispatch(setLayoutAlgorithm(LayoutAlgorithm.SquarifiedTreeMap))
			storeService.dispatch(setMaxTreeMapFiles(50))
			storeService.dispatch = jest.fn()
			GlobalSettingsHelper.setGlobalSettingsInLocalStorage(GLOBAL_SETTINGS)

			GlobalSettingsHelper.setGlobalSettingsOfLocalStorageIfExists(storeService)

			expect(storeService.dispatch).not.toHaveBeenCalled()
		})

		it("should set files to multiple mode when no 'mode' parameter is given", () => {
			const fileState: FileState[] = [{ file: {} as CCFile, selectedAs: FileSelectionState.None }]
			storeService.dispatch(setFiles(fileState))
			storeService.dispatch = jest.fn()
			codeChartaController["urlUtils"].getParameterByName = jest.fn().mockReturnValue(null)

			codeChartaController["setRenderStateFromUrl"]()

			expect(storeService.dispatch).toHaveBeenCalledWith({ payload: [{}], type: "SET_STANDARD" })
		})

		it("should set files to multiple mode when empty string is given", () => {
			const fileState: FileState[] = [{ file: {} as CCFile, selectedAs: FileSelectionState.None }]
			storeService.dispatch(setFiles(fileState))
			storeService.dispatch = jest.fn()
			codeChartaController["urlUtils"].getParameterByName = jest.fn().mockReturnValue("")

			codeChartaController["setRenderStateFromUrl"]()

			expect(storeService.dispatch).toHaveBeenCalledWith({
				payload: [{}],
				type: "SET_STANDARD"
			})
		})

		it("should set files to multiple mode when any string (except 'Delta') is given", () => {
			const fileState: FileState[] = [{ file: {} as CCFile, selectedAs: FileSelectionState.None }]
			storeService.dispatch(setFiles(fileState))
			storeService.dispatch = jest.fn()
			codeChartaController["urlUtils"].getParameterByName = jest.fn().mockReturnValue("invalidMode")

			codeChartaController["setRenderStateFromUrl"]()

			expect(storeService.dispatch).toHaveBeenCalledWith({
				payload: [{}],
				type: "SET_STANDARD"
			})
		})

		it("should set files to delta mode when 'mode=delta' parameter is given", () => {
			const fileState: FileState[] = [
				{ file: {} as CCFile, selectedAs: FileSelectionState.None },
				{ file: {} as CCFile, selectedAs: FileSelectionState.None }
			]
			storeService.dispatch(setFiles(fileState))
			storeService.dispatch = jest.fn()
			codeChartaController["urlUtils"].getParameterByName = jest.fn().mockReturnValue("Delta")

			codeChartaController["setRenderStateFromUrl"]()

			expect(storeService.dispatch).toHaveBeenCalledWith({
				payload: { comparisonFile: {}, referenceFile: {} },
				type: "SET_DELTA"
			})
		})
	})
})
