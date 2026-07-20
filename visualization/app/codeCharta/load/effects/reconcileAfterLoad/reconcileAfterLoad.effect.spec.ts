import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "@ngrx/effects"
import { Action, State, Store, StoreModule } from "@ngrx/store"
import { TEST_FILE_CONTENT, TEST_FILE_CONTENT_CC_JSON_2_DOMAIN_A, TEST_FILE_CONTENT_CC_JSON_2_DOMAIN_B } from "../../../mocks/dataMocks"
import { CcState, SharedView } from "../../../model/codeCharta.model"
import { defaultDependencyLensSource } from "../../../stores/dependencyLensSource/dependencyLensSource.read.facade"
import { defaultDomainLensSource } from "../../../stores/domainLensSource/domainLensSource.read.facade"
import { LoadFileService, RestoredSettings, setDeltaReference, setStandard } from "../../../stores/fileStore/fileStore.facade"
import { filesLoaded } from "../../../stores/fileStore/store/filesLoaded/filesLoaded.actions"
import { defaultMetricsLensSource } from "../../../stores/metricsLensSource/metricsLensSource.read.facade"
import { appReducers, setStateMiddleware } from "../../../stores/rootStore/store"
import { defaultSharedView } from "../../../stores/sharedView/sharedView.read.facade"
import { addBlacklistItem, setAllFocusedNodes } from "../../../stores/sharedView/sharedView.write.facade"
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
    const DOMAIN_FILE_NAME_A = "domainA.cc.json"
    const DOMAIN_FILE_NAME_B = "domainB.cc.json"

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

    const aFilesLoaded = (urlMetrics: UrlMetricSelection = NO_URL_METRICS, restoredSettings: RestoredSettings | null = null) =>
        filesLoaded({
            source: "url",
            areSampleFiles: false,
            urlMetrics,
            forceAutoFit: false,
            forceDefaultMetrics: false,
            restoredSettings
        })

    /** A persisted session carrying the view state that only the persisted state can hold. */
    const aRestoredSettings = (sharedView: Partial<SharedView>): RestoredSettings => ({
        sharedView: { ...defaultSharedView, ...sharedView },
        metricsLensSource: defaultMetricsLensSource,
        dependencyLensSource: defaultDependencyLensSource,
        domainLensSource: defaultDomainLensSource
    })

    /** The sequence is debounced onto the next macrotask; this is how a test waits for it. */
    const flushDebounce = () => new Promise(resolve => setTimeout(resolve, 0))

    /** Loads a real file through the real LoadFileService, then signals the load, as the use-case does. */
    const loadFileAndSignal = async (urlMetrics: UrlMetricSelection = NO_URL_METRICS, restoredSettings: RestoredSettings | null = null) => {
        loadFileService.loadFiles([{ fileName: "test.cc.json", fileSize: 42, content: clone(TEST_FILE_CONTENT) }])
        store.dispatch(aFilesLoaded(urlMetrics, restoredSettings))
        await flushDebounce()
    }

    /** Loads the two domain-lens maps together, so the merger runs in multiple mode over both banks. */
    const loadDomainLensFilesAndSignal = async () => {
        loadFileService.loadFiles([
            { fileName: DOMAIN_FILE_NAME_A, fileSize: 42, content: clone(TEST_FILE_CONTENT_CC_JSON_2_DOMAIN_A) },
            { fileName: DOMAIN_FILE_NAME_B, fileSize: 42, content: clone(TEST_FILE_CONTENT_CC_JSON_2_DOMAIN_B) }
        ])
        store.dispatch(aFilesLoaded())
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
                    dependencyLensSource: expect.objectContaining({ attributeTypes: expect.anything() }),
                    domainLensSource: expect.objectContaining({ words: expect.anything() })
                })
            })
        )
    })

    it("should merge the domain words of all loaded files, re-keyed onto the aggregated map's paths", async () => {
        // Act
        await loadDomainLensFilesAndSignal()

        // Assert — each file's bank under its own subtree, plus the summed bank on the aggregated root
        expect(state.getValue().domainLensSource.words).toEqual({
            "/root": [
                { text: "payment", frequency: 10, tfidf: 0.4 },
                { text: "shipping", frequency: 3 }
            ],
            [`/root/${DOMAIN_FILE_NAME_A}`]: [{ text: "payment", frequency: 4, tfidf: 0.4 }],
            [`/root/${DOMAIN_FILE_NAME_A}/big.ts`]: [{ text: "invoice", frequency: 2 }],
            [`/root/${DOMAIN_FILE_NAME_B}`]: [
                { text: "payment", frequency: 6, tfidf: 0.2 },
                { text: "shipping", frequency: 3 }
            ],
            [`/root/${DOMAIN_FILE_NAME_B}/small.ts`]: [{ text: "cart", frequency: 5 }]
        })
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

    // ── the restored session beats everything derived from the files ──────────────────
    //
    // A user's exclusions, marked packages and focus live ONLY in the persisted state — they are never
    // written back into a file's own fileSettings. The old effects merged the file settings synchronously
    // INSIDE setFiles, i.e. before the persisted state was restored, so the restore won. The sequence runs
    // one macrotask later, so it has to apply the restored session last, or it would erase all three.

    it("should keep the restored blacklist when files are loaded from a persisted session", async () => {
        // Arrange
        const restoredSettings = aRestoredSettings({
            blacklist: [{ path: "/root/excluded", type: "exclude" }]
        })

        // Act
        await loadFileAndSignal(NO_URL_METRICS, restoredSettings)

        // Assert
        expect(state.getValue().sharedView.blacklist).toEqual([{ path: "/root/excluded", type: "exclude" }])
    })

    it("should keep the restored marked packages when files are loaded from a persisted session", async () => {
        // Arrange
        const restoredSettings = aRestoredSettings({
            markedPackages: [{ path: "/root", color: "#ff0000" }]
        })

        // Act
        await loadFileAndSignal(NO_URL_METRICS, restoredSettings)

        // Assert
        expect(state.getValue().sharedView.markedPackages).toEqual([{ path: "/root", color: "#ff0000" }])
    })

    it("should keep the restored focused node when files are loaded from a persisted session", async () => {
        // Arrange
        const restoredSettings = aRestoredSettings({ focusedNodePath: ["/root/focused"] })

        // Act
        await loadFileAndSignal(NO_URL_METRICS, restoredSettings)

        // Assert — step 5 unfocuses, and the restore then puts the focus back
        expect(state.getValue().sharedView.focusedNodePath).toEqual(["/root/focused"])
    })

    it("should still unfocus the nodes when the load does not restore a persisted session", async () => {
        // Arrange
        store.dispatch(setAllFocusedNodes({ value: ["/root/stale"] }))

        // Act
        await loadFileAndSignal()

        // Assert
        expect(state.getValue().sharedView.focusedNodePath).toEqual([])
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
