import { HttpClient } from "@angular/common/http"
import { TestBed } from "@angular/core/testing"
import { State, StoreModule } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { waitFor } from "@testing-library/angular"
import stringify from "safe-stable-stringify"
import { CcState, DependencyLensSource, MapState, MetricsLensSource, Preferences, SharedView, SortingOption } from "../model/codeCharta.model"
import { FileSelectionState } from "../model/files/files"
import { getCCFiles } from "../model/files/files.helper"
import { MetricQueryParemter } from "../util/queryParameter/metricQueryParameter"
import { metricDataSelector } from "../renderer/renderModel/accumulatedData/metricData/metricData.selector"
import { defaultPreferences } from "../stores/preferences/preferences.read.facade"
import { setSortingOption } from "../stores/preferences/preferences.write.facade"
import {
    setAreaMetric,
    setColorMetric,
    setColorRange,
    setEdgeMetric,
    setHeightMetric,
    setLayoutAlgorithm
} from "../stores/mapState/mapState.write.facade"
import { defaultMapState } from "../stores/mapState/mapState.read.facade"
import { defaultMetricsLensSource, setAttributeDescriptors, setAttributeTypes } from "../lenses/metrics/metricsLens.load.facade"
import { defaultDependencyLensSource, setEdgeAttributeTypes } from "../lenses/dependency/dependencyLens.load.facade"
import { defaultSharedView } from "../stores/sharedView/sharedView.read.facade"
import { setDelta, setFiles } from "../stores/fileStore/store/files.actions"
import { appReducers, setStateMiddleware } from "../store/store"
import { defaultState } from "../store/state.manager"
import { EDGE_METRIC_DATA, FILE_STATES, METRIC_DATA, TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../mocks/dataMocks"
import { readCcState } from "../store/indexedDB/indexedDBWriter"
import { getLastAction } from "../util/testUtils/store.utils"
import { ErrorDialogService } from "../util/errorDialog/errorDialog.service"
import { getNameDataPair } from "../stores/fileStore/loaders/ccJson/util/fileParser"
import { LoadFileService } from "../stores/fileStore/loaders/ccJson/services/loadFile.service"
import { LoadInitialFileService } from "./loadInitialFile.service"
import { sampleFile1, sampleFile2 } from "../stores/fileStore/loaders/ccJson/sampleFiles"
import { UrlExtractor } from "../stores/fileStore/loaders/ccJson/util/urlExtractor"
import { setCurrentFilesAreSampleFiles } from "../stores/fileStore/store/currentFilesAreSampleFiles/currentFilesAreSampleFiles.actions"

jest.mock("../stores/fileStore/loaders/ccJson/util/urlExtractor")
jest.mock("../model/files/files.helper")
jest.mock("../store/indexedDB/indexedDBWriter")

describe("LoadInitialFileService", () => {
    let store: MockStore
    let loadFileService: LoadFileService
    let loadInitialFileService: LoadInitialFileService
    let mockedErrorDialogService: ErrorDialogService

    beforeEach(() => {
        mockedErrorDialogService = { open: jest.fn() } as unknown as ErrorDialogService

        TestBed.configureTestingModule({
            imports: [[StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]],
            providers: [
                { provide: ErrorDialogService, useValue: mockedErrorDialogService },
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
            expect(mockedErrorDialogService.open).not.toHaveBeenCalled()
        })

        it("should load sample files when load files from query params throws error", async () => {
            jest.mocked(UrlExtractor.prototype.getParameterByName).mockImplementation(() => "filename")
            jest.mocked(UrlExtractor.prototype.getFileDataFromQueryParam).mockImplementation(() => {
                throw new Error("files could not be loaded from query param")
            })

            await loadInitialFileService.loadFilesOrSampleFiles()

            expect(loadFileService.loadFiles).toHaveBeenCalledWith([sampleFile1, sampleFile2])
            expect(mockedErrorDialogService.open).toHaveBeenCalled()
        })

        it("should dispatch currentFilesAreSampleFiles when query param currentFilesAreSampleFiles is true", async () => {
            const dispatchSpy = jest.spyOn(store, "dispatch")
            jest.mocked(UrlExtractor.prototype.getParameterByName).mockImplementation(queryParameter => {
                if (queryParameter === MetricQueryParemter.currentFilesAreSampleFiles) {
                    return "true"
                }
                return "filename"
            })

            await loadInitialFileService.loadFilesOrSampleFiles()

            expect(dispatchSpy).toHaveBeenCalledWith(setCurrentFilesAreSampleFiles({ value: true }))
        })

        it("should not dispatch currentFilesAreSampleFiles when query param currentFilesAreSampleFiles is not existent", async () => {
            const dispatchSpy = jest.spyOn(store, "dispatch")
            jest.mocked(UrlExtractor.prototype.getParameterByName).mockImplementation(queryParameter => {
                if (queryParameter === MetricQueryParemter.currentFilesAreSampleFiles) {
                    return undefined
                }
                return "filename"
            })

            await loadInitialFileService.loadFilesOrSampleFiles()

            expect(dispatchSpy).not.toHaveBeenCalledWith(
                setCurrentFilesAreSampleFiles({ value: true }),
                setCurrentFilesAreSampleFiles({ value: false })
            )
        })

        it("should set currentFilesAreSampleFiles to true if sample files are loaded", async () => {
            const dispatchSpy = jest.spyOn(store, "dispatch")

            jest.mocked(UrlExtractor.prototype.getParameterByName).mockImplementation(() => "filename")
            jest.mocked(UrlExtractor.prototype.getFileDataFromQueryParam).mockImplementation(() => {
                throw new Error("files could not be loaded from query param")
            })

            await loadInitialFileService.loadFilesOrSampleFiles()

            expect(dispatchSpy).toHaveBeenCalledWith(setCurrentFilesAreSampleFiles({ value: true }))
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
            mockedState.mapState.amountOfTopLabels = AMOUNT_OF_TOP_LABELS
            jest.mocked(readCcState).mockImplementation(async () => new Promise(resolve => resolve(mockedState)))
            jest.mocked(getCCFiles).mockImplementation(() => defaultState.files.map(state => state.file))

            await loadInitialFileService.loadFilesOrSampleFiles()

            expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
            expect(mockedErrorDialogService.open).not.toHaveBeenCalled()
            // asserted as a plain action literal (not the setAmountOfTopLabels creator): amountOfTopLabels
            // now lives in the appearance module, which fileStore must not import (filestore-has-no-upward-deps)
            expect(await getLastAction(store)).toEqual({ type: "SET_AMOUNT_OF_TOP_LABELS", value: AMOUNT_OF_TOP_LABELS })
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
            expect(mockedErrorDialogService.open).not.toHaveBeenCalled()
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
            expect(mockedErrorDialogService.open).not.toHaveBeenCalled()
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
            expect(mockedErrorDialogService.open).not.toHaveBeenCalled()

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

            expect(mockedErrorDialogService.open).not.toHaveBeenCalled()
            expect(loadFileService.loadFiles).toHaveBeenCalledWith(savedNameDataPairs)
            expect(dispatchSpy).toHaveBeenCalledWith(setFiles({ value: savedFileStates }))
        })
        it("should load sample-files when indexeddb is empty", async () => {
            jest.mocked(UrlExtractor.prototype.getParameterByName).mockImplementation(() => null)
            jest.mocked(readCcState).mockImplementation(async () => new Promise(resolve => resolve(null)))
            await loadInitialFileService.loadFilesOrSampleFiles()

            expect(loadFileService.loadFiles).toHaveBeenCalledWith([sampleFile1, sampleFile2])
            expect(mockedErrorDialogService.open).not.toHaveBeenCalled()
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
            expect(mockedErrorDialogService.open).toHaveBeenCalled()
        })

        it("should set currentFilesAreSampleFiles to true if sample files are loaded", async () => {
            const dispatchSpy = jest.spyOn(store, "dispatch")

            jest.mocked(UrlExtractor.prototype.getParameterByName).mockImplementation(() => null)
            jest.mocked(readCcState).mockImplementation(
                async () =>
                    new Promise(() => {
                        throw new Error("Could not read cc-state")
                    })
            )

            await loadInitialFileService.loadFilesOrSampleFiles()

            expect(dispatchSpy).toHaveBeenCalledWith(setCurrentFilesAreSampleFiles({ value: true }))
        })

        it("should not set currentFilesAreSampleFiles if files from indexeddb are loaded", async () => {
            const mockedState = JSON.parse(stringify(defaultState)) as CcState
            mockedState.files = FILE_STATES
            jest.mocked(UrlExtractor.prototype.getParameterByName).mockImplementation(() => null)
            jest.mocked(readCcState).mockImplementation(async () => new Promise(resolve => resolve(defaultState)))
            const dispatchSpy = jest.spyOn(store, "dispatch")
            await loadInitialFileService.loadFilesOrSampleFiles()

            expect(dispatchSpy).not.toHaveBeenCalledWith(setCurrentFilesAreSampleFiles({ value: true }))
            expect(dispatchSpy).not.toHaveBeenCalledWith(setCurrentFilesAreSampleFiles({ value: false }))
        })

        // Slice 15e removed the fileSettings applier: edges is the only member that was left and it is now a
        // derived dependency-lens selector, not stored state — so there is nothing to apply on load anymore.

        it("should set all differing sharedView", async () => {
            const mockedNameDataPairs = [getNameDataPair(TEST_DELTA_MAP_A)]
            jest.mocked(UrlExtractor.prototype.getParameterByName).mockImplementation(() => "filename")
            jest.mocked(UrlExtractor.prototype.getFileDataFromQueryParam).mockImplementation(
                async () => new Promise(resolve => resolve(mockedNameDataPairs))
            )
            const mockedState = JSON.parse(stringify(defaultState)) as CcState
            mockedState.sharedView = nullifyObjectValues(defaultSharedView) as SharedView
            jest.mocked(readCcState).mockImplementation(async () => new Promise(resolve => resolve(mockedState)))
            jest.mocked(getCCFiles).mockImplementation(() => defaultState.files.map(state => state.file))
            const dispatchSpy = jest.spyOn(store, "dispatch")

            await loadInitialFileService.loadFilesOrSampleFiles()

            expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
            expect(mockedErrorDialogService.open).not.toHaveBeenCalled()
            expect(dispatchSpy).toHaveBeenCalledTimes(countDifferences(mockedState.sharedView, defaultSharedView))
        })

        it("should set all differing preferences, restoring the sort option but never the sort order", async () => {
            const mockedNameDataPairs = [getNameDataPair(TEST_DELTA_MAP_A)]
            jest.mocked(UrlExtractor.prototype.getParameterByName).mockImplementation(() => "filename")
            jest.mocked(UrlExtractor.prototype.getFileDataFromQueryParam).mockImplementation(
                async () => new Promise(resolve => resolve(mockedNameDataPairs))
            )
            const mockedState = JSON.parse(stringify(defaultState)) as CcState
            mockedState.preferences = nullifyObjectValues(defaultPreferences) as Preferences
            // sorting is applied as one object; give it a real value differing from the default so the
            // applier restores the option (setSortingOption) but never the order (a file-explorer UI pref)
            mockedState.preferences.sorting = { option: SortingOption.NUMBER_OF_FILES, orderAscending: false }
            jest.mocked(readCcState).mockImplementation(async () => new Promise(resolve => resolve(mockedState)))
            jest.mocked(getCCFiles).mockImplementation(() => defaultState.files.map(state => state.file))
            const dispatchSpy = jest.spyOn(store, "dispatch")

            await loadInitialFileService.loadFilesOrSampleFiles()

            expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
            expect(mockedErrorDialogService.open).not.toHaveBeenCalled()
            // the sorting pref dispatches exactly one action (setSortingOption) — the order is never
            // restored on load, so the total equals the differing-key count with no extra sort-order dispatch
            expect(dispatchSpy).toHaveBeenCalledWith(setSortingOption({ value: SortingOption.NUMBER_OF_FILES }))
            expect(dispatchSpy).toHaveBeenCalledTimes(countDifferences(mockedState.preferences, defaultPreferences))
        })

        it("should set all differing mapState values but never restore the runtime-only isLoadingMap flag", async () => {
            // Arrange
            const mockedNameDataPairs = [getNameDataPair(TEST_DELTA_MAP_A)]
            jest.mocked(UrlExtractor.prototype.getParameterByName).mockImplementation(() => "filename")
            jest.mocked(UrlExtractor.prototype.getFileDataFromQueryParam).mockImplementation(
                async () => new Promise(resolve => resolve(mockedNameDataPairs))
            )
            const mockedState = JSON.parse(stringify(defaultState)) as CcState
            // Make EVERY mapState value differ from its default — including the runtime-only isLoadingMap
            // flag — so the applier's skip-isLoadingMap branch is genuinely exercised (were it dropped from
            // ignoredMapStateKeys, the applier would hit the "Unhandled key" default and this test would fail).
            mockedState.mapState = makeAllValuesDiffer(defaultMapState) as MapState
            jest.mocked(readCcState).mockImplementation(async () => new Promise(resolve => resolve(mockedState)))
            jest.mocked(getCCFiles).mockImplementation(() => defaultState.files.map(state => state.file))
            const dispatchSpy = jest.spyOn(store, "dispatch")

            // Act
            await loadInitialFileService.loadFilesOrSampleFiles()

            // Assert
            expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
            expect(mockedErrorDialogService.open).not.toHaveBeenCalled()
            expect(dispatchSpy).toHaveBeenCalledWith(setAreaMetric({ value: mockedState.mapState.areaMetric }))
            expect(dispatchSpy).toHaveBeenCalledWith(setColorRange({ value: mockedState.mapState.colorRange }))
            expect(dispatchSpy).toHaveBeenCalledWith(setLayoutAlgorithm({ value: mockedState.mapState.layoutAlgorithm }))
            // isLoadingMap differs too but is deliberately NOT restored, so exactly one differing key is
            // skipped: the restore-dispatch count is the differing-key count minus that one.
            expect(dispatchSpy).toHaveBeenCalledTimes(countDifferences(mockedState.mapState, defaultMapState) - 1)
        })

        it("should set all differing metricsLensSource values", async () => {
            // Arrange
            const mockedNameDataPairs = [getNameDataPair(TEST_DELTA_MAP_A)]
            jest.mocked(UrlExtractor.prototype.getParameterByName).mockImplementation(() => "filename")
            jest.mocked(UrlExtractor.prototype.getFileDataFromQueryParam).mockImplementation(
                async () => new Promise(resolve => resolve(mockedNameDataPairs))
            )
            const mockedState = JSON.parse(stringify(defaultState)) as CcState
            mockedState.metricsLensSource = {
                attributeTypes: { nodes: { rloc: "absolute" }, edges: {} },
                attributeDescriptors: { rloc: { title: "Real Lines of Code" } }
            } as unknown as MetricsLensSource
            jest.mocked(readCcState).mockImplementation(async () => new Promise(resolve => resolve(mockedState)))
            jest.mocked(getCCFiles).mockImplementation(() => defaultState.files.map(state => state.file))
            const dispatchSpy = jest.spyOn(store, "dispatch")

            // Act
            await loadInitialFileService.loadFilesOrSampleFiles()

            // Assert
            expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
            expect(mockedErrorDialogService.open).not.toHaveBeenCalled()
            expect(dispatchSpy).toHaveBeenCalledWith(setAttributeTypes({ value: mockedState.metricsLensSource.attributeTypes }))
            expect(dispatchSpy).toHaveBeenCalledWith(setAttributeDescriptors({ value: mockedState.metricsLensSource.attributeDescriptors }))
            expect(dispatchSpy).toHaveBeenCalledTimes(countDifferences(mockedState.metricsLensSource, defaultMetricsLensSource))
        })

        it("should set all differing dependencyLensSource values", async () => {
            // Arrange
            const mockedNameDataPairs = [getNameDataPair(TEST_DELTA_MAP_A)]
            jest.mocked(UrlExtractor.prototype.getParameterByName).mockImplementation(() => "filename")
            jest.mocked(UrlExtractor.prototype.getFileDataFromQueryParam).mockImplementation(
                async () => new Promise(resolve => resolve(mockedNameDataPairs))
            )
            const mockedState = JSON.parse(stringify(defaultState)) as CcState
            mockedState.dependencyLensSource = {
                attributeTypes: { nodes: {}, edges: { pairingRate: "absolute" } }
            } as unknown as DependencyLensSource
            jest.mocked(readCcState).mockImplementation(async () => new Promise(resolve => resolve(mockedState)))
            jest.mocked(getCCFiles).mockImplementation(() => defaultState.files.map(state => state.file))
            const dispatchSpy = jest.spyOn(store, "dispatch")

            // Act
            await loadInitialFileService.loadFilesOrSampleFiles()

            // Assert
            expect(loadFileService.loadFiles).toHaveBeenCalledWith(mockedNameDataPairs)
            expect(mockedErrorDialogService.open).not.toHaveBeenCalled()
            expect(dispatchSpy).toHaveBeenCalledWith(setEdgeAttributeTypes({ value: mockedState.dependencyLensSource.attributeTypes }))
            expect(dispatchSpy).toHaveBeenCalledTimes(countDifferences(mockedState.dependencyLensSource, defaultDependencyLensSource))
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
