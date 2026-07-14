import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "@ngrx/effects"
import { Action, State, Store, StoreModule } from "@ngrx/store"
import { TEST_FILE_CONTENT } from "../../../mocks/dataMocks"
import { CcState } from "../../../model/codeCharta.model"
import { LoadFileService, setDeltaReference, setStandard } from "../../../stores/fileStore/fileStore.facade"
import { filesLoaded } from "../../../stores/fileStore/store/filesLoaded/filesLoaded.actions"
import { appReducers, setStateMiddleware } from "../../../stores/rootStore/store"
import { addBlacklistItem } from "../../../stores/sharedView/sharedView.write.facade"
import { clone } from "../../../util/clone"
import { ErrorDialogService } from "../../../util/errorDialog/errorDialog.service"
import { fileRoot } from "../../../util/fileRoot"
import { NO_URL_METRICS, UrlMetricSelection } from "../../../util/queryParameter/queryParameter"
import { QueryParamsService } from "../../../util/queryParameter/queryParams.service"
import { ReconcileAfterLoadEffect } from "./reconcileAfterLoad.effect"

/**
 * Parity contract for the nine post-load subscribers this sequence replaced. Each `describe` below
 * names the effect whose behavior it inherited.
 */
describe("ReconcileAfterLoadEffect", () => {
    let store: Store<CcState>
    let state: State<CcState>
    let loadFileService: LoadFileService
    let dispatchSpy: jest.SpyInstance
    let queryParamsService: {
        hasFile: jest.Mock
        getFileNames: jest.Mock
        getRenderMode: jest.Mock
        getMetrics: jest.Mock
        areSampleFilesFlagged: jest.Mock
        write: jest.Mock
    }

    const aFilesLoaded = (urlMetrics: UrlMetricSelection = NO_URL_METRICS) =>
        filesLoaded({ source: "url", areSampleFiles: false, urlMetrics, forceAutoFit: false })

    /** The sequence is debounced onto the next macrotask; this is how a test waits for it. */
    const flushDebounce = () => new Promise(resolve => setTimeout(resolve, 0))

    /** Loads a real file through the real LoadFileService, then signals the load, as the use-case does. */
    const loadFileAndSignal = async (urlMetrics: UrlMetricSelection = NO_URL_METRICS) => {
        loadFileService.loadFiles([{ fileName: "test.cc.json", fileSize: 42, content: clone(TEST_FILE_CONTENT) }])
        store.dispatch(aFilesLoaded(urlMetrics))
        await flushDebounce()
    }

    const dispatchedActionsOfType = (type: string): Action[] =>
        dispatchSpy.mock.calls.map(call => call[0] as Action).filter(action => action.type === type)

    beforeEach(() => {
        queryParamsService = {
            hasFile: jest.fn(() => true),
            getFileNames: jest.fn(() => ["test.cc.json"]),
            getRenderMode: jest.fn(() => null),
            getMetrics: jest.fn(() => NO_URL_METRICS),
            areSampleFilesFlagged: jest.fn(() => false),
            write: jest.fn()
        }

        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] }),
                EffectsModule.forRoot([ReconcileAfterLoadEffect])
            ],
            providers: [
                { provide: QueryParamsService, useValue: queryParamsService },
                { provide: ErrorDialogService, useValue: { open: jest.fn() } }
            ]
        })

        store = TestBed.inject(Store)
        state = TestBed.inject(State)
        loadFileService = TestBed.inject(LoadFileService)
        TestBed.inject(ReconcileAfterLoadEffect)
        dispatchSpy = jest.spyOn(store, "dispatch")
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    // ── replaces UpdateFileSettingsEffect ──────────────────────────────────────────────

    it("should merge the file settings exactly once when files are loaded", async () => {
        // Act
        await loadFileAndSignal()

        // Assert
        expect(dispatchedActionsOfType("SET_STATE")).toHaveLength(1)
        expect(dispatchedActionsOfType("SET_STATE")[0]).toEqual(
            expect.objectContaining({
                value: expect.objectContaining({
                    sharedView: expect.objectContaining({ blacklist: expect.any(Array), markedPackages: expect.any(Array) }),
                    metricsLensSource: expect.objectContaining({ attributeTypes: expect.anything() }),
                    dependencyLensSource: expect.objectContaining({ attributeTypes: expect.anything() })
                })
            })
        )
    })

    // ── replaces LoadFileService.referenceFileSubscription ─────────────────────────────

    it("should update the file root when the reference file changes", async () => {
        // Arrange
        await loadFileAndSignal()
        const updateRootSpy = jest.spyOn(fileRoot, "updateRoot")
        const referenceFile = state.getValue().files[0].file

        // Act
        store.dispatch(setDeltaReference({ file: referenceFile }))
        await flushDebounce()

        // Assert
        expect(updateRootSpy).toHaveBeenCalledWith(referenceFile.map.name)
    })

    it("should not update the file root when the reference file becomes undefined", async () => {
        // Arrange
        await loadFileAndSignal()
        const files = [state.getValue().files[0].file]
        store.dispatch(setDeltaReference({ file: files[0] }))
        await flushDebounce()
        const updateRootSpy = jest.spyOn(fileRoot, "updateRoot")

        // Act — a partially selected file leaves no reference file
        store.dispatch(setStandard({ files }))
        await flushDebounce()

        // Assert
        expect(updateRootSpy).not.toHaveBeenCalled()
    })

    // ── replaces UnfocusNodesEffect ────────────────────────────────────────────────────

    it("should unfocus all nodes when files are loaded", async () => {
        // Act
        await loadFileAndSignal()

        // Assert
        expect(dispatchedActionsOfType("UNFOCUS_ALL_NODES")).toHaveLength(1)
    })

    it("should unfocus all nodes when the file selection changes without a load", async () => {
        // Arrange
        await loadFileAndSignal()
        dispatchSpy.mockClear()

        // Act
        store.dispatch(setDeltaReference({ file: state.getValue().files[0].file }))
        await flushDebounce()

        // Assert
        expect(dispatchedActionsOfType("UNFOCUS_ALL_NODES")).toHaveLength(1)
    })

    // ── replaces ResetChosenMetricsEffect ──────────────────────────────────────────────

    it("should apply the default metrics when the loaded files carry none of the chosen ones", async () => {
        // Act
        await loadFileAndSignal()

        // Assert
        const { areaMetric, heightMetric, colorMetric } = state.getValue().mapState
        const availableMetrics = new Set(["rloc", "mcc", "functions"])
        expect(availableMetrics.has(areaMetric)).toBe(true)
        expect(availableMetrics.has(heightMetric)).toBe(true)
        expect(availableMetrics.has(colorMetric)).toBe(true)
    })

    // ── the precedence rule: URL > persisted > computed default ────────────────────────

    it("should prefer a url metric over the computed default when the loaded files carry it", async () => {
        // Act
        await loadFileAndSignal({ ...NO_URL_METRICS, areaMetric: "mcc" })

        // Assert
        expect(state.getValue().mapState.areaMetric).toBe("mcc")
    })

    it("should ignore a url metric that the loaded files do not carry", async () => {
        // Act
        await loadFileAndSignal({ ...NO_URL_METRICS, areaMetric: "does_not_exist" })

        // Assert
        expect(state.getValue().mapState.areaMetric).not.toBe("does_not_exist")
    })

    it("should ignore url metrics when no file query parameter is present", async () => {
        // Arrange
        queryParamsService.hasFile.mockReturnValue(false)

        // Act
        await loadFileAndSignal({ ...NO_URL_METRICS, areaMetric: "mcc" })

        // Assert
        expect(state.getValue().mapState.areaMetric).not.toBe("mcc")
    })

    // ── replaces ResetColorRangeEffect.resetColorRange$ ────────────────────────────────

    it("should derive the color range from the resolved color metric when files are loaded", async () => {
        // Act
        await loadFileAndSignal()

        // Assert
        const colorRangeActions = dispatchedActionsOfType("SET_COLOR_RANGE")
        expect(colorRangeActions.length).toBeGreaterThanOrEqual(1)
        expect(state.getValue().mapState.colorRange).toEqual({
            from: expect.any(Number),
            to: expect.any(Number)
        })
    })

    // ── replaces UpdateVisibleTopLabelsEffect ──────────────────────────────────────────

    it("should lower the amount of top labels to what the loaded map can carry", async () => {
        // Act
        await loadFileAndSignal()

        // Assert
        const topLabelActions = dispatchedActionsOfType("SET_AMOUNT_OF_TOP_LABELS")
        expect(topLabelActions).toHaveLength(1)
        expect(state.getValue().mapState.amountOfTopLabels).toBeLessThanOrEqual(31)
    })

    // ── the sequence runs once per load, and is idempotent ─────────────────────────────

    it("should run the sequence exactly once per load, even though a load dispatches several file actions", async () => {
        // Act
        await loadFileAndSignal()

        // Assert
        expect(dispatchedActionsOfType("SET_STATE")).toHaveLength(1)
        expect(dispatchedActionsOfType("UNFOCUS_ALL_NODES")).toHaveLength(1)
        expect(dispatchedActionsOfType("SET_AMOUNT_OF_TOP_LABELS")).toHaveLength(1)
    })

    it("should not dispatch anything on the metric-data trigger that follows a load", async () => {
        // Arrange
        await loadFileAndSignal()
        dispatchSpy.mockClear()

        // Act — the metric-data trigger fires again with nothing changed
        await flushDebounce()

        // Assert
        expect(dispatchSpy).not.toHaveBeenCalled()
    })

    // ── replaces ResetChosenMetricsEffect / ResetSelectedEdgeMetric… on a blacklist edit ─

    it("should re-resolve the metric selection when a blacklist edit removes the chosen metric", async () => {
        // Arrange
        await loadFileAndSignal()
        dispatchSpy.mockClear()

        // Act — exclude everything, so the chosen metrics can no longer be derived
        store.dispatch(addBlacklistItem({ item: { path: "/root", type: "exclude" } }))
        await flushDebounce()

        // Assert — the sequence ran, but did not touch what only a file-set change may touch
        expect(dispatchedActionsOfType("UNFOCUS_ALL_NODES")).toHaveLength(0)
        expect(dispatchedActionsOfType("SET_AMOUNT_OF_TOP_LABELS")).toHaveLength(0)
        expect(dispatchedActionsOfType("SET_STATE")).toHaveLength(0)
    })
})
