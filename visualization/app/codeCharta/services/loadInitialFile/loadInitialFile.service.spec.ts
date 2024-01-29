import { TestBed } from "@angular/core/testing"
import { HttpClient } from "@angular/common/http"
import { LoadInitialFileService } from "./loadInitialFile.service"
import { LoadFileService } from "../loadFile/loadFile.service"
import { MatDialog } from "@angular/material/dialog"
import { StoreModule } from "@ngrx/store"
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

	it("should set files to standard mode when no 'mode' parameter is given", () => {})

	it("should set files to multiple mode when any string (except 'Delta') is given", () => {})

	it("should set files to delta mode when 'mode=delta' parameter is given", () => {})
})
