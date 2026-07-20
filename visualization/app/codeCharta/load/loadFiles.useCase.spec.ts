import { HttpClient } from "@angular/common/http"
import { TestBed } from "@angular/core/testing"
import { StoreModule } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import stringify from "safe-stable-stringify"
import { EDGE_METRIC_DATA, FILE_STATES, METRIC_DATA, TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../mocks/dataMocks"
import {
    CcState,
    DependencyLensSource,
    MapState,
    MetricsLensSource,
    Preferences,
    SharedView,
    SortingOption
} from "../model/codeCharta.model"
import { FileSelectionState } from "../model/files/files"
import { getCCFiles } from "../model/files/files.helper"
import { metricDataSelector } from "../renderer/renderModel/accumulatedData/metricData/metricData.selector"
import {
    DependencyLensSourceReadWindow,
    defaultDependencyLensSource
} from "../stores/dependencyLensSource/dependencyLensSource.read.facade"
import { setEdgeAttributeTypes } from "../stores/dependencyLensSource/dependencyLensSource.write.facade"
import { DomainBarReadWindow } from "../stores/domainBar/domainBar.read.facade"
import { DomainLensSourceReadWindow } from "../stores/domainLensSource/domainLensSource.read.facade"
import { FileStoreReadWindow, NO_FILES_LOADED_ERROR_MESSAGE } from "../stores/fileStore/fileStore.facade"
import { sampleFile1, sampleFile2 } from "../stores/fileStore/loaders/ccJson/sampleFiles"
import { LoadFileService } from "../stores/fileStore/loaders/ccJson/services/loadFile.service"
import { getNameDataPair } from "../stores/fileStore/loaders/ccJson/util/fileParser"
import { UrlExtractor } from "../stores/fileStore/loaders/ccJson/util/urlExtractor"
import { setCurrentFilesAreSampleFiles } from "../stores/fileStore/store/currentFilesAreSampleFiles/currentFilesAreSampleFiles.actions"
import { setDelta, setFiles } from "../stores/fileStore/store/files.actions"
import { filesLoaded } from "../stores/fileStore/store/filesLoaded/filesLoaded.actions"
import { setIsLoadingFile } from "../stores/fileStore/store/isLoadingFile/isLoadingFile.actions"
import { defaultMapState, MapStateReadWindow } from "../stores/mapState/mapState.read.facade"
import { setAreaMetric, setColorRange, setLayoutAlgorithm } from "../stores/mapState/mapState.write.facade"
import { defaultMetricsLensSource, MetricsLensSourceReadWindow } from "../stores/metricsLensSource/metricsLensSource.read.facade"
import { setAttributeDescriptors, setAttributeTypes } from "../stores/metricsLensSource/metricsLensSource.write.facade"
import { defaultPreferences, PreferencesReadWindow } from "../stores/preferences/preferences.read.facade"
import { setSortingOption } from "../stores/preferences/preferences.write.facade"
import { CcStateSnapshot } from "../stores/rootStore/ccState.snapshot"
import { defaultState } from "../stores/rootStore/state.manager"
import { appReducers, setStateMiddleware } from "../stores/rootStore/store"
import { defaultSharedView, SharedViewReadWindow } from "../stores/sharedView/sharedView.read.facade"
import { ErrorDialogService } from "../util/errorDialog/errorDialog.service"
import { NO_URL_METRICS, UrlMetricSelection } from "../util/queryParameter/queryParameter"
import { QueryParamsService } from "../util/queryParameter/queryParams.service"
import { LoadFilesUseCase } from "./loadFiles.useCase"
import { CcStatePersistence, PersistedCcStateRead } from "./services/ccStatePersistence"

jest.mock("../stores/fileStore/loaders/ccJson/util/urlExtractor")
jest.mock("../model/files/files.helper")

const URL_LOAD_ERROR_TITLE = "File(s) could not be loaded from the given file URL parameter. Loaded sample files instead."
const INDEXED_DB_LOAD_ERROR_TITLE = "Previously loaded files and settings could not be restored. Loaded sample files instead."
const MISSING_PROPERTIES_ERROR_TITLE =
    "The previous state could not be fully restored after loading the page. The following properties were not restored."

// Every boot frames its settings-restore with exactly two dispatches that are not settings:
// the loading indicator going up, and the single `filesLoaded` provenance signal of the commit.
const FRAMING_DISPATCH_COUNT = 2

describe("LoadFilesUseCase", () => {
    let store: MockStore
    let loadFileService: LoadFileService
    let loadFilesUseCase: LoadFilesUseCase
    let mockedErrorDialogService: ErrorDialogService
    let mockedQueryParamsService: jest.Mocked<QueryParamsService>
    let mockedCcStatePersistence: jest.Mocked<CcStatePersistence>
    let mockedUrlExtractor: UrlExtractor

    const mockUrlWithFile = (options: { renderMode?: string; areSampleFiles?: boolean; metrics?: UrlMetricSelection } = {}) => {
        mockedQueryParamsService.hasFile.mockReturnValue(true)
        mockedQueryParamsService.getFileNames.mockReturnValue(["filename"])
        mockedQueryParamsService.getRenderMode.mockReturnValue(options.renderMode ?? null)
        mockedQueryParamsService.areSampleFilesFlagged.mockReturnValue(options.areSampleFiles ?? false)
        mockedQueryParamsService.getMetrics.mockReturnValue(options.metrics ?? NO_URL_METRICS)
    }

    const mockUrlWithoutFile = () => {
        mockedQueryParamsService.hasFile.mockReturnValue(false)
        mockedQueryParamsService.getFileNames.mockReturnValue([])
        mockedQueryParamsService.getRenderMode.mockReturnValue(null)
        mockedQueryParamsService.areSampleFilesFlagged.mockReturnValue(false)
        mockedQueryParamsService.getMetrics.mockReturnValue(NO_URL_METRICS)
    }

    const mockUrlFiles = (nameDataPairs: ReturnType<typeof getNameDataPair>[]) => {
        jest.mocked(mockedUrlExtractor.getFileDataFromFileNames).mockResolvedValue(nameDataPairs)
    }

    const mockUrlLoadError = (error: Error) => {
        jest.mocked(mockedUrlExtractor.getFileDataFromFileNames).mockImplementation(() => {
            throw error
        })
    }

    const mockPersistedState = (state: CcState | null) => {
        mockedCcStatePersistence.read.mockResolvedValue({ state, error: null })
    }

    const mockPersistedReadError = (error: Error) => {
        mockedCcStatePersistence.read.mockResolvedValue({ state: null, error })
    }

    const dispatchedTypes = (dispatchSpy: jest.SpyInstance) => dispatchSpy.mock.calls.map(call => call[0].type)

    beforeEach(() => {
        mockedErrorDialogService = { open: jest.fn() } as unknown as ErrorDialogService
        mockedQueryParamsService = {
            hasFile: jest.fn(() => false),
            getFileNames: jest.fn(() => []),
            getRenderMode: jest.fn(() => null),
            getMetrics: jest.fn(() => NO_URL_METRICS),
            areSampleFilesFlagged: jest.fn(() => false),
            write: jest.fn()
        } as unknown as jest.Mocked<QueryParamsService>
        mockedCcStatePersistence = {
            read: jest.fn(async (): Promise<PersistedCcStateRead> => ({ state: null, error: null })),
            delete: jest.fn()
        } as unknown as jest.Mocked<CcStatePersistence>
        mockedUrlExtractor = new UrlExtractor({} as HttpClient)

        TestBed.configureTestingModule({
            imports: [[StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]],
            providers: [
                { provide: ErrorDialogService, useValue: mockedErrorDialogService },
                { provide: QueryParamsService, useValue: mockedQueryParamsService },
                { provide: CcStatePersistence, useValue: mockedCcStatePersistence },
                { provide: UrlExtractor, useValue: mockedUrlExtractor },
                { provide: HttpClient, useValue: {} },
                { provide: LoadFileService, useValue: { loadFiles: jest.fn() } },
                { provide: CcStateSnapshot, useValue: { get: () => defaultState } },
                { provide: PreferencesReadWindow, useValue: { getPreferences: () => defaultState.preferences } },
                {
                    provide: MetricsLensSourceReadWindow,
                    useValue: { getMetricsLensSource: () => defaultState.metricsLensSource }
                },
                {
                    provide: DependencyLensSourceReadWindow,
                    useValue: { getDependencyLensSource: () => defaultState.dependencyLensSource }
                },
                {
                    provide: DomainLensSourceReadWindow,
                    useValue: { getDomainLensSource: () => defaultState.domainLensSource }
                },
                { provide: DomainBarReadWindow, useValue: { getDomainBar: () => defaultState.domainBar } },
                { provide: SharedViewReadWindow, useValue: { getSharedView: () => defaultState.sharedView } },
                { provide: MapStateReadWindow, useValue: { getMapState: () => defaultState.mapState } },
                { provide: FileStoreReadWindow, useValue: { getFiles: () => defaultState.files } },
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
        loadFilesUseCase = TestBed.inject(LoadFilesUseCase)
        jest.mocked(getCCFiles).mockImplementation(() => defaultState.files.map(state => state.file))
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe("load files from query params", () => {
        it("should load files from query params when files query params contain valid file parameter and files are not saved in indexeddb", async () => {
            // Arrange
            const mockedNameDataPairs = [getNameDataPair(TEST_DELTA_MAP_A)]
            mockUrlWithFile()
            mockUrlFiles(mockedNameDataPairs)
            mockPersistedState(null)

            // Act
            await loadFilesUseCase.loadOnBoot()

            // Assert
            expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
            expect(mockedErrorDialogService.open).not.toHaveBeenCalled()
        })

        it("should dispatch filesLoaded last when files are loaded from query params", async () => {
            // Arrange
            const dispatchSpy = jest.spyOn(store, "dispatch")
            mockUrlWithFile()
            mockUrlFiles([getNameDataPair(TEST_DELTA_MAP_A)])
            mockPersistedState(null)

            // Act
            await loadFilesUseCase.loadOnBoot()

            // Assert
            expect(dispatchedTypes(dispatchSpy)).toEqual([setIsLoadingFile.type, filesLoaded.type])
            expect(dispatchSpy).toHaveBeenCalledWith(
                expect.objectContaining({ type: filesLoaded.type, source: "url", areSampleFiles: false, restoredSettings: null })
            )
        })

        it("should load sample files when load files from query params throws error", async () => {
            // Arrange
            mockUrlWithFile()
            mockUrlLoadError(new Error("files could not be loaded from query param"))

            // Act
            await loadFilesUseCase.loadOnBoot()

            // Assert
            expect(loadFileService.loadFiles).toHaveBeenCalledWith([sampleFile1, sampleFile2])
            expect(mockedErrorDialogService.open).toHaveBeenCalledWith({
                title: URL_LOAD_ERROR_TITLE,
                message: "Error (files could not be loaded from query param)"
            })
        })

        it("should not open an error dialog when no files were loaded at all", async () => {
            // Arrange
            mockUrlWithFile()
            mockUrlLoadError(new Error(NO_FILES_LOADED_ERROR_MESSAGE))

            // Act
            await loadFilesUseCase.loadOnBoot()

            // Assert
            expect(loadFileService.loadFiles).toHaveBeenCalledWith([sampleFile1, sampleFile2])
            expect(mockedErrorDialogService.open).not.toHaveBeenCalled()
        })

        it("should read the persisted state exactly once when a url load falls back to sample files", async () => {
            // Arrange
            mockUrlWithFile()
            mockPersistedState(JSON.parse(stringify(defaultState)) as CcState)
            mockUrlLoadError(new Error("files could not be loaded from query param"))

            // Act
            await loadFilesUseCase.loadOnBoot()

            // Assert
            expect(mockedCcStatePersistence.read).toHaveBeenCalledTimes(1)
            expect(loadFileService.loadFiles).toHaveBeenCalledWith([sampleFile1, sampleFile2])
        })

        it("should not reject when applying a broken persisted state fails while loading sample files", async () => {
            // Arrange
            const brokenState = JSON.parse(stringify(defaultState)) as CcState
            brokenState.preferences = 42 as unknown as Preferences
            mockUrlWithFile()
            mockPersistedState(brokenState)
            mockUrlLoadError(new Error("files could not be loaded from query param"))

            // Act
            const loading = loadFilesUseCase.loadOnBoot()

            // Assert
            await expect(loading).resolves.toBeUndefined()
            expect(loadFileService.loadFiles).toHaveBeenCalledWith([sampleFile1, sampleFile2])
        })

        it("should dispatch currentFilesAreSampleFiles when query param currentFilesAreSampleFiles is true", async () => {
            // Arrange
            const dispatchSpy = jest.spyOn(store, "dispatch")
            mockUrlWithFile({ areSampleFiles: true })
            mockUrlFiles([getNameDataPair(TEST_DELTA_MAP_A)])

            // Act
            await loadFilesUseCase.loadOnBoot()

            // Assert
            expect(dispatchSpy).toHaveBeenCalledWith(setCurrentFilesAreSampleFiles({ value: true }))
        })

        it("should not dispatch currentFilesAreSampleFiles when query param currentFilesAreSampleFiles is not existent", async () => {
            // Arrange
            const dispatchSpy = jest.spyOn(store, "dispatch")
            mockUrlWithFile()
            mockUrlFiles([getNameDataPair(TEST_DELTA_MAP_A)])

            // Act
            await loadFilesUseCase.loadOnBoot()

            // Assert
            expect(dispatchSpy).not.toHaveBeenCalledWith(setCurrentFilesAreSampleFiles({ value: true }))
            expect(dispatchSpy).not.toHaveBeenCalledWith(setCurrentFilesAreSampleFiles({ value: false }))
        })

        it("should set currentFilesAreSampleFiles to true if sample files are loaded", async () => {
            // Arrange
            const dispatchSpy = jest.spyOn(store, "dispatch")
            mockUrlWithFile()
            mockUrlLoadError(new Error("files could not be loaded from query param"))

            // Act
            await loadFilesUseCase.loadOnBoot()

            // Assert
            expect(dispatchSpy).toHaveBeenCalledWith(setCurrentFilesAreSampleFiles({ value: true }))
        })

        it("should apply preferences and map state, then set files, then apply the remaining settings when files in query params and indexeddb are equal", async () => {
            // Arrange
            const AMOUNT_OF_TOP_LABELS = 600
            const mockedNameDataPairs = [getNameDataPair(TEST_DELTA_MAP_A)]
            const savedFileStates = [{ file: TEST_DELTA_MAP_A, selectedAs: FileSelectionState.Partial }]
            mockUrlWithFile()
            mockUrlFiles(mockedNameDataPairs)
            const mockedState = JSON.parse(stringify(defaultState)) as CcState
            mockedState.files = savedFileStates
            mockedState.mapState.amountOfTopLabels = AMOUNT_OF_TOP_LABELS
            mockPersistedState(mockedState)
            const dispatchSpy = jest.spyOn(store, "dispatch")

            // Act
            await loadFilesUseCase.loadOnBoot()

            // Assert
            expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
            expect(mockedErrorDialogService.open).not.toHaveBeenCalled()
            // asserted as a plain action literal (not the setAmountOfTopLabels creator): amountOfTopLabels
            // now lives in the appearance module, which fileStore must not import (filestore-has-no-upward-deps)
            expect(dispatchSpy).toHaveBeenCalledWith({ type: "SET_AMOUNT_OF_TOP_LABELS", value: AMOUNT_OF_TOP_LABELS })
            expect(dispatchSpy).toHaveBeenCalledWith(setFiles({ value: mockedState.files }))
            // the persisted map state is applied BEFORE the files are committed, the persisted files right after
            expect(dispatchedTypes(dispatchSpy)).toEqual([
                setIsLoadingFile.type,
                "SET_AMOUNT_OF_TOP_LABELS",
                filesLoaded.type,
                setFiles.type
            ])
        })

        it("should apply settings and then set files when files in query params differ from files in indexeddb", async () => {
            // Arrange
            const AMOUNT_OF_TOP_LABELS = 600
            const mockedNameDataPairs = [getNameDataPair(TEST_DELTA_MAP_A)]
            mockUrlWithFile()
            mockUrlFiles(mockedNameDataPairs)
            const mockedState = JSON.parse(stringify(defaultState)) as CcState
            mockedState.files = [{ file: TEST_DELTA_MAP_B, selectedAs: FileSelectionState.Partial }]
            mockedState.mapState.amountOfTopLabels = AMOUNT_OF_TOP_LABELS
            mockPersistedState(mockedState)
            const dispatchSpy = jest.spyOn(store, "dispatch")

            // Act
            await loadFilesUseCase.loadOnBoot()

            // Assert
            expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
            expect(mockedErrorDialogService.open).not.toHaveBeenCalled()
            // all settings are applied BEFORE the url files are committed, and the persisted files are never set
            expect(dispatchedTypes(dispatchSpy)).toEqual([setIsLoadingFile.type, "SET_AMOUNT_OF_TOP_LABELS", filesLoaded.type])
        })

        it("should only dispatch the framing actions when the persisted settings equal the current ones and the files differ", async () => {
            // Arrange
            const mockedNameDataPairs = [getNameDataPair(TEST_DELTA_MAP_A)]
            mockUrlWithFile()
            mockUrlFiles(mockedNameDataPairs)
            const mockedState = JSON.parse(stringify(defaultState)) as CcState
            mockedState.files = [{ file: TEST_DELTA_MAP_B, selectedAs: FileSelectionState.Partial }]
            mockPersistedState(mockedState)
            const dispatchSpy = jest.spyOn(store, "dispatch")

            // Act
            await loadFilesUseCase.loadOnBoot()

            // Assert
            expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
            expect(mockedErrorDialogService.open).not.toHaveBeenCalled()
            expect(dispatchedTypes(dispatchSpy)).toEqual([setIsLoadingFile.type, filesLoaded.type])
        })

        it("should set files to delta mode when 'mode=delta' parameter is given", async () => {
            // Arrange
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
            mockUrlWithFile({ renderMode: "Delta" })
            mockUrlFiles(mockedNameDataPairs)
            mockPersistedState(defaultState)
            jest.mocked(getCCFiles).mockImplementation(() => mockedState.files.map(state => state.file))
            const dispatchSpy = jest.spyOn(store, "dispatch")

            // Act
            await loadFilesUseCase.loadOnBoot()

            // Assert
            expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
            expect(mockedErrorDialogService.open).not.toHaveBeenCalled()
            expect(dispatchSpy).toHaveBeenCalledWith(setDelta({ referenceFile: TEST_DELTA_MAP_A, comparisonFile: TEST_DELTA_MAP_B }))
        })

        it("should set metrics from query params if metrics are part of url", async () => {
            // Arrange
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
            mockUrlFiles(mockedNameDataPairs)
            mockPersistedState(defaultState)
            jest.mocked(getCCFiles).mockImplementation(() => mockedState.files.map(state => state.file))
            mockUrlWithFile({
                metrics: { areaMetric: "mcc", heightMetric: "rloc", colorMetric: "functions", edgeMetric: "pairing_rate" }
            })
            const dispatchSpy = jest.spyOn(store, "dispatch")
            store.overrideSelector(metricDataSelector, {
                nodeMetricData: METRIC_DATA,
                edgeMetricData: EDGE_METRIC_DATA,
                nodeEdgeMetricsMap: null
            })
            store.refreshState()

            // Act
            await loadFilesUseCase.loadOnBoot()

            // Assert — the use-case carries the url metrics on the provenance; applying them is the
            // reconciliation's job, where the precedence rule (url > persisted > default) lives.
            expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
            expect(mockedErrorDialogService.open).not.toHaveBeenCalled()
            expect(dispatchSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: "FILES_LOADED",
                    urlMetrics: { areaMetric: "mcc", heightMetric: "rloc", colorMetric: "functions", edgeMetric: "pairing_rate" }
                })
            )
        })
    })

    describe("load files from indexeddb", () => {
        it("should load files from indexeddb when query params do not contain file parameter", async () => {
            // Arrange
            const mockedState = JSON.parse(stringify(defaultState)) as CcState
            mockedState.files = FILE_STATES
            mockUrlWithoutFile()
            mockPersistedState(defaultState)
            const savedFileStates = defaultState.files
            const savedNameDataPairs = savedFileStates.map(fileState => getNameDataPair(fileState.file))
            const dispatchSpy = jest.spyOn(store, "dispatch")

            // Act
            await loadFilesUseCase.loadOnBoot()

            // Assert
            expect(mockedErrorDialogService.open).not.toHaveBeenCalled()
            expect(loadFileService.loadFiles).toHaveBeenCalledWith(savedNameDataPairs)
            expect(dispatchSpy).toHaveBeenCalledWith(setFiles({ value: savedFileStates }))
            // The persisted view slices travel on the provenance; the reconciliation applies them AFTER
            // its file-derived merge, because persisted beats file-derived.
            expect(dispatchSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: filesLoaded.type,
                    source: "indexedDB",
                    restoredSettings: expect.objectContaining({ sharedView: mockedState.sharedView })
                })
            )
        })

        it("should load sample-files when indexeddb is empty", async () => {
            // Arrange
            mockUrlWithoutFile()
            mockPersistedState(null)
            const dispatchSpy = jest.spyOn(store, "dispatch")

            // Act
            await loadFilesUseCase.loadOnBoot()

            // Assert
            expect(loadFileService.loadFiles).toHaveBeenCalledWith([sampleFile1, sampleFile2])
            expect(mockedErrorDialogService.open).not.toHaveBeenCalled()
            expect(dispatchSpy).toHaveBeenCalledWith(
                expect.objectContaining({ type: filesLoaded.type, source: "sample", areSampleFiles: true, restoredSettings: null })
            )
        })

        it("should load sample files when load files from indexeddb throws error", async () => {
            // Arrange
            mockUrlWithoutFile()
            mockPersistedReadError(new Error("Could not read cc-state"))

            // Act
            await loadFilesUseCase.loadOnBoot()

            // Assert
            expect(loadFileService.loadFiles).toHaveBeenCalledWith([sampleFile1, sampleFile2])
            expect(mockedErrorDialogService.open).toHaveBeenCalledWith({
                title: INDEXED_DB_LOAD_ERROR_TITLE,
                message: "Could not read cc-state"
            })
        })

        it("should set currentFilesAreSampleFiles to true if sample files are loaded", async () => {
            // Arrange
            const dispatchSpy = jest.spyOn(store, "dispatch")
            mockUrlWithoutFile()
            mockPersistedReadError(new Error("Could not read cc-state"))

            // Act
            await loadFilesUseCase.loadOnBoot()

            // Assert
            expect(dispatchSpy).toHaveBeenCalledWith(setCurrentFilesAreSampleFiles({ value: true }))
        })

        it("should not set currentFilesAreSampleFiles if files from indexeddb are loaded", async () => {
            // Arrange
            const mockedState = JSON.parse(stringify(defaultState)) as CcState
            mockedState.files = FILE_STATES
            mockUrlWithoutFile()
            mockPersistedState(defaultState)
            const dispatchSpy = jest.spyOn(store, "dispatch")

            // Act
            await loadFilesUseCase.loadOnBoot()

            // Assert
            expect(dispatchSpy).not.toHaveBeenCalledWith(setCurrentFilesAreSampleFiles({ value: true }))
            expect(dispatchSpy).not.toHaveBeenCalledWith(setCurrentFilesAreSampleFiles({ value: false }))
        })

        it("should show an error dialog when the persisted state misses properties the current state has", async () => {
            // Arrange
            const mockedState = JSON.parse(stringify(defaultState)) as CcState
            delete (mockedState.preferences as Partial<Preferences>).experimentalFeaturesEnabled
            mockUrlWithoutFile()
            mockPersistedState(mockedState)

            // Act
            await loadFilesUseCase.loadOnBoot()

            // Assert
            expect(mockedErrorDialogService.open).toHaveBeenCalledWith({
                title: MISSING_PROPERTIES_ERROR_TITLE,
                message: expect.stringContaining("experimentalFeaturesEnabled")
            })
        })

        // Slice 15e removed the fileSettings applier: edges is the only member that was left and it is now a
        // derived dependency-lens selector, not stored state — so there is nothing to apply on load anymore.

        it("should set all differing sharedView", async () => {
            // Arrange
            const mockedNameDataPairs = [getNameDataPair(TEST_DELTA_MAP_A)]
            mockUrlWithFile()
            mockUrlFiles(mockedNameDataPairs)
            const mockedState = JSON.parse(stringify(defaultState)) as CcState
            mockedState.sharedView = nullifyObjectValues(defaultSharedView) as SharedView
            mockPersistedState(mockedState)
            const dispatchSpy = jest.spyOn(store, "dispatch")

            // Act
            await loadFilesUseCase.loadOnBoot()

            // Assert
            expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
            expect(mockedErrorDialogService.open).not.toHaveBeenCalled()
            expect(dispatchSpy).toHaveBeenCalledTimes(countDifferences(mockedState.sharedView, defaultSharedView) + FRAMING_DISPATCH_COUNT)
        })

        it("should set all differing preferences, restoring the sort option but never the sort order", async () => {
            // Arrange
            const mockedNameDataPairs = [getNameDataPair(TEST_DELTA_MAP_A)]
            mockUrlWithFile()
            mockUrlFiles(mockedNameDataPairs)
            const mockedState = JSON.parse(stringify(defaultState)) as CcState
            mockedState.preferences = nullifyObjectValues(defaultPreferences) as Preferences
            // sorting is applied as one object; give it a real value differing from the default so the
            // applier restores the option (setSortingOption) but never the order (a file-explorer UI pref)
            mockedState.preferences.sorting = { option: SortingOption.NUMBER_OF_FILES, orderAscending: false }
            mockPersistedState(mockedState)
            const dispatchSpy = jest.spyOn(store, "dispatch")

            // Act
            await loadFilesUseCase.loadOnBoot()

            // Assert
            expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
            expect(mockedErrorDialogService.open).not.toHaveBeenCalled()
            // the sorting pref dispatches exactly one action (setSortingOption) — the order is never
            // restored on load, so the total equals the differing-key count with no extra sort-order dispatch
            expect(dispatchSpy).toHaveBeenCalledWith(setSortingOption({ value: SortingOption.NUMBER_OF_FILES }))
            expect(dispatchSpy).toHaveBeenCalledTimes(
                countDifferences(mockedState.preferences, defaultPreferences) + FRAMING_DISPATCH_COUNT
            )
        })

        it("should set all differing mapState values", async () => {
            // Arrange
            const mockedNameDataPairs = [getNameDataPair(TEST_DELTA_MAP_A)]
            mockUrlWithFile()
            mockUrlFiles(mockedNameDataPairs)
            const mockedState = JSON.parse(stringify(defaultState)) as CcState
            // Make EVERY mapState value differ from its default, so every key of the applier is exercised
            // (an unmapped key would hit the "Unhandled key" default and fail this test).
            mockedState.mapState = makeAllValuesDiffer(defaultMapState) as MapState
            mockPersistedState(mockedState)
            const dispatchSpy = jest.spyOn(store, "dispatch")

            // Act
            await loadFilesUseCase.loadOnBoot()

            // Assert
            expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
            expect(mockedErrorDialogService.open).not.toHaveBeenCalled()
            expect(dispatchSpy).toHaveBeenCalledWith(setAreaMetric({ value: mockedState.mapState.areaMetric }))
            expect(dispatchSpy).toHaveBeenCalledWith(setColorRange({ value: mockedState.mapState.colorRange }))
            expect(dispatchSpy).toHaveBeenCalledWith(setLayoutAlgorithm({ value: mockedState.mapState.layoutAlgorithm }))
            expect(dispatchSpy).toHaveBeenCalledTimes(countDifferences(mockedState.mapState, defaultMapState) + FRAMING_DISPATCH_COUNT)
        })

        it("should set all differing metricsLensSource values", async () => {
            // Arrange
            const mockedNameDataPairs = [getNameDataPair(TEST_DELTA_MAP_A)]
            mockUrlWithFile()
            mockUrlFiles(mockedNameDataPairs)
            const mockedState = JSON.parse(stringify(defaultState)) as CcState
            mockedState.metricsLensSource = {
                attributeTypes: { rloc: "absolute" },
                attributeDescriptors: { rloc: { title: "Real Lines of Code" } }
            } as unknown as MetricsLensSource
            mockPersistedState(mockedState)
            const dispatchSpy = jest.spyOn(store, "dispatch")

            // Act
            await loadFilesUseCase.loadOnBoot()

            // Assert
            expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
            expect(mockedErrorDialogService.open).not.toHaveBeenCalled()
            expect(dispatchSpy).toHaveBeenCalledWith(setAttributeTypes({ value: mockedState.metricsLensSource.attributeTypes }))
            expect(dispatchSpy).toHaveBeenCalledWith(setAttributeDescriptors({ value: mockedState.metricsLensSource.attributeDescriptors }))
            expect(dispatchSpy).toHaveBeenCalledTimes(
                countDifferences(mockedState.metricsLensSource, defaultMetricsLensSource) + FRAMING_DISPATCH_COUNT
            )
        })

        it("should set all differing dependencyLensSource values", async () => {
            // Arrange
            const mockedNameDataPairs = [getNameDataPair(TEST_DELTA_MAP_A)]
            mockUrlWithFile()
            mockUrlFiles(mockedNameDataPairs)
            const mockedState = JSON.parse(stringify(defaultState)) as CcState
            mockedState.dependencyLensSource = {
                attributeTypes: { pairingRate: "absolute" }
            } as unknown as DependencyLensSource
            mockPersistedState(mockedState)
            const dispatchSpy = jest.spyOn(store, "dispatch")

            // Act
            await loadFilesUseCase.loadOnBoot()

            // Assert
            expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
            expect(mockedErrorDialogService.open).not.toHaveBeenCalled()
            expect(dispatchSpy).toHaveBeenCalledWith(setEdgeAttributeTypes({ value: mockedState.dependencyLensSource.attributeTypes }))
            expect(dispatchSpy).toHaveBeenCalledTimes(
                countDifferences(mockedState.dependencyLensSource, defaultDependencyLensSource) + FRAMING_DISPATCH_COUNT
            )
        })
    })

    describe("reload after reset", () => {
        it("should load the sample files and discard the previous metric selection when no file parameter is present", async () => {
            // Arrange
            mockUrlWithoutFile()
            const dispatchSpy = jest.spyOn(store, "dispatch")

            // Act
            await loadFilesUseCase.reloadAfterReset()

            // Assert — a reset deliberately throws the previous selection away, so the reconciliation must
            // fall back to the computed default even when the old selection is still available.
            expect(loadFileService.loadFiles).toHaveBeenCalledWith([sampleFile1, sampleFile2])
            expect(dispatchSpy).toHaveBeenCalledWith(
                expect.objectContaining({ type: filesLoaded.type, source: "reset", forceDefaultMetrics: true })
            )
        })

        it("should load the files from the url and honour its metrics when a file parameter is present", async () => {
            // Arrange
            const mockedNameDataPairs = [getNameDataPair(TEST_DELTA_MAP_A)]
            mockUrlWithFile({ metrics: { ...NO_URL_METRICS, areaMetric: "mcc" } })
            mockUrlFiles(mockedNameDataPairs)
            const dispatchSpy = jest.spyOn(store, "dispatch")

            // Act
            await loadFilesUseCase.reloadAfterReset()

            // Assert
            expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
            expect(dispatchSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: filesLoaded.type,
                    source: "reset",
                    urlMetrics: expect.objectContaining({ areaMetric: "mcc" })
                })
            )
        })

        it("should raise the error dialog and fall back to the sample files when the url load fails", async () => {
            // Arrange
            mockUrlWithFile()
            mockUrlLoadError(new Error("could not be loaded"))

            // Act
            await loadFilesUseCase.reloadAfterReset()

            // Assert — the old reset dialog swallowed this error silently
            expect(mockedErrorDialogService.open).toHaveBeenCalledWith(expect.objectContaining({ title: URL_LOAD_ERROR_TITLE }))
            expect(loadFileService.loadFiles).toHaveBeenCalledWith([sampleFile1, sampleFile2])
        })
    })
})

function nullifyObjectValues(originalObject) {
    return Object.keys(originalObject).reduce((accumulator, key) => {
        accumulator[key] = null
        return accumulator
    }, {})
}

// Produces a shallow copy of the given state object in which every value is guaranteed to differ from
// the original — unlike nullifyObjectValues, this also exercises keys whose default is already null
// (e.g. the mapState metric keys), which nullifying would leave equal to their default.
function makeAllValuesDiffer<T extends object>(source: T): T {
    const result = {}
    for (const [key, value] of Object.entries(source)) {
        if (typeof value === "boolean") {
            result[key] = !value
        } else if (typeof value === "number") {
            result[key] = value + 1
        } else if (typeof value === "string") {
            result[key] = `${value}_changed`
        } else if (value === null) {
            result[key] = "changed"
        } else if (Array.isArray(value)) {
            result[key] = [...value, "changed"]
        } else {
            result[key] = { ...value, __changed: true }
        }
    }
    return result as T
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
