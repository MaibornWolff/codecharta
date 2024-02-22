import { HttpClient } from "@angular/common/http"
import { TestBed } from "@angular/core/testing"
import { MatDialog } from "@angular/material/dialog"
import { State, StoreModule } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import stringify from "safe-stable-stringify"
import { AppSettings, CcState, DynamicSettings, FileSettings } from "../../codeCharta.model"
import { FileSelectionState } from "../../model/files/files"
import { getCCFiles } from "../../model/files/files.helper"
import { setAmountOfTopLabels } from "../../state/store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { defaultAppSettings } from "../../state/store/appSettings/appSettings.reducer"
import { defaultDynamicSettings } from "../../state/store/dynamicSettings/dynamicSettings.reducer"
import { defaultFileSettings } from "../../state/store/fileSettings/fileSettings.reducer"
import { setDelta, setFiles } from "../../state/store/files/files.actions"
import { appReducers, defaultState, setStateMiddleware } from "../../state/store/state.manager"
import { TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../../util/dataMocks"
import { readCcState } from "../../util/indexedDB/indexedDBWriter"
import { getLastAction } from "../../util/testUtils/store.utils"
import { getNameDataPair } from "../loadFile/fileParser"
import { LoadFileService } from "../loadFile/loadFile.service"
import { LoadInitialFileService, sampleFile1, sampleFile2 } from "./loadInitialFile.service"
import { UrlExtractor } from "./urlExtractor"

jest.mock("./urlExtractor")
jest.mock("../../model/files/files.helper")
jest.mock("../../util/indexedDB/indexedDBWriter")
jest.mock("../loadFile/fileParser", () => {
	const originalModule = jest.requireActual("../loadFile/fileParser")
	return {
		...originalModule
	}
})

describe("LoadInitialFileService", () => {
	let store: MockStore
	let loadFileService: LoadFileService
	let loadInitialFileService: LoadInitialFileService
	let mockedDialog: MatDialog

	beforeEach(() => {
		mockedDialog = { open: jest.fn() } as unknown as MatDialog

		TestBed.configureTestingModule({
			imports: [[StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]],
			providers: [
				{ provide: MatDialog, useValue: mockedDialog },
				{ provide: HttpClient, useValue: {} },
				{ provide: LoadFileService, useValue: { loadFiles: jest.fn() } },
				{ provide: State, useValue: { getValue: () => defaultState } },
				provideMockStore()
			]
		})

		store = TestBed.inject(MockStore)
		loadFileService = TestBed.inject(LoadFileService)
		loadInitialFileService = TestBed.inject(LoadInitialFileService)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	describe("load file from query params", () => {
		it("should load files from query params when files query params contain valid file parameter and files are not saved in indexeddb", async () => {
			const mockedNameDataPairs = [getNameDataPair(TEST_DELTA_MAP_A)]
			jest.mocked(UrlExtractor.prototype.getParameterByName).mockImplementation(() => "filename")
			jest.mocked(UrlExtractor.prototype.getFileDataFromQueryParam).mockImplementation(
				async () => new Promise(resolve => resolve(mockedNameDataPairs))
			)
			jest.mocked(readCcState).mockImplementation(async () => new Promise(resolve => resolve(null)))
			jest.mocked(getCCFiles).mockImplementation(() => defaultState.files.map(state => state.file))

			await loadInitialFileService.loadFilesOrSampleFiles()

			expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
			expect(mockedDialog.open).not.toHaveBeenCalled()
		})

		it("should load sample files when load files from query params throws error", async () => {
			jest.mocked(UrlExtractor.prototype.getParameterByName).mockImplementation(() => "filename")
			jest.mocked(UrlExtractor.prototype.getFileDataFromQueryParam).mockImplementation(() => {
				throw new Error("files could not be loaded from query param")
			})

			await loadInitialFileService.loadFilesOrSampleFiles()

			expect(loadFileService.loadFiles).toHaveBeenCalledWith([sampleFile1, sampleFile2])
			expect(mockedDialog.open).toHaveBeenCalled()
		})

		it("should set files and then apply settings when files in query params and indexeddb are equal", async () => {
			const AMOUNT_OF_TOP_LABELS = 600
			const mockedNameDataPairs = [getNameDataPair(TEST_DELTA_MAP_A)]
			jest.mocked(UrlExtractor.prototype.getParameterByName).mockImplementation(() => "filename")
			jest.mocked(UrlExtractor.prototype.getFileDataFromQueryParam).mockImplementation(
				async () => new Promise(resolve => resolve(mockedNameDataPairs))
			)
			const mockedState = JSON.parse(stringify(defaultState)) as CcState
			mockedState.files = [
				{
					file: TEST_DELTA_MAP_B,
					selectedAs: FileSelectionState.Partial
				}
			]
			mockedState.appSettings.amountOfTopLabels = AMOUNT_OF_TOP_LABELS
			jest.mocked(readCcState).mockImplementation(async () => new Promise(resolve => resolve(mockedState)))
			jest.mocked(getCCFiles).mockImplementation(() => defaultState.files.map(state => state.file))

			await loadInitialFileService.loadFilesOrSampleFiles()

			expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
			expect(mockedDialog.open).not.toHaveBeenCalled()
			expect(await getLastAction(store)).toEqual(setAmountOfTopLabels({ value: AMOUNT_OF_TOP_LABELS }))
		})

		it("should apply settings and then set files when files in query params differ from files in indexeddb", async () => {
			const mockedNameDataPairs = [getNameDataPair(TEST_DELTA_MAP_A)]
			jest.mocked(UrlExtractor.prototype.getParameterByName).mockImplementation(() => "filename")
			jest.mocked(UrlExtractor.prototype.getFileDataFromQueryParam).mockImplementation(
				async () => new Promise(resolve => resolve(mockedNameDataPairs))
			)
			const mockedState = JSON.parse(stringify(defaultState)) as CcState
			mockedState.files = [
				{
					file: TEST_DELTA_MAP_B,
					selectedAs: FileSelectionState.Partial
				}
			]
			jest.mocked(readCcState).mockImplementation(async () => new Promise(resolve => resolve(mockedState)))
			jest.mocked(getCCFiles).mockImplementation(() => defaultState.files.map(state => state.file))

			await loadInitialFileService.loadFilesOrSampleFiles()

			expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
			expect(mockedDialog.open).not.toHaveBeenCalled()
			expect(await getLastAction(store)).toEqual({ type: "@ngrx/store/init" })
		})

		it("should set files to delta mode when 'mode=delta' parameter is given", async () => {
			const mockedNameDataPairs = [getNameDataPair(TEST_DELTA_MAP_A), getNameDataPair(TEST_DELTA_MAP_B)]
			const mockedState = JSON.parse(stringify(defaultState)) as CcState
			mockedState.files = [
				{
					file: TEST_DELTA_MAP_A,
					selectedAs: FileSelectionState.Reference
				},
				{
					file: TEST_DELTA_MAP_B,
					selectedAs: FileSelectionState.Comparison
				}
			]
			jest.mocked(UrlExtractor.prototype.getParameterByName).mockImplementation(() => "Delta")
			jest.mocked(UrlExtractor.prototype.getFileDataFromQueryParam).mockImplementation(
				async () => new Promise(resolve => resolve(mockedNameDataPairs))
			)
			jest.mocked(readCcState).mockImplementation(async () => new Promise(resolve => resolve(defaultState)))
			jest.mocked(getCCFiles).mockImplementation(() => mockedState.files.map(state => state.file))

			await loadInitialFileService.loadFilesOrSampleFiles()

			expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
			expect(mockedDialog.open).not.toHaveBeenCalled()
			expect(await getLastAction(store)).toEqual(setDelta({ referenceFile: TEST_DELTA_MAP_A, comparisonFile: TEST_DELTA_MAP_B }))
		})
	})

	describe("load files from indexeddb", () => {
		it("should load files from indexeddb when query params do not contain file parameter", async () => {
			jest.mocked(UrlExtractor.prototype.getParameterByName).mockImplementation(() => null)
			jest.mocked(readCcState).mockImplementation(async () => new Promise(resolve => resolve(defaultState)))
			await loadInitialFileService.loadFilesOrSampleFiles()

			expect(mockedDialog.open).not.toHaveBeenCalled()
			expect(await getLastAction(store)).toEqual(setFiles({ value: defaultState.files }))
		})
		it("should load sample-files when indexeddb is empty", async () => {
			jest.mocked(UrlExtractor.prototype.getParameterByName).mockImplementation(() => null)
			jest.mocked(readCcState).mockImplementation(async () => new Promise(resolve => resolve(null)))
			await loadInitialFileService.loadFilesOrSampleFiles()

			expect(loadFileService.loadFiles).toHaveBeenCalledWith([sampleFile1, sampleFile2])
			expect(mockedDialog.open).not.toHaveBeenCalled()
		})
		it("should load sample files when load files from indexeddb throws error", async () => {
			jest.mocked(UrlExtractor.prototype.getParameterByName).mockImplementation(() => null)
			jest.mocked(readCcState).mockImplementation(async () => new Promise(resolve => resolve(defaultState)))
			jest.mocked(getNameDataPair).mockImplementation(() => {
				throw new Error("could not get name-data-pair")
			})

			await loadInitialFileService.loadFilesOrSampleFiles()

			expect(loadFileService.loadFiles).toHaveBeenCalledWith([sampleFile1, sampleFile2])
			expect(mockedDialog.open).toHaveBeenCalled()
		})

		it("should set all differing fileSettings", async () => {
			const mockedNameDataPairs = [getNameDataPair(TEST_DELTA_MAP_A)]
			jest.mocked(UrlExtractor.prototype.getParameterByName).mockImplementation(() => "filename")
			jest.mocked(UrlExtractor.prototype.getFileDataFromQueryParam).mockImplementation(
				async () => new Promise(resolve => resolve(mockedNameDataPairs))
			)
			const mockedState = JSON.parse(stringify(defaultState)) as CcState
			mockedState.fileSettings = nullifyObjectValues(defaultFileSettings) as FileSettings
			jest.mocked(readCcState).mockImplementation(async () => new Promise(resolve => resolve(mockedState)))
			jest.mocked(getCCFiles).mockImplementation(() => defaultState.files.map(state => state.file))
			const dispatchSpy = jest.spyOn(store, "dispatch")

			await loadInitialFileService.loadFilesOrSampleFiles()

			expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
			expect(mockedDialog.open).not.toHaveBeenCalled()
			expect(dispatchSpy).toHaveBeenCalledTimes(countDifferences(mockedState.fileSettings, defaultFileSettings))
		})

		it("should set all differing dynamicSettings", async () => {
			const mockedNameDataPairs = [getNameDataPair(TEST_DELTA_MAP_A)]
			jest.mocked(UrlExtractor.prototype.getParameterByName).mockImplementation(() => "filename")
			jest.mocked(UrlExtractor.prototype.getFileDataFromQueryParam).mockImplementation(
				async () => new Promise(resolve => resolve(mockedNameDataPairs))
			)
			const mockedState = JSON.parse(stringify(defaultState)) as CcState
			mockedState.dynamicSettings = nullifyObjectValues(defaultDynamicSettings) as DynamicSettings
			jest.mocked(readCcState).mockImplementation(async () => new Promise(resolve => resolve(mockedState)))
			jest.mocked(getCCFiles).mockImplementation(() => defaultState.files.map(state => state.file))
			const dispatchSpy = jest.spyOn(store, "dispatch")

			await loadInitialFileService.loadFilesOrSampleFiles()

			expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
			expect(mockedDialog.open).not.toHaveBeenCalled()
			expect(dispatchSpy).toHaveBeenCalledTimes(countDifferences(mockedState.dynamicSettings, defaultDynamicSettings))
		})

		it("should set all differing  except sortingOrderAscending and isSearchPanelPinned", async () => {
			const mockedNameDataPairs = [getNameDataPair(TEST_DELTA_MAP_A)]
			jest.mocked(UrlExtractor.prototype.getParameterByName).mockImplementation(() => "filename")
			jest.mocked(UrlExtractor.prototype.getFileDataFromQueryParam).mockImplementation(
				async () => new Promise(resolve => resolve(mockedNameDataPairs))
			)
			const mockedState = JSON.parse(stringify(defaultState)) as CcState
			mockedState.appSettings = nullifyObjectValues(defaultAppSettings) as AppSettings
			jest.mocked(readCcState).mockImplementation(async () => new Promise(resolve => resolve(mockedState)))
			jest.mocked(getCCFiles).mockImplementation(() => defaultState.files.map(state => state.file))
			const dispatchSpy = jest.spyOn(store, "dispatch")

			await loadInitialFileService.loadFilesOrSampleFiles()

			expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
			expect(mockedDialog.open).not.toHaveBeenCalled()
			expect(dispatchSpy).toHaveBeenCalledTimes(countDifferences(mockedState.appSettings, defaultAppSettings) - 2)
		})
	})
})

function nullifyObjectValues(originalObject) {
	return Object.keys(originalObject).reduce((accumulator, key) => {
		accumulator[key] = null
		return accumulator
	}, {})
}

function countDifferences<T>(object1: T, object2: T): number {
	let differences = 0

	for (const key of Object.keys(object1)) {
		if (object1[key] !== object2[key]) {
			differences++
		}
	}

	return differences
}
