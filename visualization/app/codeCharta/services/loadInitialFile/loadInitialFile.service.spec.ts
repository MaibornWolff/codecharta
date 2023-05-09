import { TestBed } from "@angular/core/testing"
import { HttpClient } from "@angular/common/http"
import { CCFile, LayoutAlgorithm } from "../../codeCharta.model"
import { GLOBAL_SETTINGS } from "../../util/dataMocks"
import { GlobalSettingsHelper } from "../../util/globalSettingsHelper"
import { LoadInitialFileService } from "./loadInitialFile.service"
import { LoadFileService } from "../loadFile/loadFile.service"
import { ErrorDialogComponent } from "../../ui/dialogs/errorDialog/errorDialog.component"
import sample1 from "../../assets/sample1.cc.json"
import sample2 from "../../assets/sample2.cc.json"
import { FileSelectionState, FileState } from "../../model/files/files"
import { setFiles } from "../../state/store/files/files.actions"
import { MatDialog } from "@angular/material/dialog"
import { State, Store, StoreModule } from "@ngrx/store"
import { appReducers, setStateMiddleware } from "../../state/store/state.manager"

describe("LoadInitialFileService", () => {
	let loadInitialFileService: LoadInitialFileService
	let mockedDialog: MatDialog

	beforeEach(() => {
		localStorage.clear()

		mockedDialog = { open: jest.fn() } as unknown as MatDialog
		TestBed.configureTestingModule({
			imports: [[StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]],
			providers: [
				{ provide: MatDialog, useValue: mockedDialog },
				{ provide: HttpClient, useValue: {} },
				{ provide: LoadFileService, useValue: { loadFiles: jest.fn() } }
			]
		})

		loadInitialFileService = TestBed.inject(LoadInitialFileService)
		loadInitialFileService["urlUtils"] = jest.fn().mockReturnValue({
			getFileDataFromQueryParam: jest.fn().mockReturnValue(Promise.resolve([])),
			getParameterByName: jest.fn().mockReturnValue("file=test.cc.json")
		})()
	})

	it("should set the global settings from localStorage", async () => {
		const state = TestBed.inject(State)
		GlobalSettingsHelper.setGlobalSettingsInLocalStorage(GLOBAL_SETTINGS)
		loadInitialFileService["urlUtils"].getFileDataFromQueryParam = jest.fn().mockReturnValue(Promise.resolve([{}]))

		await loadInitialFileService.loadFileOrSample()

		expect(state.getValue().appSettings.hideFlatBuildings).toBeTruthy()
		expect(state.getValue().appSettings.isWhiteBackground).toBeTruthy()
		expect(state.getValue().appSettings.resetCameraIfNewFileIsLoaded).toBeTruthy()
		expect(state.getValue().appSettings.experimentalFeaturesEnabled).toBeTruthy()
		expect(state.getValue().appSettings.layoutAlgorithm).toEqual(LayoutAlgorithm.SquarifiedTreeMap)
		expect(state.getValue().appSettings.maxTreeMapFiles).toEqual(50)
	})

	it("should show error dialog and load sample files", () => {
		const loadFileService = TestBed.inject(LoadFileService)

		loadInitialFileService["tryLoadingSampleFiles"](new Error("Actual error message"))

		expect(mockedDialog.open).toHaveBeenCalledWith(ErrorDialogComponent, {
			data: {
				title: "Error (Actual error message)",
				message: "One or more files from the given file URL parameter could not be loaded. Loading sample files instead."
			}
		})
		expect(loadFileService.loadFiles).toHaveBeenCalledWith([
			{ fileName: "sample1.cc.json", content: sample1, fileSize: 3072 },
			{ fileName: "sample2.cc.json", content: sample2, fileSize: 2048 }
		])
	})

	it("should set files to standard mode when no 'mode' parameter is given", () => {
		const store = TestBed.inject(Store)
		const fileState: FileState[] = [{ file: {} as CCFile, selectedAs: FileSelectionState.None }]
		store.dispatch(setFiles({ value: fileState }))
		store.dispatch = jest.fn()
		loadInitialFileService["urlUtils"].getParameterByName = () => ""

		loadInitialFileService["setRenderStateFromUrl"]()

		expect(store.dispatch).toHaveBeenCalledWith({ files: [{}], type: "SET_STANDARD" })
	})

	it("should set files to multiple mode when any string (except 'Delta') is given", () => {
		const store = TestBed.inject(Store)
		const fileState: FileState[] = [{ file: {} as CCFile, selectedAs: FileSelectionState.None }]
		store.dispatch(setFiles({ value: fileState }))
		store.dispatch = jest.fn()
		loadInitialFileService["urlUtils"].getParameterByName = () => "invalidMode"

		loadInitialFileService["setRenderStateFromUrl"]()

		expect(store.dispatch).toHaveBeenCalledWith({ files: [{}], type: "SET_STANDARD" })
	})

	it("should set files to delta mode when 'mode=delta' parameter is given", () => {
		const store = TestBed.inject(Store)
		const fileState: FileState[] = [{ file: {} as CCFile, selectedAs: FileSelectionState.None }]
		store.dispatch(setFiles({ value: fileState }))
		store.dispatch = jest.fn()
		loadInitialFileService["urlUtils"].getParameterByName = () => "Delta"

		loadInitialFileService["setRenderStateFromUrl"]()

		expect(store.dispatch).toHaveBeenCalledWith({ files: [{}], type: "SET_STANDARD" })
	})
})
