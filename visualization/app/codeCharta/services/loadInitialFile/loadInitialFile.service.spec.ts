import { HttpClient } from "@angular/common/http"
import { TestBed } from "@angular/core/testing"
import { MatDialog } from "@angular/material/dialog"
import { State, StoreModule } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { waitFor } from "@testing-library/angular"
import stringify from "safe-stable-stringify"
import { AppSettings, CcState, DynamicSettings, FileSettings } from "../../codeCharta.model"
import { FileSelectionState } from "../../model/files/files"
import { getCCFiles } from "../../model/files/files.helper"
import { MetricQueryParemter } from "../../state/effects/saveMetricsInQueryParameters/saveMetricsInQueryParameters.effect"
import { metricDataSelector } from "../../state/selectors/accumulatedData/metricData/metricData.selector"
import { setAmountOfTopLabels } from "../../state/store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { defaultAppSettings } from "../../state/store/appSettings/appSettings.reducer"
import { setAreaMetric } from "../../state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { setColorMetric } from "../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { defaultDynamicSettings } from "../../state/store/dynamicSettings/dynamicSettings.reducer"
import { setEdgeMetric } from "../../state/store/dynamicSettings/edgeMetric/edgeMetric.actions"
import { setHeightMetric } from "../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { defaultFileSettings } from "../../state/store/fileSettings/fileSettings.reducer"
import { setDelta, setFiles } from "../../state/store/files/files.actions"
import { appReducers, defaultState, setStateMiddleware } from "../../state/store/state.manager"
import { EDGE_METRIC_DATA, FILE_STATES, METRIC_DATA, TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../../util/dataMocks"
import { readCcState } from "../../util/indexedDB/indexedDBWriter"
import { getLastAction } from "../../util/testUtils/store.utils"
import { getNameDataPair } from "../loadFile/fileParser"
import { LoadFileService } from "../loadFile/loadFile.service"
import { LoadInitialFileService, sampleFile1, sampleFile2 } from "./loadInitialFile.service"
import { UrlExtractor } from "./urlExtractor"

jest.mock("./urlExtractor")
jest.mock("../../model/files/files.helper")
jest.mock("../../util/indexedDB/indexedDBWriter")

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
				provideMockStore({
					selectors: [
						{
							selector: metricDataSelector,
							value: {
								nodeMetricData: null,
								edgeMetricData: null
							}
						}
					]
				})
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

		it("should set metrics from query params if metrics are part of url", async () => {
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
			jest.mocked(UrlExtractor.prototype.getFileDataFromQueryParam).mockImplementation(
				async () => new Promise(resolve => resolve(mockedNameDataPairs))
			)
			jest.mocked(readCcState).mockImplementation(async () => new Promise(resolve => resolve(defaultState)))
			jest.mocked(getCCFiles).mockImplementation(() => mockedState.files.map(state => state.file))
			jest.mocked(UrlExtractor.prototype.getParameterByName).mockImplementation(parameter => {
				switch (parameter) {
					case MetricQueryParemter.areaMetric:
						return "mcc"
					case MetricQueryParemter.heightMetric:
						return "rloc"
					case MetricQueryParemter.colorMetric:
						return "functions"
					case MetricQueryParemter.edgeMetric:
						return "pairing_rate"
					default:
						return "-"
				}
			})
			const dispatchSpy = jest.spyOn(store, "dispatch")
			store.overrideSelector(metricDataSelector, {
				nodeMetricData: METRIC_DATA,
				edgeMetricData: EDGE_METRIC_DATA,
				nodeEdgeMetricsMap: null
			})
			store.refreshState()

			await loadInitialFileService.loadFilesOrSampleFiles()

			expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
			expect(mockedDialog.open).not.toHaveBeenCalled()

			await waitFor(() => expect(dispatchSpy).toHaveBeenCalledWith(setAreaMetric({ value: "mcc" })))
			await waitFor(() => expect(dispatchSpy).toHaveBeenCalledWith(setHeightMetric({ value: "rloc" })))
			await waitFor(() => expect(dispatchSpy).toHaveBeenCalledWith(setColorMetric({ value: "functions" })))
			await waitFor(() => expect(dispatchSpy).toHaveBeenCalledWith(setEdgeMetric({ value: "pairing_rate" })))
		})
	})

	describe("load files from indexeddb", () => {
		it("should load files from indexeddb when query params do not contain file parameter", async () => {
			const mockedState = JSON.parse(stringify(defaultState)) as CcState
			mockedState.files = FILE_STATES
			jest.mocked(UrlExtractor.prototype.getParameterByName).mockImplementation(() => null)
			jest.mocked(readCcState).mockImplementation(async () => new Promise(resolve => resolve(defaultState)))
			const savedFileStates = defaultState.files
			const savedNameDataPairs = savedFileStates.map(fileState => getNameDataPair(fileState.file))
			const dispatchSpy = jest.spyOn(store, "dispatch")
			await loadInitialFileService.loadFilesOrSampleFiles()

			expect(mockedDialog.open).not.toHaveBeenCalled()
			expect(loadFileService.loadFiles).toHaveBeenCalledWith(savedNameDataPairs)
			expect(dispatchSpy).toHaveBeenCalledWith(setFiles({ value: savedFileStates }))
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
			jest.mocked(readCcState).mockImplementation(
				async () =>
					new Promise(() => {
						throw new Error("Could not read cc-state")
					})
			)

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
