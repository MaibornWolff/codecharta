import { TestBed } from "@angular/core/testing"
import { HttpClient } from "@angular/common/http"
import { CCFile } from "../../codeCharta.model"
import { LoadInitialFileService } from "./loadInitialFile.service"
import { LoadFileService } from "../loadFile/loadFile.service"
import { FileSelectionState, FileState } from "../../model/files/files"
import { setFiles } from "../../state/store/files/files.actions"
import { MatDialog } from "@angular/material/dialog"
import { Store, StoreModule } from "@ngrx/store"
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

	it("should load files from local storage when files could not be loaded from query params", () => {})

	it("should load sample files when files could not be loaded from local storage", () => {})

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
